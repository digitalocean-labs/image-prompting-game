import type { ModelName } from '@/types'

export const MODELS: { name: ModelName; displayName: string; color: string }[] = [
  { name: 'fal-ai', displayName: 'DigitalOcean fal.ai', color: 'bg-blue-500' },
  { name: 'nanobanana', displayName: 'NanoBanana', color: 'bg-yellow-500' },
  { name: 'openai', displayName: 'OpenAI', color: 'bg-green-500' },
]

export const MODEL_DESCRIPTIONS: Record<ModelName, string> = {
  'fal-ai': 'DigitalOcean fal.ai - Fast and efficient image generation',
  'nanobanana': 'NanoBanana - Creative and unique artistic styles',
  'openai': 'OpenAI DALL-E - High-quality, detailed image generation',
}

