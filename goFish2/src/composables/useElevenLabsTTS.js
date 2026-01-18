import { ref } from 'vue'
import { useSoundEffects } from './useSoundEffects'

// Get sound effects composable for volume control
const { isEnabled, volume } = useSoundEffects()

// In-memory cache for generated audio
const audioCache = new Map()

/**
 * Fallback to browser's Speech Synthesis API
 */
function fallbackToSpeechSynthesis(text) {
  try {
    const utterance = new SpeechSynthesisUtterance(text)

    // Try to use Singapore English voice for authentic Singlish
    const voices = speechSynthesis.getVoices()
    const singaporeVoice = voices.find(v => v.lang === 'en-SG')
    const fallbackVoice = voices.find(v => v.lang.startsWith('en-GB') || v.lang.startsWith('en'))

    utterance.voice = singaporeVoice || fallbackVoice || null
    utterance.rate = 1.1  // Slightly faster
    utterance.pitch = 1.2 // Slightly higher for comedic effect
    utterance.volume = volume.value // Respect global volume

    speechSynthesis.speak(utterance)
  } catch (error) {
    console.error('Speech synthesis fallback failed:', error)
  }
}

/**
 * Generate speech audio using ElevenLabs API
 */
async function generateSpeech(text) {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY
  const voiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID

  // Validate API credentials
  if (!apiKey || !voiceId) {
    throw new Error('ElevenLabs API credentials not configured')
  }

  if (apiKey.includes('your_elevenlabs') || voiceId.includes('your_elevenlabs')) {
    throw new Error('Please configure your ElevenLabs API credentials in .env file')
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`)
  }

  // Return audio as blob
  return await response.blob()
}

/**
 * Play audio from blob with volume control
 */
function playAudioBlob(audioBlob) {
  return new Promise((resolve, reject) => {
    try {
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)

      // Apply volume control
      audio.volume = volume.value

      // Cleanup URL after playback
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl)
        resolve()
      }

      audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl)
        reject(error)
      }

      audio.play().catch(reject)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Main composable export
 */
export function useElevenLabsTTS() {
  const isGenerating = ref(false)
  const lastError = ref(null)

  /**
   * Play a Singlish phrase with ElevenLabs TTS
   * Falls back to browser speech synthesis if ElevenLabs fails
   */
  async function playPhrase(text) {
    // Don't play if sound is disabled
    if (!isEnabled.value) {
      return
    }

    // Reset error state
    lastError.value = null

    try {
      // Check cache first
      if (audioCache.has(text)) {
        console.log(`Playing cached audio for: "${text}"`)
        await playAudioBlob(audioCache.get(text))
        return
      }

      // Generate new audio
      console.log(`Generating ElevenLabs audio for: "${text}"`)
      isGenerating.value = true

      const audioBlob = await generateSpeech(text)

      // Cache the audio
      audioCache.set(text, audioBlob)

      // Play the audio
      await playAudioBlob(audioBlob)

      console.log(`Successfully played ElevenLabs audio for: "${text}"`)

    } catch (error) {
      console.warn('ElevenLabs TTS failed, falling back to browser speech:', error)
      lastError.value = error.message

      // Fallback to browser speech synthesis
      fallbackToSpeechSynthesis(text)

    } finally {
      isGenerating.value = false
    }
  }

  /**
   * Clear the audio cache
   */
  function clearCache() {
    audioCache.clear()
    console.log('Audio cache cleared')
  }

  /**
   * Get cache statistics
   */
  function getCacheStats() {
    return {
      size: audioCache.size,
      phrases: Array.from(audioCache.keys())
    }
  }

  /**
   * Preload all Singlish phrases into cache
   * Useful for warming up the cache before gameplay
   */
  async function preloadPhrases(phrases) {
    console.log('Preloading Singlish phrases...')

    const results = await Promise.allSettled(
      phrases.map(async (phrase) => {
        if (!audioCache.has(phrase)) {
          try {
            const audioBlob = await generateSpeech(phrase)
            audioCache.set(phrase, audioBlob)
            return { phrase, success: true }
          } catch (error) {
            console.warn(`Failed to preload: "${phrase}"`, error)
            return { phrase, success: false, error }
          }
        }
        return { phrase, success: true, cached: true }
      })
    )

    const stats = {
      total: phrases.length,
      succeeded: results.filter(r => r.status === 'fulfilled' && r.value.success).length,
      failed: results.filter(r => r.status === 'rejected' || !r.value.success).length,
      alreadyCached: results.filter(r => r.status === 'fulfilled' && r.value.cached).length
    }

    console.log('Preload complete:', stats)
    return stats
  }

  return {
    // Main function
    playPhrase,

    // Cache management
    clearCache,
    getCacheStats,
    preloadPhrases,

    // State
    isGenerating,
    lastError
  }
}
