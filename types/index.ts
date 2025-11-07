export interface GameImage {
  id: string
  imageUrl: string
  actualPrompt: string
  promptOptions: string[]
  createdAt: Date
}

export interface Guess {
  imageId: string
  guessedPrompt: string
  actualPrompt: string
  isCorrect: boolean
  timestamp: Date
}

export interface GameStats {
  totalGuesses: number
  correctGuesses: number
  accuracy: number
}
