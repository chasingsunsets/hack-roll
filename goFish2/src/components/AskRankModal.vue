<script setup>
import { computed } from 'vue'
import PixelFish from './PixelFish.vue'
import PixelSuit from './PixelSuit.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  availableRanks: {
    type: Array,
    required: true
  },
  opponents: {
    type: Array,
    required: true
  },
  selectedRank: {
    type: String,
    default: null
  },
  selectedOpponent: {
    type: String,
    default: null
  }
})

defineEmits(['select-rank', 'select-opponent', 'confirm', 'cancel'])

const canConfirm = computed(() => props.selectedRank && props.selectedOpponent)

const fishColors = ['blue', 'green', 'pink', 'cyan', 'orange']

// Get fish color for opponent
const getOpponentColor = (index) => fishColors[index % fishColors.length]

// Get opponent identifier (supports both id and name)
const getOpponentId = (opponent) => opponent.id || opponent.name

// Check if opponent is selected
const isSelected = (opponent) => {
  const id = getOpponentId(opponent)
  return props.selectedOpponent === id || props.selectedOpponent === opponent.name
}

// Assign suits to ranks for visual variety
const getRankSuit = (rank) => {
  const suits = ['♠', '♥', '♦', '♣']
  const index = props.availableRanks.indexOf(rank) % 4
  return suits[index]
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="$emit('cancel')">
      <div class="modal-content pixel-panel">
        <div class="modal-header">
          <PixelFish :size="28" color="gold" />
          <h2 class="modal-title">ASK FOR A CARD</h2>
          <PixelFish :size="28" color="gold" />
        </div>

        <div class="selection-section">
          <h3>
            <span class="section-icon">
              <PixelSuit suit="♠" :size="12" />
            </span>
            CHOOSE RANK:
          </h3>
          <div class="rank-grid">
            <button
              v-for="rank in availableRanks"
              :key="rank"
              class="rank-btn pixel-btn-small"
              :class="{ selected: selectedRank === rank }"
              @click="$emit('select-rank', rank)"
            >
              <span class="rank-text">{{ rank }}</span>
              <PixelSuit :suit="getRankSuit(rank)" :size="10" />
            </button>
          </div>
        </div>

        <div class="selection-section">
          <h3>
            <span class="section-icon">
              <PixelFish :size="12" color="blue" />
            </span>
            ASK WHO?
          </h3>
          <div class="opponent-list">
            <button
              v-for="(opponent, index) in opponents"
              :key="getOpponentId(opponent)"
              class="opponent-btn"
              :class="{ selected: isSelected(opponent) }"
              @click="$emit('select-opponent', getOpponentId(opponent))"
            >
              <div class="opponent-avatar">
                <PixelFish :size="28" :color="getOpponentColor(index)" />
              </div>
              <div class="opponent-info">
                <span class="opponent-name">{{ opponent.name }}</span>
                <span class="opponent-cards">{{ opponent.cardCount }} cards</span>
              </div>
              <div class="select-indicator" v-if="isSelected(opponent)">
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <rect x="2" y="6" width="4" height="4" fill="#5dfc9a"/>
                  <rect x="6" y="10" width="4" height="4" fill="#5dfc9a"/>
                  <rect x="10" y="2" width="4" height="4" fill="#5dfc9a"/>
                  <rect x="6" y="6" width="4" height="4" fill="#5dfc9a"/>
                </svg>
              </div>
            </button>
          </div>
        </div>

        <div class="modal-actions">
          <button class="cancel-btn pixel-btn-secondary" @click="$emit('cancel')">
            CANCEL
          </button>
          <button
            class="confirm-btn pixel-btn"
            :class="{ disabled: !canConfirm }"
            :disabled="!canConfirm"
            @click="$emit('confirm')"
          >
            <PixelFish :size="16" color="gold" />
            ASK!
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 22, 40, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: overlay-in 0.2s steps(4);
  font-family: 'Press Start 2P', monospace;
}

@keyframes overlay-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  max-width: 480px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  animation: modal-slide 0.3s steps(6);
}

@keyframes modal-slide {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  50% {
    opacity: 1;
    transform: translateY(-5px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.pixel-panel {
  background: linear-gradient(135deg, #1a3a5c 0%, #0d2847 100%);
  border: 6px solid #ffd700;
  padding: 25px;
  box-shadow:
    inset -6px -6px 0 #0d2847,
    inset 6px 6px 0 #2a5a8c,
    12px 12px 0 rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.modal-title {
  margin: 0;
  text-align: center;
  color: #ffd700;
  font-size: 1rem;
  text-shadow: 3px 3px 0 #cc8800;
}

.selection-section {
  margin-bottom: 20px;
}

.selection-section h3 {
  margin: 0 0 12px 0;
  color: #4fc3f7;
  font-size: 0.6rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  display: flex;
  align-items: center;
}

.rank-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(55px, 1fr));
  gap: 8px;
}

.pixel-btn-small {
  padding: 10px 8px;
  background: rgba(0, 0, 0, 0.4);
  border: 3px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 0.7rem;
  font-family: 'Press Start 2P', monospace;
  cursor: pointer;
  transition: all 0.1s steps(2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.rank-text {
  font-size: 0.8rem;
}

.pixel-btn-small:hover {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.pixel-btn-small.selected {
  background: #ff6b35;
  border-color: #ffd700;
  box-shadow:
    inset -2px -2px 0 #cc4a1a,
    inset 2px 2px 0 #ff9a6c,
    0 0 0 2px #ffd700;
  transform: translateY(-2px);
}

.opponent-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.opponent-btn {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 15px;
  background: rgba(0, 0, 0, 0.4);
  border: 3px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  transition: all 0.1s steps(2);
  font-family: 'Press Start 2P', monospace;
}

.opponent-btn:hover {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.opponent-btn.selected {
  background: rgba(79, 195, 247, 0.2);
  border-color: #4fc3f7;
  box-shadow:
    inset -3px -3px 0 rgba(0, 0, 0, 0.3),
    inset 3px 3px 0 rgba(79, 195, 247, 0.3),
    0 0 0 2px #4fc3f7;
}

.opponent-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  padding: 6px;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.opponent-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}

.opponent-name {
  font-size: 0.6rem;
}

.opponent-cards {
  font-size: 0.45rem;
  color: #4fc3f7;
  opacity: 0.8;
}

.select-indicator {
  display: flex;
  align-items: center;
  animation: pulse 0.5s steps(4) infinite alternate;
}

@keyframes pulse {
  from { opacity: 0.7; }
  to { opacity: 1; }
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 25px;
  padding-top: 15px;
  border-top: 2px solid rgba(255, 255, 255, 0.1);
}

.pixel-btn-secondary {
  padding: 12px 20px;
  background: #4a4a4a;
  border: none;
  color: white;
  font-size: 0.6rem;
  font-family: 'Press Start 2P', monospace;
  cursor: pointer;
  box-shadow:
    inset -3px -3px 0 #2a2a2a,
    inset 3px 3px 0 #6a6a6a,
    4px 4px 0 rgba(0, 0, 0, 0.4);
  transition: all 0.1s steps(2);
}

.pixel-btn-secondary:hover {
  transform: translate(2px, 2px);
  box-shadow:
    inset -3px -3px 0 #2a2a2a,
    inset 3px 3px 0 #6a6a6a,
    2px 2px 0 rgba(0, 0, 0, 0.4);
}

.pixel-btn {
  padding: 12px 24px;
  background: #ff6b35;
  border: none;
  color: white;
  font-size: 0.6rem;
  font-family: 'Press Start 2P', monospace;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow:
    inset -3px -3px 0 #cc4a1a,
    inset 3px 3px 0 #ff9a6c,
    4px 4px 0 rgba(0, 0, 0, 0.4);
  transition: all 0.1s steps(2);
}

.pixel-btn:hover:not(:disabled) {
  transform: translate(2px, 2px);
  box-shadow:
    inset -3px -3px 0 #cc4a1a,
    inset 3px 3px 0 #ff9a6c,
    2px 2px 0 rgba(0, 0, 0, 0.4);
}

.pixel-btn:disabled,
.pixel-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(50%);
}
</style>
