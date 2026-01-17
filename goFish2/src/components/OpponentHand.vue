<script setup>
import Card from './Card.vue'
import PixelFish from './PixelFish.vue'

defineProps({
  cardCount: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    default: 'Opponent'
  },
  position: {
    type: String,
    default: 'top' // 'top', 'left', 'right'
  },
  isCurrentTurn: {
    type: Boolean,
    default: false
  }
})

const fishColors = { 'Bot 1': 'blue', 'Bot 2': 'green', 'Bot 3': 'pink' }
</script>

<template>
  <div class="opponent-hand pixel-panel" :class="[position, { 'current-turn': isCurrentTurn }]">
    <div class="opponent-info">
      <div class="avatar">
        <PixelFish :size="24" :color="fishColors[name] || 'blue'" />
      </div>
      <span class="name">{{ name }}</span>
      <span class="card-count">{{ cardCount }}</span>
    </div>
    <div class="cards-container" :class="position">
      <Card
        v-for="i in Math.min(cardCount, 7)"
        :key="i"
        suit="♠"
        rank="A"
        :face-down="true"
        :small="true"
        class="opponent-card"
        :style="{ '--card-index': i }"
      />
      <div v-if="cardCount > 7" class="extra-cards">+{{ cardCount - 7 }}</div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.opponent-hand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 12px;
  font-family: 'Press Start 2P', monospace;
}

.pixel-panel {
  background: rgba(0, 0, 0, 0.4);
  border: 3px solid rgba(255, 255, 255, 0.2);
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.3);
}

.opponent-hand.current-turn {
  border-color: #ffd700;
  background: rgba(255, 215, 0, 0.1);
}

.opponent-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
}

.name {
  font-size: 0.55rem;
  color: #fff;
}

.card-count {
  font-size: 0.5rem;
  color: #4fc3f7;
  background: rgba(0, 0, 0, 0.4);
  padding: 3px 8px;
  border: 2px solid #4fc3f7;
}

.cards-container {
  display: flex;
  justify-content: center;
  position: relative;
}

.cards-container.top .opponent-card {
  margin-left: -22px;
}

.cards-container.top .opponent-card:first-child {
  margin-left: 0;
}

.opponent-card {
  transition: transform 0.2s ease;
}

.extra-cards {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 55px;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 0.5rem;
  margin-left: -18px;
}

/* Left position - vertical layout */
.opponent-hand.left {
  flex-direction: column;
}

.opponent-hand.left .cards-container {
  flex-direction: column;
  align-items: center;
}

.opponent-hand.left .opponent-card {
  margin-left: 0;
  margin-top: -45px;
}

.opponent-hand.left .opponent-card:first-child {
  margin-top: 0;
}

.opponent-hand.left .extra-cards {
  margin-left: 0;
  margin-top: -40px;
  width: 55px;
  height: 30px;
}

/* Right position - vertical layout */
.opponent-hand.right {
  flex-direction: column;
}

.opponent-hand.right .cards-container {
  flex-direction: column;
  align-items: center;
}

.opponent-hand.right .opponent-card {
  margin-left: 0;
  margin-top: -45px;
}

.opponent-hand.right .opponent-card:first-child {
  margin-top: 0;
}

.opponent-hand.right .extra-cards {
  margin-left: 0;
  margin-top: -40px;
  width: 55px;
  height: 30px;
}
</style>
