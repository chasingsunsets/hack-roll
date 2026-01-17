
<script setup>
import Card from './Card.vue'

defineProps({
  cards: {
    type: Array,
    required: true
  },
  selectedCard: {
    type: Object,
    default: null
  }
})

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
        class="hand-card"
        :style="{ '--card-index': index, '--total-cards': cards.length }"
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
</style>
