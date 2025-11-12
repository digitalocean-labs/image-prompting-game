'use client'

import type { GameStats as GameStatsType } from '@/types'

interface GameStatsProps {
  stats: GameStatsType
}

export default function GameStats({ stats }: GameStatsProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-2 mb-2">
      <div className="mb-1">
        <h2 className="text-sm font-bold text-gray-800">Your Stats</h2>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-2">
          <div className="text-xs text-gray-600 mb-0.5">Total</div>
          <div className="text-lg font-bold text-purple-800">
            {stats.totalGuesses} / 5
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-2">
          <div className="text-xs text-gray-600 mb-0.5">Correct</div>
          <div className="text-lg font-bold text-green-800">
            {stats.correctGuesses}
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-2">
          <div className="text-xs text-gray-600 mb-0.5">Accuracy</div>
          <div className="text-lg font-bold text-blue-800">
            {stats.totalGuesses > 0 ? stats.accuracy.toFixed(1) : '0.0'}%
          </div>
        </div>
      </div>
    </div>
  )
}
