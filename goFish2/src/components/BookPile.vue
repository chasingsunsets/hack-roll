<script setup>
import { ref, watch } from 'vue'
import PixelFish from './PixelFish.vue'

const props = defineProps({
  books: {
    type: Array,
    default: () => []
    // Each book: { rank: string }
  },
  playerName: {
    type: String,
    default: 'Player'
  },
  fishColor: {
    type: String,
    default: 'orange'
  },
  isCurrentPlayer: {
    type: Boolean,
    default: false
  }
})

// Track newly added books for animation
const animatingBook = ref(null)

watch(() => props.books.length, (newLen, oldLen) => {
  if (newLen > oldLen) {
    // New book was added, trigger animation
    animatingBook.value = newLen - 1
    setTimeout(() => {
      animatingBook.value = null
    }, 600)
  }
})

// Calculate fan angle for each book card
const getFanStyle = (index, total) => {
  if (total <= 1) return {}
  const maxAngle = Math.min(total * 8, 30)
  const angleStep = maxAngle / (total - 1 || 1)
  const angle = -maxAngle / 2 + index * angleStep
  const offset = Math.abs(index - (total - 1) / 2) * 2
  return {
    transform: `rotate(${angle}deg) translateY(${offset}px)`,
    zIndex: index
  }
}
</script>

<template>
  <div class="book-pile" :class="{ 'current-player': isCurrentPlayer }">
    <div class="pile-header">
      <div class="header-fish">
        <PixelFish :size="20" :color="fishColor" />
      </div>
      <span class="player-name">{{ playerName }}</span>
      <span class="book-count">{{ books.length }}</span>
    </div>
    <div class="books-display">
      <div
        v-for="(book, index) in books"
        :key="index"
        class="book-stack"
        :class="{ 'animating': animatingBook === index }"
        :style="getFanStyle(index, books.length)"
      >
        <div class="book-card">
          <span class="book-rank">{{ book.rank }}</span>
          <div class="card-suits">
            <span class="mini-suit">*</span>
          </div>
        </div>
        <!-- Sparkle effect for new books -->
        <div v-if="animatingBook === index" class="sparkle-container">
          <div class="sparkle s1"></div>
          <div class="sparkle s2"></div>
          <div class="sparkle s3"></div>
          <div class="sparkle s4"></div>
        </div>
      </div>
      <div v-if="books.length === 0" class="no-books">
        <span class="empty-text">---</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.book-pile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.4);
  border: 3px solid rgba(255, 255, 255, 0.15);
  min-width: 90px;
  font-family: 'Press Start 2P', monospace;
  transition: all 0.2s steps(4);
}

.book-pile.current-player {
  border-color: #ffd700;
  background: rgba(255, 215, 0, 0.15);
  box-shadow:
    inset -3px -3px 0 rgba(0, 0, 0, 0.2),
    inset 3px 3px 0 rgba(255, 215, 0, 0.2),
    0 0 15px rgba(255, 215, 0, 0.3);
}

.pile-header {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  justify-content: center;
}

.header-fish {
  display: flex;
  align-items: center;
}

.player-name {
  font-size: 0.4rem;
  color: #fff;
  max-width: 50px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-count {
  font-size: 0.5rem;
  color: #5dfc9a;
  background: rgba(0, 0, 0, 0.5);
  padding: 3px 6px;
  border: 2px solid #5dfc9a;
  min-width: 20px;
  text-align: center;
}

.books-display {
  display: flex;
  justify-content: center;
  position: relative;
  min-height: 48px;
  padding: 5px 10px;
}

.book-stack {
  position: relative;
  transition: transform 0.2s steps(4);
  transform-origin: bottom center;
  margin: 0 -6px;
}

.book-stack:hover {
  z-index: 100 !important;
  transform: translateY(-8px) scale(1.1) !important;
}

.book-stack.animating {
  animation: book-pop 0.6s steps(6) forwards;
}

@keyframes book-pop {
  0% {
    transform: scale(0) rotate(-20deg);
    opacity: 0;
  }
  40% {
    transform: scale(1.3) rotate(5deg);
    opacity: 1;
  }
  70% {
    transform: scale(0.9) rotate(-3deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

.book-card {
  width: 32px;
  height: 44px;
  background: linear-gradient(135deg, #f8f4e8 0%, #e8e4d8 100%);
  border: 2px solid #2c2c2c;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  box-shadow:
    inset -2px -2px 0 #d4d0c4,
    inset 2px 2px 0 #ffffff,
    3px 3px 0 rgba(0, 0, 0, 0.3);
}

.book-rank {
  font-size: 0.7rem;
  font-weight: bold;
  color: #1a1a2e;
}

.card-suits {
  display: flex;
  gap: 1px;
}

.mini-suit {
  font-size: 0.4rem;
  color: #ffd700;
}

.no-books {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 44px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
}

.empty-text {
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.4rem;
}

/* Sparkle effects */
.sparkle-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.sparkle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #ffd700;
  animation: sparkle-burst 0.6s steps(6) forwards;
}

.sparkle.s1 {
  --angle: -45deg;
  --distance: 25px;
}

.sparkle.s2 {
  --angle: 45deg;
  --distance: 25px;
  animation-delay: 0.1s;
}

.sparkle.s3 {
  --angle: 135deg;
  --distance: 25px;
  animation-delay: 0.2s;
}

.sparkle.s4 {
  --angle: 225deg;
  --distance: 25px;
  animation-delay: 0.15s;
}

@keyframes sparkle-burst {
  0% {
    transform: rotate(var(--angle)) translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: rotate(var(--angle)) translateY(var(--distance)) scale(0);
    opacity: 0;
  }
}
</style>
