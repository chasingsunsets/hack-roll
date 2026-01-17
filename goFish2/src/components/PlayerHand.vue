
<script setup>
import { computed, ref, reactive, onMounted, onUnmounted } from 'vue'
import Card from './Card.vue'

const props = defineProps({
  cards: {
    type: Array,
    required: true
  },
  selectedCard: {
    type: Object,
    default: null
  },
  cardGainAnimation: {
    type: Boolean,
    default: false
  },
  lastHandSize: {
    type: Number,
    default: 0
  }
})

const isNewCard = (card, index) => {
  // Cards that are beyond the last hand size are newly gained
  return props.cardGainAnimation && index >= props.lastHandSize
}

// Find ranks that have exactly 3 cards (one away from a book!)
const ranksWithThree = computed(() => {
  const rankCounts = {}
  for (const card of props.cards) {
    rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1
  }
  return Object.keys(rankCounts).filter(rank => rankCounts[rank] === 3)
})

// Check if a card is part of a "3-of-a-kind" set
const isAlmostBook = (card) => {
  return ranksWithThree.value.includes(card.rank)
}

// Track flee offsets for each card
const cardFleeOffsets = reactive({})

// Store refs to card elements
const cardRefs = ref({})

// Mouse position
const mousePos = ref({ x: 0, y: 0 })

// Global mouse tracking
function handleGlobalMouseMove(event) {
  mousePos.value = { x: event.clientX, y: event.clientY }

  // Update flee positions for all almost-book cards
  props.cards.forEach((card, index) => {
    if (!isAlmostBook(card)) return

    const key = `${card.suit}-${card.rank}-${index}`
    const cardEl = cardRefs.value[key]
    if (!cardEl) return

    const rect = cardEl.getBoundingClientRect()
    // Use the original position (subtract current offset)
    const currentOffset = cardFleeOffsets[key] || { x: 0, y: 0 }
    const originalCenterX = rect.left + rect.width / 2 - currentOffset.x
    const originalCenterY = rect.top + rect.height / 2 - currentOffset.y

    // Calculate direction away from mouse
    const dx = originalCenterX - event.clientX
    const dy = originalCenterY - event.clientY
    const distance = Math.sqrt(dx * dx + dy * dy)

    const fleeRadius = 350 // Start fleeing when mouse is within this distance

    if (distance < fleeRadius) {
      // The closer the mouse, the faster/further the flee
      const fleeIntensity = (fleeRadius - distance) / fleeRadius
      const fleeSpeed = 800 * fleeIntensity // Max 800px flee - cards can fly across the screen!

      // Normalize and scale the flee vector
      const fleeX = (dx / distance) * fleeSpeed
      const fleeY = (dy / distance) * fleeSpeed

      cardFleeOffsets[key] = { x: fleeX, y: fleeY }
    } else {
      // Gradually return to original position
      if (cardFleeOffsets[key]) {
        const current = cardFleeOffsets[key]
        const returnSpeed = 0.1
        const newX = current.x * (1 - returnSpeed)
        const newY = current.y * (1 - returnSpeed)

        if (Math.abs(newX) < 1 && Math.abs(newY) < 1) {
          cardFleeOffsets[key] = { x: 0, y: 0 }
        } else {
          cardFleeOffsets[key] = { x: newX, y: newY }
        }
      }
    }
  })
}

// Store card ref
function setCardRef(el, card, index) {
  if (el) {
    const key = `${card.suit}-${card.rank}-${index}`
    cardRefs.value[key] = el
  }
}

// Get flee transform for a card
function getFleeTransform(card, index) {
  const key = `${card.suit}-${card.rank}-${index}`
  const offset = cardFleeOffsets[key]
  if (offset && (offset.x !== 0 || offset.y !== 0)) {
    return `translate(${offset.x}px, ${offset.y}px)`
  }
  return ''
}

onMounted(() => {
  document.addEventListener('mousemove', handleGlobalMouseMove)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleGlobalMouseMove)
})

defineEmits(['select-card'])
</script>

<template>
  <div class="player-hand">
    <div class="hand-container">
      <div
        v-for="(card, index) in cards"
        :key="`${card.suit}-${card.rank}-${index}`"
        :ref="(el) => setCardRef(el, card, index)"
        class="card-wrapper"
        :class="{
          'flee-card': isAlmostBook(card),
          'newly-gained': isNewCard(card, index)
        }"
        :style="{
          '--card-index': index,
          '--total-cards': cards.length,
          '--animation-delay': isNewCard(card, index) ? `${(cards.length - 1 - index) * 0.1}s` : '0s',
          transform: getFleeTransform(card, index)
        }"
      >
        <Card
          :suit="card.suit"
          :rank="card.rank"
          :selected="selectedCard && selectedCard.suit === card.suit && selectedCard.rank === card.rank"
          :is-new="isNewCard(card, index)"
          class="hand-card"
          @click="$emit('select-card', card)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.player-hand {
  padding: 20px;
  display: flex;
  justify-content: center;
  perspective: 1000px;
}

.hand-container {
  display: flex;
  justify-content: center;
  position: relative;
  height: 160px;
  padding: 10px 0;
}

.card-wrapper {
  position: relative;
  margin-left: -25px;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
              z-index 0s;
  animation: cardAppear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
  animation-delay: calc(var(--card-index, 0) * 0.05s);
}

@keyframes cardAppear {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.8) rotateX(20deg);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1) rotateX(0);
  }
}

.card-wrapper:first-child {
  margin-left: 0;
}

.card-wrapper:hover {
  z-index: 100;
}

/* Cards that are part of a 3-of-a-kind - trolling effect */
.flee-card {
  cursor: not-allowed;
  animation: fleeGlow 2s ease-in-out infinite;
}

@keyframes fleeGlow {
  0%, 100% {
    filter: drop-shadow(0 0 8px rgba(255, 100, 100, 0.6));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(255, 50, 50, 0.9));
  }
}

.flee-card::before {
  content: '!';
  position: absolute;
  top: -12px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: #ff4444;
  border: 2px solid #ffcc00;
  color: #fff;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  animation: alertBounce 0.5s ease-in-out infinite;
}

@keyframes alertBounce {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-3px) scale(1.1); }
}

.hand-card {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card-wrapper.newly-gained {
  animation: cardFlyIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) var(--animation-delay, 0s) backwards,
             cardCelebration 1.2s ease-out var(--animation-delay, 0s);
  z-index: 100;
}

@keyframes cardFlyIn {
  0% {
    transform: translateY(-200px) translateX(calc(var(--card-index, 0) * 50px - 100px)) rotate(-180deg) scale(0.5);
    opacity: 0;
  }
  60% {
    transform: translateY(20px) translateX(0) rotate(10deg) scale(1.2);
    opacity: 1;
  }
  80% {
    transform: translateY(-10px) translateX(0) rotate(-5deg) scale(1.1);
  }
  100% {
    transform: translateY(0) translateX(0) rotate(0deg) scale(1);
    opacity: 1;
  }
}

@keyframes cardCelebration {
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.3) rotate(15deg);
  }
  50% {
    transform: scale(1.2) rotate(-15deg);
  }
  75% {
    transform: scale(1.25) rotate(10deg);
  }
}
</style>
