'use client'

import type { ModelName } from '@/types'

interface ModelButtonProps {
  model: {
    name: ModelName
    displayName: string
    color: string
  }
  onClick: () => void
}

export default function ModelButton({ model, onClick }: ModelButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`${model.color} text-white p-6 rounded-xl font-semibold text-lg hover:opacity-90 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl min-h-[60px] flex items-center justify-center`}
      style={{ color: 'white' }}
    >
      <span className="whitespace-nowrap">{model.displayName}</span>
    </button>
  )
}

