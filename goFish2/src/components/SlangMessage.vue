<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  playerName: {
    type: String,
    required: true
  },
  slangText: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['complete'])

const phase = ref('entering') // entering, showing, exiting

onMounted(async () => {
  // Speak the slang text using Web Speech API
  speakText(props.slangText)

  // Phase 1: Enter
  await delay(100)
  phase.value = 'showing'

  // Phase 2: Show
  await delay(2000)
  phase.value = 'exiting'

  // Phase 3: Exit
  await delay(400)
  emit('complete')
})

function speakText(text) {
  // Check if browser supports Speech Synthesis
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)

    // Configure speech properties
    utterance.rate = 1.1 // Slightly faster
    utterance.pitch = 1.2 // Slightly higher pitch for comedic effect
    utterance.volume = 1

    // Try to use a suitable voice (prefer English-SG if available)
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(voice =>
      voice.lang.includes('en-SG') ||
      voice.lang.includes('en-GB') ||
      voice.lang.includes('en')
    )

    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    window.speechSynthesis.speak(utterance)
  }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
</script>

<template>
  <div class="slang-overlay">
    <div class="slang-message" :class="phase">
      <div class="player-badge">{{ playerName }}</div>
      <div class="slang-text">{{ slangText }}</div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.slang-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Press Start 2P', monospace;
}

.slang-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transform-origin: center;
}

.player-badge {
  font-size: 0.8rem;
  color: #FFD700;
  background: rgba(0, 0, 0, 0.8);
  padding: 8px 16px;
  border: 3px solid #FFD700;
  border-radius: 8px;
  text-shadow: 2px 2px 0 #000;
  box-shadow:
    0 0 20px rgba(255, 215, 0, 0.5),
    inset 0 0 10px rgba(255, 215, 0, 0.3);
}

.slang-text {
  font-size: 3rem;
  color: #FF6B35;
  background: rgba(0, 0, 0, 0.9);
  padding: 20px 40px;
  border: 4px solid #FF6B35;
  border-radius: 12px;
  text-shadow:
    4px 4px 0 #000,
    -2px -2px 0 #000,
    2px -2px 0 #000,
    -2px 2px 0 #000,
    0 0 40px rgba(255, 107, 53, 0.8);
  box-shadow:
    0 0 30px rgba(255, 107, 53, 0.6),
    inset 0 0 20px rgba(255, 107, 53, 0.2);
}

/* Entering animation */
.slang-message.entering {
  animation: pop-in 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
  opacity: 0;
}

@keyframes pop-in {
  0% {
    transform: scale(0) rotate(-45deg);
    opacity: 0;
  }
  60% {
    transform: scale(1.15) rotate(5deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* Showing animation */
.slang-message.showing {
  animation: bounce-gentle 0.5s ease-in-out infinite;
  opacity: 1;
}

@keyframes bounce-gentle {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-10px) scale(1.02);
  }
}

/* Exiting animation */
.slang-message.exiting {
  animation: zoom-out 0.4s cubic-bezier(0.55, 0, 1, 0.45) forwards;
}

@keyframes zoom-out {
  0% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: scale(0) rotate(180deg);
    opacity: 0;
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .player-badge {
    font-size: 0.6rem;
    padding: 6px 12px;
  }

  .slang-text {
    font-size: 2rem;
    padding: 15px 30px;
    text-shadow:
      3px 3px 0 #000,
      -2px -2px 0 #000,
      2px -2px 0 #000,
      -2px 2px 0 #000,
      0 0 30px rgba(255, 107, 53, 0.8);
  }
}

@media (max-width: 480px) {
  .player-badge {
    font-size: 0.5rem;
    padding: 4px 10px;
  }

  .slang-text {
    font-size: 1.5rem;
    padding: 12px 24px;
    text-shadow:
      2px 2px 0 #000,
      -1px -1px 0 #000,
      1px -1px 0 #000,
      -1px 1px 0 #000,
      0 0 20px rgba(255, 107, 53, 0.8);
  }
}
</style>
