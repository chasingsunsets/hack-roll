<script setup>
import PixelFish from './PixelFish.vue'
import PixelSuit from './PixelSuit.vue'

defineProps({
  suit: {
    type: String,
    required: true
  },
  rank: {
    type: String,
    required: true
  },
  faceDown: {
    type: Boolean,
    default: false
  },
  selected: {
    type: Boolean,
    default: false
  },
  small: {
    type: Boolean,
    default: false
  },
  animated: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

// Map suits to fish suit names for color determination
const suitToFish = {
  '♠': 'wave',
  '♥': 'coral',
  '♦': 'pearl',
  '♣': 'algae'
}

const getSuitColor = (suit) => {
  const colors = {
    '♥': '#ff6b35',
    '♦': '#f8bbd9',
    '♠': '#4fc3f7',
    '♣': '#81c784'
  }
  return colors[suit] || '#ff6b35'
}

const getFishColor = (suit) => {
  const colorMap = {
    '♠': 'blue',
    '♥': 'orange',
    '♦': 'pink',
    '♣': 'green'
  }
  return colorMap[suit] || 'orange'
}

const getSuitName = (suit) => suitToFish[suit] || 'coral'
</script>

<template>
  <div
    class="card pixel-card"
    :class="{
      'face-down': faceDown,
      'selected': selected,
      'small': small,
      'animated': animated
    }"
    @click="$emit('click')"
  >
    <template v-if="!faceDown">
      <div class="card-inner">
        <!-- Top left corner -->
        <div class="card-corner top-left">
          <span class="rank" :style="{ color: getSuitColor(suit) }">{{ rank }}</span>
          <PixelSuit :suit="suit" :size="small ? 10 : 14" />
        </div>

        <!-- Center fish with decorative suits -->
        <div class="card-center">
          <div class="center-decoration top">
            <PixelSuit :suit="suit" :size="small ? 8 : 12" />
          </div>
          <PixelFish :size="small ? 28 : 44" :color="getFishColor(suit)" />
          <div class="center-decoration bottom">
            <PixelSuit :suit="suit" :size="small ? 8 : 12" />
          </div>
        </div>

        <!-- Bottom right corner -->
        <div class="card-corner bottom-right">
          <span class="rank" :style="{ color: getSuitColor(suit) }">{{ rank }}</span>
          <PixelSuit :suit="suit" :size="small ? 10 : 14" />
        </div>

        <!-- Decorative pixel border pattern -->
        <div class="pixel-border-pattern">
          <div class="border-corner tl"></div>
          <div class="border-corner tr"></div>
          <div class="border-corner bl"></div>
          <div class="border-corner br"></div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="card-back">
        <div class="card-back-inner">
          <PixelFish :size="small ? 24 : 36" color="gold" />
        </div>
        <!-- Animated wave pattern -->
        <div class="back-pattern">
          <div class="wave-line" v-for="i in 5" :key="i" :style="{ '--wave-delay': i * 0.2 + 's' }"></div>
        </div>
        <!-- Corner decorations -->
        <div class="back-corners">
          <div class="back-corner tl"></div>
          <div class="back-corner tr"></div>
          <div class="back-corner bl"></div>
          <div class="back-corner br"></div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.card {
  width: var(--card-width, 90px);
  height: var(--card-height, 130px);
  position: relative;
  cursor: pointer;
  transition: transform 0.15s steps(4), box-shadow 0.15s steps(4);
  image-rendering: pixelated;
  border-radius: 0 !important;
}

.card.small {
  --card-width: 56px;
  --card-height: 80px;
}

.card-inner,
.card-back {
  width: 100%;
  height: 100%;
  border-radius: 0 !important;
  position: relative;
  overflow: hidden;
}

.card-inner {
  background: linear-gradient(135deg, #f8f4e8 0%, #e8e4d8 100%);
  border: 3px solid #2c2c2c;
  box-shadow:
    inset -3px -3px 0 #d4d0c4,
    inset 3px 3px 0 #ffffff,
    4px 4px 0 rgba(0, 0, 0, 0.3);
}

.card:hover {
  transform: translateY(-8px);
}

.card:hover .card-inner {
  box-shadow:
    inset -3px -3px 0 #d4d0c4,
    inset 3px 3px 0 #ffffff,
    6px 8px 0 rgba(0, 0, 0, 0.4);
}

.card.selected {
  transform: translateY(-16px);
}

.card.selected .card-inner {
  border-color: #ffd700;
  box-shadow:
    inset -3px -3px 0 #d4d0c4,
    inset 3px 3px 0 #ffffff,
    0 0 0 3px #ffd700,
    8px 10px 0 rgba(0, 0, 0, 0.4);
}

/* Pixel border decorations */
.pixel-border-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.border-corner {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #2c2c2c;
}

.border-corner.tl {
  top: 0;
  left: 0;
  clip-path: polygon(0 0, 100% 0, 0 100%);
  background: linear-gradient(135deg, #2c2c2c 50%, transparent 50%);
}

.border-corner.tr {
  top: 0;
  right: 0;
  clip-path: polygon(0 0, 100% 0, 100% 100%);
  background: linear-gradient(225deg, #2c2c2c 50%, transparent 50%);
}

.border-corner.bl {
  bottom: 0;
  left: 0;
  clip-path: polygon(0 0, 0 100%, 100% 100%);
  background: linear-gradient(45deg, #2c2c2c 50%, transparent 50%);
}

.border-corner.br {
  bottom: 0;
  right: 0;
  clip-path: polygon(100% 0, 0 100%, 100% 100%);
  background: linear-gradient(315deg, #2c2c2c 50%, transparent 50%);
}

.card.small .border-corner {
  width: 4px;
  height: 4px;
}

/* Card corners */
.card-corner {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-family: 'Press Start 2P', monospace;
  font-weight: bold;
  line-height: 1;
}

.top-left {
  top: 6px;
  left: 6px;
}

.bottom-right {
  bottom: 6px;
  right: 6px;
  transform: rotate(180deg);
}

.rank {
  font-size: 0.9rem;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2);
}

.card.small .rank {
  font-size: 0.6rem;
}

.card.small .top-left {
  top: 4px;
  left: 4px;
}

.card.small .bottom-right {
  bottom: 4px;
  right: 4px;
}

/* Card center */
.card-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.center-decoration {
  opacity: 0.6;
}

.center-decoration.top {
  transform: translateY(4px);
}

.center-decoration.bottom {
  transform: translateY(-4px) rotate(180deg);
}

.card.small .center-decoration {
  display: none;
}

/* Face down card */
.card-back {
  background: linear-gradient(135deg, #1a3a5c 0%, #0d2847 100%);
  border: 3px solid #0a1628;
  box-shadow:
    inset -3px -3px 0 #0d2847,
    inset 3px 3px 0 #2a5a8c,
    4px 4px 0 rgba(0, 0, 0, 0.3);
}

.card.face-down:hover {
  transform: none;
}

.card-back-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}

/* Animated wave pattern */
.back-pattern {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  border: 2px solid #ffd700;
  overflow: hidden;
}

.wave-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(255, 215, 0, 0.3) 25%,
    rgba(255, 215, 0, 0.5) 50%,
    rgba(255, 215, 0, 0.3) 75%,
    transparent 100%
  );
  animation: wave-move 3s ease-in-out infinite;
  animation-delay: var(--wave-delay, 0s);
}

.wave-line:nth-child(1) { top: 20%; }
.wave-line:nth-child(2) { top: 35%; }
.wave-line:nth-child(3) { top: 50%; }
.wave-line:nth-child(4) { top: 65%; }
.wave-line:nth-child(5) { top: 80%; }

@keyframes wave-move {
  0%, 100% {
    transform: translateX(-20%);
    opacity: 0.3;
  }
  50% {
    transform: translateX(20%);
    opacity: 0.6;
  }
}

.card.small .back-pattern {
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 5px;
}

.card.small .wave-line {
  height: 1px;
}

/* Back corner decorations */
.back-corners {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  pointer-events: none;
}

.back-corner {
  position: absolute;
  width: 8px;
  height: 8px;
  border: 2px solid #ffd700;
}

.back-corner.tl {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
}

.back-corner.tr {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
}

.back-corner.bl {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
}

.back-corner.br {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
}

.card.small .back-corners {
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 5px;
}

.card.small .back-corner {
  width: 5px;
  height: 5px;
}

/* Animation class */
.card.animated {
  animation: card-deal 0.3s steps(4) forwards;
}

@keyframes card-deal {
  0% {
    transform: translate(0, -50px) scale(0.8);
    opacity: 0;
  }
  50% {
    transform: translate(0, -20px) scale(0.95);
    opacity: 0.8;
  }
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
}
</style>
