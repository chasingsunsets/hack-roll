<script setup>
import Card from './Card.vue'
import PixelFish from './PixelFish.vue'
import PixelShark from './PixelShark.vue'
import PlayerCameraFeed from './camera/PlayerCameraFeed.vue'

defineProps({
  cardCount: {
    type: Number,
    required: true
  },
  cards: {
    type: Array,
    default: () => []
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
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  isSelectable: {
    type: Boolean,
    default: false
  },
  cameraStream: {
    type: MediaStream,
    default: null
  },
  showCamera: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select'])

const fishColors = { 'Bot 1': 'blue', 'Bot 2': 'green', 'Bot 3': 'pink' }

function handleClick() {
  emit('select')
}
</script>

<template>
  <div class="opponent-container">
    <div
      class="opponent-hand pixel-panel"
      :class="[position, { 'current-turn': isCurrentTurn, 'selected': isSelected, 'selectable': isSelectable }]"
      @click="handleClick"
    >
      <div class="opponent-info">
        <div class="avatar">
          <PixelShark :size="28" color="blue" />
        </div>
        <div class="name-and-count">
          <span class="name">{{ name }}</span>
          <span class="card-count">{{ cardCount }}</span>
        </div>
      </div>
      <div class="cards-container" :class="position">
        <template v-if="cards.length > 0">
          <Card
            v-for="(card, i) in cards.slice(0, 7)"
            :key="i"
            :suit="card.suit"
            :rank="card.rank"
            :face-down="true"
            :small="true"
            class="opponent-card"
            :style="{ '--card-index': i + 1 }"
          />
        </template>
        <template v-else>
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
        </template>
        <div v-if="cardCount > 7" class="extra-cards">+{{ cardCount - 7 }}</div>
      </div>
    </div>
    <!-- Camera feed outside the yellow box - prominent display -->
    <PlayerCameraFeed
      v-if="showCamera && cameraStream"
      :stream="cameraStream"
      :player-name="name"
      :is-local="false"
      size="xlarge"
      class="opponent-camera-external"
    />
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.opponent-container {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* When camera is visible, add visual connection */
.opponent-container:has(.opponent-camera-external) {
  background: rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 4px;
  border: 2px solid rgba(79, 195, 247, 0.3);
}

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

.opponent-hand.selectable {
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.opponent-hand.selectable:hover {
  transform: scale(1.05);
  border-color: #4fc3f7;
  box-shadow: 0 0 20px rgba(79, 195, 247, 0.4);
}

.opponent-hand.selected {
  border-color: #5dfc9a !important;
  background: rgba(93, 252, 154, 0.15);
  box-shadow: 0 0 25px rgba(93, 252, 154, 0.5), inset 0 0 15px rgba(93, 252, 154, 0.1);
  animation: selected-pulse 1.5s ease-in-out infinite;
}

@keyframes selected-pulse {
  0%, 100% {
    box-shadow: 0 0 25px rgba(93, 252, 154, 0.5), inset 0 0 15px rgba(93, 252, 154, 0.1);
  }
  50% {
    box-shadow: 0 0 35px rgba(93, 252, 154, 0.7), inset 0 0 20px rgba(93, 252, 154, 0.2);
  }
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

.name-and-count {
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  text-align: center;
}

.cards-container {
  display: flex;
  justify-content: center;
  position: relative;
}

.opponent-camera-external {
  flex-shrink: 0;
  animation: camera-glow 2s ease-in-out infinite;
}

@keyframes camera-glow {
  0%, 100% {
    filter: drop-shadow(0 0 8px rgba(79, 195, 247, 0.4));
  }
  50% {
    filter: drop-shadow(0 0 15px rgba(79, 195, 247, 0.7));
  }
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
