'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { GameImage, Guess } from '@/types'
import { saveGuess, getStats, clearStats } from '@/lib/storage'
import GameStats from '@/components/GameStats'

export default function Home() {
  const [currentImage, setCurrentImage] = useState<GameImage | null>(null)
  const [loading, setLoading] = useState(false)
  const [guessedPrompt, setGuessedPrompt] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [stats, setStats] = useState(() => {
    // Initialize with default stats to avoid hydration mismatch
    // Stats will be loaded from localStorage after mount
    return {
      totalGuesses: 0,
      correctGuesses: 0,
      accuracy: 0,
    }
  })
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [gameRound, setGameRound] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameStats, setGameStats] = useState({ correct: 0, total: 0 })

  const generateNewImage = async () => {
    console.log('Generate New Image function called')
    if (loading) {
      console.log('Already loading, ignoring click')
      return
    }
    
    // Check if game is over
    if (gameRound >= 5) {
      setGameOver(true)
      return
    }
    
    setLoading(true)
    setError(null)
    setGuessedPrompt(null)
    setShowResult(false)
    
    try {
      console.log('Making API request to /api/generate')
      // Create an AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 180000) // 3 minutes timeout
      
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
          signal: controller.signal,
        })
        
        console.log('API response received:', response.status, response.ok)
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || `Failed to generate image (${response.status})`)
        }
        
        const data = await response.json()
        setCurrentImage({
          id: Date.now().toString(),
          imageUrl: data.imageUrl,
          actualPrompt: data.actualPrompt,
          promptOptions: data.promptOptions,
          createdAt: new Date(),
        })
        setGameRound(prev => prev + 1)
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out. Image generation is taking too long. Please try again.')
        }
        throw fetchError
      }
    } catch (err: any) {
      console.error('Error generating image:', err)
      setError(err.message || 'Failed to generate image. Please check your API keys and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGuess = (prompt: string) => {
    if (!currentImage || guessedPrompt) return
    
    setGuessedPrompt(prompt)
    setShowResult(true)
    
    const guess: Guess = {
      imageId: currentImage.id,
      guessedPrompt: prompt,
      actualPrompt: currentImage.actualPrompt,
      isCorrect: prompt === currentImage.actualPrompt,
      timestamp: new Date(),
    }
    
    saveGuess(guess)
    const updatedStats = getStats()
    setStats(updatedStats)
    
    // Update game stats
    setGameStats(prev => ({
      correct: prev.correct + (guess.isCorrect ? 1 : 0),
      total: prev.total + 1,
    }))
    
    // Check if this was the 5th image
    if (gameRound >= 5) {
      setGameOver(true)
    }
  }
  
  const startNewGame = () => {
    setGameRound(0)
    setGameOver(false)
    setCurrentImage(null)
    setGuessedPrompt(null)
    setShowResult(false)
    setGameStats({ correct: 0, total: 0 })
    setError(null)
    clearStats()
    setStats(getStats())
  }

  useEffect(() => {
    // Load stats from localStorage after component mounts (client-side only)
    setMounted(true)
    setStats(getStats())
  }, [])

  return (
    <main className="h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-2 md:p-4 overflow-hidden">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        <div className="text-center mb-2 flex-shrink-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            🎨 Guess the Prompt
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Can you tell which prompt was used to generate this image?
          </p>
        </div>

        {mounted && <div className="flex-shrink-0"><GameStats stats={{
          totalGuesses: gameStats.total,
          correctGuesses: gameStats.correct,
          accuracy: gameStats.total > 0 ? (gameStats.correct / gameStats.total) * 100 : 0
        }} /></div>}

        {gameOver ? (
          <div className="bg-white rounded-xl shadow-xl p-4 mb-2 text-center flex-1 flex flex-col justify-center">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Game Over!</h2>
            <p className="text-sm text-gray-600 mb-4">
              You completed 5 rounds!
            </p>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 mb-4">
              <p className="text-lg font-bold text-gray-800 mb-1">
                Final Score: {gameStats.correct} / {gameStats.total}
              </p>
              <p className="text-sm text-gray-600">
                Accuracy: {gameStats.total > 0 ? ((gameStats.correct / gameStats.total) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <button
              onClick={startNewGame}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
            >
              🎮 Start New Game
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-xl p-3 md:p-4 mb-2 flex-1 flex flex-col min-h-0 overflow-hidden">
            {gameRound > 0 && (
              <div className="mb-4 text-center flex-shrink-0">
                <p className="text-sm font-semibold text-gray-700">
                  Round {gameRound} / 5
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(gameRound / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {!currentImage && !loading && (
              <div className="text-center py-4 flex-1 flex flex-col justify-center items-center">
                <p className="text-gray-600 text-sm mb-4">
                  Click the button below to start guessing! (5 rounds)
                </p>
                <button
                  onClick={generateNewImage}
                  disabled={loading}
                  className="w-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg text-base font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  type="button"
                >
                  🎲 Generate New Image
                </button>
              </div>
            )}

          {loading && (
            <div className="text-center py-4 flex-1 flex flex-col justify-center items-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
              <p className="text-gray-600 text-sm">Generating image...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-2 flex-shrink-0">
              <p className="text-red-800 text-sm">{error}</p>
              <button
                onClick={generateNewImage}
                className="mt-1 text-red-600 hover:text-red-800 underline text-xs"
              >
                Try again
              </button>
            </div>
          )}

          {currentImage && !loading && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="mb-4 flex justify-center flex-shrink-0">
                <div className="relative w-full max-w-xs aspect-square rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src={currentImage.imageUrl}
                    alt="Generated image"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>

              {!showResult ? (
                <div className="flex-1 flex flex-col min-h-0">
                  <h2 className="text-base font-bold text-center mb-3 text-gray-800 flex-shrink-0">
                    Which prompt was used to generate this image?
                  </h2>
                  <div className="space-y-2 overflow-y-auto flex-1">
                    {currentImage.promptOptions.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handleGuess(prompt)}
                        className="w-full text-left bg-gray-50 hover:bg-purple-50 border-2 border-gray-200 hover:border-purple-300 rounded-lg p-2 transition-all transform hover:scale-[1.01]"
                      >
                        <p className="text-gray-800 font-medium text-sm">{prompt}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center flex-1 flex flex-col justify-center min-h-0 overflow-y-auto">
                  <div
                    className={`text-2xl mb-2 flex-shrink-0 ${
                      guessedPrompt === currentImage.actualPrompt
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {guessedPrompt === currentImage.actualPrompt ? '✅ Correct!' : '❌ Wrong!'}
                  </div>
                  <p className="text-sm font-semibold text-gray-800 mb-1 flex-shrink-0">
                    The correct prompt was:
                  </p>
                  <p className="text-xs text-purple-600 mb-2 bg-purple-50 rounded-lg p-2 flex-shrink-0">
                    &ldquo;{currentImage.actualPrompt}&rdquo;
                  </p>
                  {guessedPrompt !== currentImage.actualPrompt && (
                    <>
                      <p className="text-gray-600 mb-1 text-sm flex-shrink-0">
                        You guessed:
                      </p>
                      <p className="text-xs text-gray-500 mb-2 bg-gray-50 rounded-lg p-2 flex-shrink-0">
                        &ldquo;{guessedPrompt}&rdquo;
                      </p>
                    </>
                  )}
                  <div className="flex gap-2 justify-center flex-shrink-0">
                    {gameRound < 5 ? (
                      <button
                        onClick={generateNewImage}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
                      >
                        🎲 Next ({5 - gameRound} left)
                      </button>
                    ) : (
                      <button
                        onClick={() => setGameOver(true)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
                      >
                        🎉 Finish Game
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
        )}
      </div>
    </main>
  )
}
