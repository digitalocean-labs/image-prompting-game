# Guess the Prompt - Image Generation Game

A fun, educational game where users guess which prompt was used to generate an AI image. Test your understanding of how prompts affect image generation!

## Features

- 🎮 Interactive prompt guessing game
- 📊 Track accuracy and statistics
- 🎨 Beautiful, modern UI
- 📈 Score tracking
- 💰 Cost-effective - uses only fal.ai API

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file with your API key:
```
MODEL_ACCESS_KEY=your_model_access_key
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Play

1. Click "Generate New Image" to create an AI-generated image
2. Look at the image carefully
3. Guess which prompt was used from the multiple choice options
4. See if you're correct and track your accuracy
5. Challenge yourself to understand how different prompts create different images

## Getting API Key

### DigitalOcean fal.ai
1. Go to [DigitalOcean Console](https://cloud.digitalocean.com/)
2. Navigate to Gradient AI Platform
3. Opt in to the public preview (takes 10-15 minutes for access)
4. Get your Model Access Key from the Gradient AI Platform dashboard
5. Use this key as `MODEL_ACCESS_KEY` in your `.env.local`
6. Reference: [DigitalOcean fal.ai blog post](https://www.digitalocean.com/blog/fal-ai-image-models-gradient-ai-platform)

## Features Breakdown

- **Game Mechanics**: Generates an image with a random prompt, then shows 4 prompt options (1 correct + 3 decoys)
- **Scoring System**: Tracks your accuracy and correct guesses
- **Statistics Dashboard**: Visual representation of your performance
- **Local Storage**: Your progress is saved in your browser

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern styling
- **Local Storage** - Client-side data persistence
- **fal.ai** - Image generation via DigitalOcean Gradient AI Platform
