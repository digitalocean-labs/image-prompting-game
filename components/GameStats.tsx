'use client'

import type { GameStats as GameStatsType } from '@/types'

interface GameStatsProps {
  stats: GameStatsType
  onClear: () => void
}

export default function GameStats({ stats, onClear }: GameStatsProps) {
  if (stats.totalGuesses === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Your Stats</h2>
        <button
          onClick={onClear}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Clear Stats
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Total Guesses</div>
          <div className="text-3xl font-bold text-purple-800">
            {stats.totalGuesses}
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Correct</div>
          <div className="text-3xl font-bold text-green-800">
            {stats.correctGuesses}
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Accuracy</div>
          <div className="text-3xl font-bold text-blue-800">
            {stats.accuracy.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  )
}
