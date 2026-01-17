import { ref } from 'vue'

// Sound effect state
const isEnabled = ref(true)
const volume = ref(0.5)
const audioContext = ref(null)

/**
 * Initialize Audio Context (call this on user interaction to comply with browser policies)
 */
function initAudio() {
  if (!audioContext.value) {
    audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext.value
}

/**
 * Generate a simple tone
 */
function playTone(frequency, duration, type = 'sine', volumeMultiplier = 1) {
  if (!isEnabled.value) return

  const ctx = initAudio()
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.frequency.value = frequency
  oscillator.type = type

  gainNode.gain.setValueAtTime(volume.value * volumeMultiplier, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + duration)
}

/**
 * Play a sequence of tones
 */
function playSequence(notes, interval = 0.1) {
  if (!isEnabled.value) return

  notes.forEach((note, index) => {
    setTimeout(() => {
      playTone(note.freq, note.duration || 0.1, note.type || 'sine', note.volume || 1)
    }, index * interval * 1000)
  })
}

/**
 * Card shuffle sound
 */
function playCardShuffle() {
  if (!isEnabled.value) return

  const ctx = initAudio()
  const duration = 0.3

  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      const noise = ctx.createBufferSource()
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate)
      const data = buffer.getChannelData(0)

      for (let j = 0; j < buffer.length; j++) {
        data[j] = Math.random() * 2 - 1
      }

      noise.buffer = buffer

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 1000 + i * 200

      const gainNode = ctx.createGain()
      gainNode.gain.value = volume.value * 0.15

      noise.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(ctx.destination)

      noise.start()
      noise.stop(ctx.currentTime + 0.05)
    }, i * 30)
  }
}

/**
 * Sound Effects Library
 */
export function useSoundEffects() {
  // Card ask sound - rising tone
  function playAskCard() {
    playSequence([
      { freq: 440, duration: 0.08 },
      { freq: 550, duration: 0.08 },
      { freq: 660, duration: 0.12 }
    ], 0.08)
  }

  // Card received - success chime
  function playCardReceived() {
    playSequence([
      { freq: 523, duration: 0.1 },
      { freq: 659, duration: 0.1 },
      { freq: 784, duration: 0.2 }
    ], 0.1)
  }

  // Go Fish - descending tone with taunting melody
  function playGoFish() {
    // Play a taunting "nah nah nah nah nah" melody
    playSequence([
      { freq: 523, duration: 0.15 },  // C
      { freq: 494, duration: 0.15 },  // B
      { freq: 440, duration: 0.15 },  // A
      { freq: 494, duration: 0.15 },  // B
      { freq: 440, duration: 0.3 }    // A (longer)
    ], 0.15)
  }

  // Go Fish Taunt - playful teasing sound
  function playGoFishTaunt() {
    if (!isEnabled.value) return

    // "Nah nah nah-nah nah" playground taunt
    playSequence([
      { freq: 659, duration: 0.2, type: 'square' },   // E
      { freq: 587, duration: 0.2, type: 'square' },   // D
      { freq: 523, duration: 0.2, type: 'square' },   // C
      { freq: 587, duration: 0.2, type: 'square' },   // D
      { freq: 523, duration: 0.4, type: 'square' }    // C (held)
    ], 0.2)

    // Add slide whistle effect for extra taunt
    setTimeout(() => {
      if (!isEnabled.value) return
      const ctx = initAudio()

      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(800, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.5)

      gainNode.gain.setValueAtTime(volume.value * 0.4, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.5)
    }, 1200)
  }

  // Draw card - quick pop
  function playDrawCard() {
    playCardShuffle()
  }

  // Book complete - victory fanfare
  function playBookComplete() {
    playSequence([
      { freq: 523, duration: 0.15 },
      { freq: 659, duration: 0.15 },
      { freq: 784, duration: 0.15 },
      { freq: 1047, duration: 0.3 }
    ], 0.12)
  }

  // Octopus troll - ominous low rumble
  function playOctopusTroll() {
    playSequence([
      { freq: 110, duration: 0.3, type: 'sawtooth', volume: 0.8 },
      { freq: 90, duration: 0.3, type: 'sawtooth', volume: 0.8 },
      { freq: 70, duration: 0.5, type: 'sawtooth', volume: 1 }
    ], 0.25)
  }

  // Earthquake - rumbling bass with variation
  function playEarthquake() {
    if (!isEnabled.value) return

    const ctx = initAudio()

    // Create rumbling effect
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const freq = 50 + Math.random() * 30
        playTone(freq, 0.15, 'sawtooth', 0.6)
      }, i * 100)
    }
  }

  // Deck swap - magical swirl
  function playDeckSwap() {
    if (!isEnabled.value) return

    const ctx = initAudio()
    const duration = 2

    // Ascending and descending swirl
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const progress = i / 30
        const freq = 200 + Math.sin(progress * Math.PI * 4) * 400
        playTone(freq, 0.08, 'sine', 0.4)
      }, i * 60)
    }
  }

  // Turn change - gentle notification
  function playTurnChange() {
    playSequence([
      { freq: 440, duration: 0.1 },
      { freq: 554, duration: 0.15 }
    ], 0.1)
  }

  // Your turn - attention sound
  function playYourTurn() {
    playSequence([
      { freq: 659, duration: 0.1 },
      { freq: 784, duration: 0.1 },
      { freq: 659, duration: 0.15 }
    ], 0.1)
  }

  // Win game - celebration
  function playWin() {
    playSequence([
      { freq: 523, duration: 0.15 },
      { freq: 659, duration: 0.15 },
      { freq: 784, duration: 0.15 },
      { freq: 1047, duration: 0.2 },
      { freq: 784, duration: 0.1 },
      { freq: 1047, duration: 0.3 }
    ], 0.12)
  }

  // Lose game - sad trombone
  function playLose() {
    playSequence([
      { freq: 392, duration: 0.2 },
      { freq: 370, duration: 0.2 },
      { freq: 349, duration: 0.2 },
      { freq: 330, duration: 0.4 }
    ], 0.2)
  }

  // Button click - subtle feedback
  function playClick() {
    playTone(800, 0.05, 'sine', 0.3)
  }

  // Error/warning - alert sound
  function playError() {
    playSequence([
      { freq: 300, duration: 0.1, type: 'square' },
      { freq: 250, duration: 0.1, type: 'square' },
      { freq: 200, duration: 0.15, type: 'square' }
    ], 0.08)
  }

  // Wrong guess taunt variations - randomly pick one
  function playWrongGuessTaunt() {
    if (!isEnabled.value) return

    const taunts = [
      // Taunt 1: Sad trombone
      () => {
        playSequence([
          { freq: 392, duration: 0.3, type: 'sawtooth' },
          { freq: 370, duration: 0.3, type: 'sawtooth' },
          { freq: 349, duration: 0.3, type: 'sawtooth' },
          { freq: 330, duration: 0.5, type: 'sawtooth' }
        ], 0.25)
      },

      // Taunt 2: Price is Right fail
      () => {
        playSequence([
          { freq: 196, duration: 0.15 },
          { freq: 185, duration: 0.15 },
          { freq: 175, duration: 0.15 },
          { freq: 165, duration: 0.15 },
          { freq: 156, duration: 0.6 }
        ], 0.15)
      },

      // Taunt 3: Descending laugh
      () => {
        playSequence([
          { freq: 800, duration: 0.1, type: 'square' },
          { freq: 700, duration: 0.1, type: 'square' },
          { freq: 600, duration: 0.1, type: 'square' },
          { freq: 500, duration: 0.1, type: 'square' },
          { freq: 400, duration: 0.2, type: 'square' }
        ], 0.08)
      },

      // Taunt 4: Buzzer
      () => {
        playSequence([
          { freq: 150, duration: 0.6, type: 'sawtooth', volume: 1.2 }
        ], 0)
      },

      // Taunt 5: Circus fail
      () => {
        playSequence([
          { freq: 523, duration: 0.15 },
          { freq: 494, duration: 0.15 },
          { freq: 466, duration: 0.15 },
          { freq: 440, duration: 0.15 },
          { freq: 415, duration: 0.15 },
          { freq: 392, duration: 0.4 }
        ], 0.12)
      }
    ]

    // Randomly select a taunt
    const randomTaunt = taunts[Math.floor(Math.random() * taunts.length)]
    randomTaunt()
  }

  // Toggle sound on/off
  function toggleSound() {
    isEnabled.value = !isEnabled.value

    // Play confirmation sound
    if (isEnabled.value) {
      playClick()
    }

    return isEnabled.value
  }

  // Set volume (0 to 1)
  function setVolume(val) {
    volume.value = Math.max(0, Math.min(1, val))
  }

  return {
    // State
    isEnabled,
    volume,

    // Game events
    playAskCard,
    playCardReceived,
    playGoFish,
    playGoFishTaunt,
    playWrongGuessTaunt,
    playDrawCard,
    playBookComplete,
    playTurnChange,
    playYourTurn,
    playWin,
    playLose,

    // Troller events
    playOctopusTroll,
    playEarthquake,
    playDeckSwap,

    // UI feedback
    playClick,
    playError,

    // Controls
    toggleSound,
    setVolume,
    initAudio
  }
}
