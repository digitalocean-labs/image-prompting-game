'use client'

import type { Guess, ModelName } from '@/types'
import { getGuesses } from '@/lib/storage'
import { MODELS } from '@/lib/models'
import { useState, useEffect } from 'react'

export default function PatternsReveal() {
  const [patterns, setPatterns] = useState<any>(null)

  useEffect(() => {
    const guesses = getGuesses()
    if (guesses.length === 0) {
      setPatterns(null)
      return
    }

    // Calculate patterns
    const modelConfusion: Record<string, Record<string, number>> = {}
    const correctByModel: Record<ModelName, number> = {
      'fal-ai': 0,
      'nanobanana': 0,
      'openai': 0,
    }
    const totalByModel: Record<ModelName, number> = {
      'fal-ai': 0,
      'nanobanana': 0,
      'openai': 0,
    }

    guesses.forEach((guess) => {
      const actual = guess.actualModel
      const guessed = guess.guessedModel

      totalByModel[actual]++

      if (guess.isCorrect) {
        correctByModel[actual]++
      }

      if (!modelConfusion[actual]) {
        modelConfusion[actual] = {}
      }
      if (!modelConfusion[actual][guessed]) {
        modelConfusion[actual][guessed] = 0
      }
      modelConfusion[actual][guessed]++
    })

    // Find most confused pairs
    const confusionPairs: Array<{
      actual: ModelName
      confused: ModelName
      count: number
    }> = []

    Object.keys(modelConfusion).forEach((actual) => {
      Object.keys(modelConfusion[actual]).forEach((guessed) => {
        if (actual !== guessed) {
          confusionPairs.push({
            actual: actual as ModelName,
            confused: guessed as ModelName,
            count: modelConfusion[actual][guessed],
          })
        }
      })
    })

    confusionPairs.sort((a, b) => b.count - a.count)

    // Find easiest and hardest models to identify
    const modelDifficulty = MODELS.map((model) => {
      const correct = correctByModel[model.name]
      const total = totalByModel[model.name]
      return {
        model: model.name,
        displayName: model.displayName,
        accuracy: total > 0 ? (correct / total) * 100 : 0,
        total,
      }
    })

    modelDifficulty.sort((a, b) => b.accuracy - a.accuracy)

    setPatterns({
      confusionPairs: confusionPairs.slice(0, 3),
      easiestModel: modelDifficulty[0],
      hardestModel: modelDifficulty[modelDifficulty.length - 1],
      totalGuesses: guesses.length,
    })
  }, [])

  if (!patterns || patterns.totalGuesses < 5) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          🔍 Pattern Insights
        </h2>
        <p className="text-gray-600">
          Play at least 5 rounds to see pattern insights!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        🔍 Pattern Insights
      </h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Most Confused Models
          </h3>
          <div className="space-y-2">
            {patterns.confusionPairs.map((pair: any, idx: number) => (
              <div
                key={idx}
                className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
              >
                <p className="text-sm text-gray-700">
                  You often mistake{' '}
                  <span className="font-semibold">
                    {MODELS.find((m) => m.name === pair.actual)?.displayName}
                  </span>{' '}
                  for{' '}
                  <span className="font-semibold">
                    {MODELS.find((m) => m.name === pair.confused)?.displayName}
                  </span>{' '}
                  ({pair.count} times)
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ✅ Easiest to Identify
            </h3>
            <p className="text-2xl font-bold text-green-900">
              {patterns.easiestModel.displayName}
            </p>
            <p className="text-sm text-green-700 mt-1">
              {patterns.easiestModel.accuracy.toFixed(1)}% accuracy (
              {patterns.easiestModel.total} attempts)
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              ❌ Hardest to Identify
            </h3>
            <p className="text-2xl font-bold text-red-900">
              {patterns.hardestModel.displayName}
            </p>
            <p className="text-sm text-red-700 mt-1">
              {patterns.hardestModel.accuracy.toFixed(1)}% accuracy (
              {patterns.hardestModel.total} attempts)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

