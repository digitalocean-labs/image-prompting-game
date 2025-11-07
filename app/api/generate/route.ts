import { NextRequest, NextResponse } from 'next/server'

const PROMPTS = [
  'A futuristic cityscape at sunset with flying cars soaring through neon-lit skyscrapers, holographic advertisements glowing in the twilight sky, and pedestrians walking on elevated walkways',
  'A cute robot having tea with a cat in a beautiful garden filled with blooming flowers, butterflies dancing in the air, and a vintage teapot on a wooden table',
  'An underwater castle with colorful fish swimming around ancient stone towers, coral reefs glowing with bioluminescent plants, and mermaids exploring the ruins',
  'A steampunk-style library with floating books arranged in spiral patterns, brass gears turning slowly, and warm golden light streaming through stained glass windows',
  'A magical forest with glowing mushrooms illuminating the path, fireflies creating a starry canopy above, and ancient trees with faces carved into their bark',
  'A cyberpunk street market at night with neon signs reflecting in puddles, vendors selling exotic tech, and hover vehicles zipping through the crowded alleyways',
  'A space station orbiting a distant planet with Earth visible in the background, astronauts working on solar panels, and stars twinkling in the vast darkness',
  'A cozy coffee shop in a rainy city with steam rising from cups, people reading books by warm lamplight, and raindrops tracing patterns on the windows',
  'A dragon flying over a medieval village with thatched roofs, villagers looking up in awe, and mountains in the distance covered in mist',
  'A surreal landscape with floating islands connected by bridges, waterfalls cascading into the void, and strange creatures roaming the ethereal terrain',
  'A vintage train station with steam engines billowing smoke, passengers in period clothing waiting on platforms, and ornate architecture from a bygone era',
  'A floating city in the clouds with airships docked at platforms, people walking on cloud bridges, and the sun setting behind distant mountain peaks',
  'A robot chef cooking in a modern kitchen with holographic recipe displays, precision tools moving automatically, and delicious aromas filling the air',
  'A crystal cave with glowing crystals of various colors, stalactites reflecting light, and a hidden underground lake shimmering with bioluminescent algae',
  'A post-apocalyptic city overgrown with nature where vines climb up skyscrapers, animals roam freely, and solar panels power the remaining technology',
  'A steampunk airship flying through clouds with brass propellers spinning, crew members on deck, and a Victorian-era city visible below',
  'A neon-lit alleyway in a cyberpunk city with holographic graffiti on walls, rain-slicked streets reflecting colorful lights, and shadowy figures in the distance',
  'A peaceful zen garden with cherry blossoms falling gently, a stone bridge over a koi pond, and meditation stones arranged in perfect harmony',
  'A pirate ship sailing through space with stars as the ocean, alien planets in the distance, and cosmic winds filling the sails',
  'A clockwork mechanism with intricate gears interlocking perfectly, brass cogs turning in harmony, and golden light revealing every detail of the mechanical wonder',
]

// Set max duration for API route (3 minutes for async polling)
export const maxDuration = 180

// Function to generate similar but different prompts using Gradient LLM
async function generateDecoyPrompts(actualPrompt: string, apiKey: string): Promise<string[]> {
  const GRADIENT_API_BASE = 'https://api.gradient.ai/v1'
  
  try {
    const systemPrompt = `You are a helpful assistant that generates detailed image generation prompts. Generate exactly 3 alternative image generation prompts that are similar but meaningfully different from the given prompt.

CRITICAL REQUIREMENTS:
- Each prompt must be LONG and DETAILED (at least 20-30 words), matching the length and detail level of the original
- Change MULTIPLE elements: subjects, actions, settings, lighting, weather, time of day, mood, or perspective
- Use DIFFERENT descriptive words and phrases - don't just change "A" to "The" or swap single words
- Each prompt should describe a similar scene but with distinct differences that would create noticeably different images
- Make them different enough that someone could distinguish between them by looking at the generated image
- Return ONLY the 3 prompts, one per line, no numbering, no explanations, no prefixes
- Each prompt should be a complete, detailed sentence describing an image

Example of GOOD variations:
Original: "A futuristic cityscape at sunset with flying cars soaring through neon-lit skyscrapers"
Variation 1: "A modern metropolis at dawn with hover vehicles gliding between glass towers, sunrise casting orange reflections"
Variation 2: "A cyberpunk urban landscape during twilight with aerial transport weaving through illuminated buildings, purple sky above"
Variation 3: "An advanced city at dusk with flying machines navigating between holographic structures, evening lights creating a neon glow"

BAD variations (too similar):
- "The futuristic cityscape at sunset with flying cars..." (only changed "A" to "The")
- "A futuristic cityscape at sunset with flying vehicles..." (only changed "cars" to "vehicles")`

    const userPrompt = `Generate exactly 3 alternative image generation prompts that are similar but different from this prompt: "${actualPrompt}"`

    console.log('Generating decoy prompts with Gradient LLM...')
    
    // Use Gradient's chat completions API
    const response = await fetch(`${GRADIENT_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'openai-gpt-oss-120b',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        max_tokens: 400,
        temperature: 0.9,
      }),
    })
    
    const responseText = await response.text()
    
    if (!response.ok) {
      console.error('Gradient LLM error:', responseText)
      // Fallback to simple variations if LLM fails
      return generateFallbackPrompts(actualPrompt)
    }
    
    let responseData: any
    try {
      if (!responseText || responseText.trim() === '') {
        throw new Error('Empty response from Gradient LLM')
      }
      responseData = JSON.parse(responseText)
    } catch (parseError: any) {
      console.error('Failed to parse Gradient LLM response:', parseError)
      return generateFallbackPrompts(actualPrompt)
    }
    
    // Extract the generated text from the response
    let generatedText = ''
    if (responseData.choices && responseData.choices[0] && responseData.choices[0].message) {
      generatedText = responseData.choices[0].message.content || ''
    } else if (responseData.content) {
      generatedText = responseData.content
    } else if (responseData.text) {
      generatedText = responseData.text
    }
    
    if (generatedText) {
      // Parse the generated prompts (one per line)
      const lines = generatedText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.match(/^\d+[\.\)]/) && !line.toLowerCase().startsWith('prompt'))
        .slice(0, 3)
      
      if (lines.length >= 3) {
        console.log('Generated decoy prompts:', lines)
        return lines
      } else if (lines.length > 0) {
        // If we got some prompts but not 3, use them and fill with fallback
        console.log('Got partial prompts, filling with fallback')
        const fallback = generateFallbackPrompts(actualPrompt)
        return [...lines, ...fallback].slice(0, 3)
      }
    }
    
    // If we didn't get valid prompts, use fallback
    console.warn('No valid prompts generated, using fallback')
    return generateFallbackPrompts(actualPrompt)
  } catch (error: any) {
    console.error('Error generating decoy prompts with Gradient LLM:', error)
    return generateFallbackPrompts(actualPrompt)
  }
}

// Fallback function if LLM fails
function generateFallbackPrompts(actualPrompt: string): string[] {
  const variations: string[] = []
  const words = actualPrompt.split(' ')
  
  // Variation 1: Change time of day and lighting
  let variation1 = actualPrompt
  if (actualPrompt.toLowerCase().includes('at sunset')) {
    variation1 = actualPrompt.replace(/at sunset/gi, 'at sunrise with golden morning light')
  } else if (actualPrompt.toLowerCase().includes('at night')) {
    variation1 = actualPrompt.replace(/at night/gi, 'during the day with bright sunlight')
  } else if (actualPrompt.toLowerCase().includes('at dawn')) {
    variation1 = actualPrompt.replace(/at dawn/gi, 'at dusk with warm evening glow')
  } else {
    variation1 = actualPrompt.replace(/(\.|$)/, ' at sunset with warm orange light$1')
  }
  variations.push(variation1)
  
  // Variation 2: Change perspective and add different details
  let variation2 = actualPrompt
  if (actualPrompt.toLowerCase().includes('with')) {
    // Replace the "with" clause with different details
    const withIndex = actualPrompt.toLowerCase().indexOf(' with ')
    if (withIndex > 0) {
      const base = actualPrompt.substring(0, withIndex)
      if (actualPrompt.toLowerCase().includes('flying')) {
        variation2 = base + ' featuring hovering vehicles and advanced technology'
      } else if (actualPrompt.toLowerCase().includes('glowing')) {
        variation2 = base + ' illuminated by bioluminescent plants and magical light'
      } else {
        variation2 = base + ' surrounded by vibrant colors and dynamic movement'
      }
    } else {
      variation2 = actualPrompt + ' featuring intricate details and atmospheric lighting'
    }
  } else {
    variation2 = actualPrompt + ' with dramatic lighting and rich textures'
  }
  variations.push(variation2)
  
  // Variation 3: Change main subject or setting
  let variation3 = actualPrompt
  if (actualPrompt.toLowerCase().includes('cityscape') || actualPrompt.toLowerCase().includes('city')) {
    variation3 = actualPrompt.replace(/cityscape|city/gi, 'metropolis')
    variation3 = variation3.replace(/futuristic/gi, 'modern').replace(/cyberpunk/gi, 'high-tech')
  } else if (actualPrompt.toLowerCase().includes('forest')) {
    variation3 = actualPrompt.replace(/forest/gi, 'woodland')
    variation3 = variation3.replace(/magical/gi, 'enchanted').replace(/glowing/gi, 'luminous')
  } else if (actualPrompt.toLowerCase().includes('robot')) {
    variation3 = actualPrompt.replace(/robot/gi, 'android')
    variation3 = variation3.replace(/cute/gi, 'friendly').replace(/cooking/gi, 'preparing')
  } else {
    // Generic variation: change adjectives and add context
    variation3 = actualPrompt.replace(/futuristic/gi, 'advanced')
    variation3 = variation3.replace(/magical/gi, 'mystical')
    variation3 = variation3.replace(/cozy/gi, 'warm')
    if (!variation3.includes('with')) {
      variation3 = variation3.replace(/(\.|$)/, ' with atmospheric details$1')
    }
  }
  variations.push(variation3)
  
  // Ensure all variations are different from original
  const uniqueVariations = variations
    .filter(v => v.toLowerCase() !== actualPrompt.toLowerCase() && v.trim() !== '')
    .slice(0, 3)
  
  // If we don't have 3, add more variations
  while (uniqueVariations.length < 3) {
    const words = actualPrompt.split(' ')
    if (words.length > 5) {
      // Remove last few words and add different ending
      const base = words.slice(0, -3).join(' ')
      uniqueVariations.push(base + ' with unique artistic details and creative composition')
    } else {
      uniqueVariations.push(actualPrompt + ' from a different perspective with varied lighting')
    }
    if (uniqueVariations.length >= 3) break
  }
  
  return uniqueVariations.slice(0, 3)
}

export async function POST(request: NextRequest) {
  try {
    const { prompt }: { prompt?: string } = await request.json()
    
    // Use MODEL_ACCESS_KEY if available, otherwise fall back to FAL_AI_API_KEY
    const apiKey = process.env.MODEL_ACCESS_KEY || process.env.FAL_AI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gradient API key is not configured. Please set MODEL_ACCESS_KEY or FAL_AI_API_KEY in your .env.local file.' },
        { status: 400 }
      )
    }
    
    // Select a random prompt if none provided
    const actualPrompt = prompt || PROMPTS[Math.floor(Math.random() * PROMPTS.length)]
    
    console.log(`Generating image with prompt: ${actualPrompt}`)
    
    // Generate the image
    const imageUrl = await generateFalAI(actualPrompt, apiKey)
    
    // Generate decoy prompts (similar but different) using LLM
    const decoyPrompts = await generateDecoyPrompts(actualPrompt, apiKey)
    
    // Create prompt options: actual prompt + 3 decoys, shuffled
    const promptOptions = [actualPrompt, ...decoyPrompts]
      .sort(() => Math.random() - 0.5) // Shuffle
    
    console.log(`Image generated successfully: ${imageUrl.substring(0, 50)}...`)
    
    return NextResponse.json({
      imageUrl,
      actualPrompt,
      promptOptions,
    })
  } catch (error: any) {
    console.error('Error generating image:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    )
  }
}

async function generateFalAI(prompt: string, apiKey: string): Promise<string> {
  // Using DigitalOcean Gradient AI Platform API
  // Reference: https://www.digitalocean.com/blog/fal-ai-image-models-gradient-ai-platform
  const API_BASE = 'https://inference.do-ai.run/v1'
  
  try {
    // Step 1: Submit async request
    console.log('Submitting fal.ai request...')
    const submitResponse = await fetch(`${API_BASE}/async-invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model_id: 'fal-ai/flux/schnell',
        input: {
          prompt,
        },
      }),
    })
    
    const submitResponseText = await submitResponse.text()
    
    if (!submitResponse.ok) {
      console.error('Fal.ai submit error:', submitResponseText)
      throw new Error(`Fal.ai API error: ${submitResponseText}`)
    }
    
    let submitData: any
    try {
      if (!submitResponseText || submitResponseText.trim() === '') {
        throw new Error('Empty response from fal.ai API')
      }
      submitData = JSON.parse(submitResponseText)
      console.log('Fal.ai submit response:', submitData)
    } catch (parseError: any) {
      console.error('Failed to parse fal.ai submit response:', parseError)
      throw new Error(`Failed to parse fal.ai API response: ${parseError.message}`)
    }
    
    const requestId = submitData.request_id || submitData.id
    
    if (!requestId) {
      console.error('No request_id in response:', submitData)
      throw new Error('Failed to get request_id from fal.ai API. Response: ' + JSON.stringify(submitData))
    }
    
    console.log('Fal.ai request_id:', requestId)
    
    // Step 2: Poll for status (with shorter intervals and timeout)
    let status = 'PENDING'
    let attempts = 0
    const maxAttempts = 30 // 2.5 minutes max (3 second intervals)
    const pollInterval = 3000 // 3 seconds
    let statusData: any = null
    
    while (status !== 'COMPLETE' && status !== 'COMPLETED' && attempts < maxAttempts) {
      attempts++
      console.log(`Polling fal.ai status (attempt ${attempts}/${maxAttempts})...`)
      
      try {
        const statusResponse = await fetch(`${API_BASE}/async-invoke/${requestId}/status`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        })
        
        const statusResponseText = await statusResponse.text()
        
        if (!statusResponse.ok) {
          console.error('Fal.ai status check error:', statusResponseText)
          throw new Error(`Fal.ai status check error: ${statusResponseText}`)
        }
        
        try {
          if (!statusResponseText || statusResponseText.trim() === '') {
            console.warn('Empty response from fal.ai status check, continuing...')
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, pollInterval))
            }
            continue
          }
          statusData = JSON.parse(statusResponseText)
          console.log('Fal.ai status response:', JSON.stringify(statusData).substring(0, 200))
        } catch (parseError: any) {
          console.warn('Failed to parse fal.ai status response:', parseError.message)
          // Continue polling if we haven't exceeded max attempts
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, pollInterval))
          }
          continue
        }
        
        // Try different possible status field names
        status = statusData.status || statusData.state || statusData.request_status || 'PENDING'
        console.log(`Fal.ai status: ${status}`)
        
        if (status === 'FAILED' || status === 'ERROR') {
          const errorMsg = statusData.error || statusData.message || 'Image generation failed'
          throw new Error(`Fal.ai image generation failed: ${errorMsg}`)
        }
        
        // If status is COMPLETE or COMPLETED, check if we have the image URL in the status response
        if (status === 'COMPLETE' || status === 'COMPLETED' || status === 'SUCCESS') {
          console.log('Fal.ai generation completed! Checking for image URL in status response...')
          
          // The status response already contains the output with image URL
          // Try to extract it directly from statusData
          let imageUrl: string | undefined
          
          if (statusData.output?.images?.[0]?.url) {
            imageUrl = statusData.output.images[0].url
          } else if (statusData.output?.image_url) {
            imageUrl = statusData.output.image_url
          } else if (statusData.output?.url) {
            imageUrl = statusData.output.url
          } else if (statusData.images?.[0]?.url) {
            imageUrl = statusData.images[0].url
          } else if (statusData.image_url) {
            imageUrl = statusData.image_url
          } else if (statusData.url) {
            imageUrl = statusData.url
          }
          
          // If we found the image URL in status response, return it immediately
          if (imageUrl) {
            console.log('Fal.ai image URL found in status response:', imageUrl)
            return imageUrl
          }
          
          // If not found in status, break and fetch from result endpoint
          console.log('Image URL not in status response, will fetch from result endpoint')
          break
        }
        
        // Only wait if status is not COMPLETE/COMPLETED
        if (status !== 'COMPLETE' && status !== 'COMPLETED' && status !== 'SUCCESS' && attempts < maxAttempts) {
          console.log(`Status is ${status}, waiting ${pollInterval}ms before next check...`)
          await new Promise(resolve => setTimeout(resolve, pollInterval))
        }
      } catch (error: any) {
        // If it's a status check error, throw it
        if (error.message?.includes('status check error') || error.message?.includes('failed')) {
          throw error
        }
        // Otherwise, log and continue polling
        console.warn('Status check error (continuing):', error.message)
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, pollInterval))
        }
      }
    }
    
    if (status !== 'COMPLETE' && status !== 'COMPLETED' && status !== 'SUCCESS') {
      throw new Error(`Fal.ai image generation timed out after ${attempts} attempts. Last status: ${status}`)
    }
    
    // Step 3: Retrieve the result (only if we didn't get it from status response)
    console.log('Retrieving fal.ai result...')
    const resultResponse = await fetch(`${API_BASE}/async-invoke/${requestId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })
    
    const resultResponseText = await resultResponse.text()
    
    if (!resultResponse.ok) {
      console.error('Fal.ai result retrieval error:', resultResponseText)
      throw new Error(`Fal.ai result retrieval error: ${resultResponseText}`)
    }
    
    let resultData: any
    try {
      if (!resultResponseText || resultResponseText.trim() === '') {
        throw new Error('Empty response from fal.ai result retrieval')
      }
      resultData = JSON.parse(resultResponseText)
      console.log('Fal.ai result data:', JSON.stringify(resultData).substring(0, 500))
    } catch (parseError: any) {
      console.error('Failed to parse fal.ai result response:', parseError)
      throw new Error(`Failed to parse fal.ai result response: ${parseError.message}`)
    }
    
    // The response structure may vary, try different possible fields
    let imageUrl: string | undefined
    
    if (resultData.output?.images?.[0]?.url) {
      imageUrl = resultData.output.images[0].url
    } else if (resultData.output?.image_url) {
      imageUrl = resultData.output.image_url
    } else if (resultData.output?.url) {
      imageUrl = resultData.output.url
    } else if (resultData.images?.[0]?.url) {
      imageUrl = resultData.images[0].url
    } else if (resultData.image_url) {
      imageUrl = resultData.image_url
    } else if (resultData.url) {
      imageUrl = resultData.url
    } else if (resultData.output?.image) {
      imageUrl = resultData.output.image
    } else if (resultData.image) {
      imageUrl = resultData.image
    }
    
    if (!imageUrl) {
      console.error('Could not find image URL. Full response:', JSON.stringify(resultData))
      throw new Error('Could not find image URL in fal.ai response. Response structure: ' + JSON.stringify(resultData).substring(0, 200))
    }
    
    console.log('Fal.ai image URL:', imageUrl)
    return imageUrl
  } catch (error: any) {
    console.error('Fal.ai generation error:', error)
    throw error
  }
}
