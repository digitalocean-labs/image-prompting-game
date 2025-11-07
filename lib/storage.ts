import type { Guess, GameStats } from '@/types'

const STORAGE_KEYS = {
  GUESSES: 'guess-the-prompt-guesses',
  STATS: 'guess-the-prompt-stats',
}

export function saveGuess(guess: Guess): void {
  if (typeof window === 'undefined') return
  
  const guesses = getGuesses()
  guesses.push(guess)
  localStorage.setItem(STORAGE_KEYS.GUESSES, JSON.stringify(guesses))
  
  // Update stats
  updateStats(guess)
}

export function getGuesses(): Guess[] {
  if (typeof window === 'undefined') return []
  
  const stored = localStorage.getItem(STORAGE_KEYS.GUESSES)
  if (!stored) return []
  
  try {
    return JSON.parse(stored).map((g: any) => ({
      ...g,
      timestamp: new Date(g.timestamp),
    }))
  } catch {
    return []
  }
}

export function getStats(): GameStats {
  if (typeof window === 'undefined') {
    return {
      totalGuesses: 0,
      correctGuesses: 0,
      accuracy: 0,
    }
  }
  
  const stored = localStorage.getItem(STORAGE_KEYS.STATS)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      // Fall through to default
    }
  }
  
  return {
    totalGuesses: 0,
    correctGuesses: 0,
    accuracy: 0,
  }
}

function updateStats(guess: Guess): void {
  const stats = getStats()
  
  stats.totalGuesses++
  if (guess.isCorrect) {
    stats.correctGuesses++
  }
  
  stats.accuracy = stats.totalGuesses > 0 
    ? (stats.correctGuesses / stats.totalGuesses) * 100 
    : 0
  
  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats))
}

export function clearStats(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.GUESSES)
  localStorage.removeItem(STORAGE_KEYS.STATS)
}
