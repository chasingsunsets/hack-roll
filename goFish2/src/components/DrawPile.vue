<script setup>
import Card from './Card.vue'
import PixelFish from './PixelFish.vue'

defineProps({
  cardsRemaining: {
    type: Number,
    required: true
  },
  canDraw: {
    type: Boolean,
    default: false
  }
})

defineEmits(['draw'])
</script>

<template>
  <div class="draw-pile" :class="{ 'can-draw': canDraw }">
    <div class="pile-stack" @click="canDraw && $emit('draw')">
      <Card
        v-for="i in Math.min(5, cardsRemaining)"
        :key="i"
        suit="♠"
        rank="A"
        :face-down="true"
        class="pile-card"
        :style="{ '--stack-index': i }"
      />
      <div v-if="cardsRemaining === 0" class="empty-pile">
        <span>EMPTY</span>
      </div>
    </div>
    <div class="pile-info">
      <span class="pile-label">DRAW PILE</span>
      <span class="pile-count">{{ cardsRemaining }}</span>
    </div>
    <div v-if="canDraw" class="draw-hint">
      <PixelFish :size="20" color="gold" />
      <span>GO FISH!</span>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.draw-pile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  font-family: 'Press Start 2P', monospace;
}

.pile-stack {
  position: relative;
  width: 90px;
  height: 130px;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.can-draw .pile-stack:hover {
  transform: scale(1.05);
}

.pile-card {
  position: absolute;
  top: 0;
  left: 0;
  transform: translateY(calc(var(--stack-index) * -3px)) translateX(calc(var(--stack-index) * 2px));
  pointer-events: none;
}

.empty-pile {
  width: 90px;
  height: 130px;
  border: 4px dashed rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.6rem;
}

.pile-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.pile-label {
  font-size: 0.6rem;
  color: #4fc3f7;
}

.pile-count {
  font-size: 0.8rem;
  color: #fff;
  background: #1a3a5c;
  padding: 6px 12px;
  border: 3px solid #4fc3f7;
  box-shadow:
    inset -2px -2px 0 #0d2847,
    inset 2px 2px 0 #2a5a8c;
}

.draw-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ff6b35;
  color: white;
  padding: 10px 18px;
  font-size: 0.6rem;
  border: none;
  box-shadow:
    inset -3px -3px 0 #cc4a1a,
    inset 3px 3px 0 #ff9a6c,
    4px 4px 0 rgba(0, 0, 0, 0.4);
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.can-draw .pile-stack {
  animation: glow 1.5s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% {
    filter: drop-shadow(0 0 5px rgba(255, 107, 53, 0.5));
  }
  50% {
    filter: drop-shadow(0 0 15px rgba(255, 107, 53, 0.8));
  }
}
</style>
