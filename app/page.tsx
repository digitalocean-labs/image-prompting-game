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
    if (gameRound >= 3) {
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
    
    // Check if this was the 3rd image
    if (gameRound >= 3) {
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
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">
            🎨 Guess the Prompt
          </h1>
          <p className="text-xl text-gray-600">
            Can you tell which prompt was used to generate this image?
          </p>
        </div>

        {mounted && <GameStats stats={stats} onClear={clearStats} />}

        {gameOver ? (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Game Over!</h2>
            <p className="text-xl text-gray-600 mb-8">
              You completed 3 rounds!
            </p>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-6">
              <p className="text-2xl font-bold text-gray-800 mb-2">
                Final Score: {gameStats.correct} / {gameStats.total}
              </p>
              <p className="text-lg text-gray-600">
                Accuracy: {gameStats.total > 0 ? ((gameStats.correct / gameStats.total) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <button
              onClick={startNewGame}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
            >
              🎮 Start New Game
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
            {gameRound > 0 && (
              <div className="mb-4 text-center">
                <p className="text-lg font-semibold text-gray-700">
                  Round {gameRound} / 3
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${(gameRound / 3) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {!currentImage && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-6">
                  Click the button below to start guessing! (3 rounds)
                </p>
                <button
                  onClick={generateNewImage}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  type="button"
                >
                  🎲 Generate New Image
                </button>
              </div>
            )}

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-gray-600">Generating image...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800">{error}</p>
              <button
                onClick={generateNewImage}
                className="mt-2 text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}

          {currentImage && !loading && (
            <>
              <div className="mb-6 flex justify-center">
                <div className="relative w-full max-w-md aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-lg">
                  <Image
                    src={currentImage.imageUrl}
                    alt="Generated image"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>

              {!showResult ? (
                <div>
                  <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                    Which prompt was used to generate this image?
                  </h2>
                  <div className="space-y-3">
                    {currentImage.promptOptions.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handleGuess(prompt)}
                        className="w-full text-left bg-gray-50 hover:bg-purple-50 border-2 border-gray-200 hover:border-purple-300 rounded-lg p-4 transition-all transform hover:scale-[1.02]"
                      >
                        <p className="text-gray-800 font-medium">{prompt}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div
                    className={`text-4xl mb-4 ${
                      guessedPrompt === currentImage.actualPrompt
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {guessedPrompt === currentImage.actualPrompt ? '✅ Correct!' : '❌ Wrong!'}
                  </div>
                  <p className="text-xl font-semibold text-gray-800 mb-2">
                    The correct prompt was:
                  </p>
                  <p className="text-lg text-purple-600 mb-4 bg-purple-50 rounded-lg p-4">
                    &ldquo;{currentImage.actualPrompt}&rdquo;
                  </p>
                  {guessedPrompt !== currentImage.actualPrompt && (
                    <>
                      <p className="text-gray-600 mb-2">
                        You guessed:
                      </p>
                      <p className="text-lg text-gray-500 mb-4 bg-gray-50 rounded-lg p-4">
                        &ldquo;{guessedPrompt}&rdquo;
                      </p>
                    </>
                  )}
                  <div className="flex gap-4 justify-center">
                    {gameRound < 3 ? (
                      <button
                        onClick={generateNewImage}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
                      >
                        🎲 Next Image ({3 - gameRound} left)
                      </button>
                    ) : (
                      <button
                        onClick={() => setGameOver(true)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
                      >
                        🎉 Finish Game
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          </div>
        )}
      </div>
    </main>
  )
}
