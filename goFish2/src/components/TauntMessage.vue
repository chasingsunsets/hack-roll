<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['complete'])

const tauntMessages = [
  "NOPE! 😂",
  "WRONG! 🤣",
  "TRY AGAIN! 😜",
  "GO FISH! 🐟",
  "BETTER LUCK NEXT TIME! 😏",
  "MISS! ❌",
  "NOT EVEN CLOSE! 🎣",
  "SWING AND A MISS! ⚾",
  "NICE TRY! 😆"
]

const selectedTaunt = ref('')
const phase = ref('entering') // entering, showing, exiting

onMounted(async () => {
  // Pick random taunt message
  selectedTaunt.value = tauntMessages[Math.floor(Math.random() * tauntMessages.length)]

  // Phase 1: Enter
  await delay(100)
  phase.value = 'showing'

  // Phase 2: Show
  await delay(1800)
  phase.value = 'exiting'

  // Phase 3: Exit
  await delay(400)
  emit('complete')
})

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
</script>

<template>
  <div class="taunt-overlay">
    <div class="taunt-message" :class="phase">
      {{ selectedTaunt }}
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.taunt-overlay {
  position: fixed;
  inset: 0;
  z-index: 9997;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Press Start 2P', monospace;
}

.taunt-message {
  font-size: 4rem;
  color: #FF6B35;
  text-shadow:
    4px 4px 0 #000,
    -4px -4px 0 #000,
    4px -4px 0 #000,
    -4px 4px 0 #000,
    0 0 40px rgba(255, 107, 53, 0.8);
  transform-origin: center;
}

/* Entering animation */
.taunt-message.entering {
  animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
  opacity: 0;
}

@keyframes bounce-in {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  60% {
    transform: scale(1.2) rotate(10deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* Showing animation */
.taunt-message.showing {
  animation: wobble 0.3s ease-in-out infinite;
  opacity: 1;
}

@keyframes wobble {
  0%, 100% {
    transform: scale(1) rotate(-3deg);
  }
  25% {
    transform: scale(1.05) rotate(3deg);
  }
  50% {
    transform: scale(1) rotate(-3deg);
  }
  75% {
    transform: scale(1.05) rotate(3deg);
  }
}

/* Exiting animation */
.taunt-message.exiting {
  animation: spin-out 0.4s cubic-bezier(0.55, 0, 1, 0.45) forwards;
}

@keyframes spin-out {
  0% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: scale(0) rotate(360deg);
    opacity: 0;
  }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .taunt-message {
    font-size: 2.5rem;
    text-shadow:
      3px 3px 0 #000,
      -3px -3px 0 #000,
      3px -3px 0 #000,
      -3px 3px 0 #000,
      0 0 30px rgba(255, 107, 53, 0.8);
  }
}

@media (max-width: 480px) {
  .taunt-message {
    font-size: 1.8rem;
    text-shadow:
      2px 2px 0 #000,
      -2px -2px 0 #000,
      2px -2px 0 #000,
      -2px 2px 0 #000,
      0 0 20px rgba(255, 107, 53, 0.8);
  }
}
</style>
