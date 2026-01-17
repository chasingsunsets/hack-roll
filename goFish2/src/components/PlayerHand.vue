
<script setup>
import { computed } from 'vue'
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

defineEmits(['select-card'])
</script>

<template>
  <div class="player-hand">
    <div class="hand-container">
      <Card
        v-for="(card, index) in cards"
        :key="`${card.suit}-${card.rank}-${index}`"
        :suit="card.suit"
        :rank="card.rank"
        :selected="selectedCard && selectedCard.suit === card.suit && selectedCard.rank === card.rank"
        :is-new="isNewCard(card, index)"
        class="hand-card"
        :class="{ 'newly-gained': isNewCard(card, index) }"
        :style="{ 
          '--card-index': index, 
          '--total-cards': cards.length,
          '--animation-delay': isNewCard(card, index) ? `${(cards.length - 1 - index) * 0.1}s` : '0s'
        }"
        @click="$emit('select-card', card)"
      />
    </div>
  </div>
</template>

<style scoped>
.player-hand {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.hand-container {
  display: flex;
  justify-content: center;
  position: relative;
  height: 140px;
}

.hand-card {
  position: relative;
  margin-left: -30px;
  transition: all 0.3s ease;
}

.hand-card:first-child {
  margin-left: 0;
}

.hand-card:hover {
  z-index: 10;
}

.hand-card.newly-gained {
  animation: cardFlyIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) var(--animation-delay, 0s),
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
