<script setup>
import { computed } from 'vue'
import PixelFish from './PixelFish.vue'

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

const fishColors = { 'Bot 1': 'blue', 'Bot 2': 'green', 'Bot 3': 'pink' }
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="$emit('cancel')">
      <div class="modal-content pixel-panel">
        <h2 class="modal-title">ASK FOR A CARD</h2>

        <div class="selection-section">
          <h3>CHOOSE RANK:</h3>
          <div class="rank-grid">
            <button
              v-for="rank in availableRanks"
              :key="rank"
              class="rank-btn pixel-btn-small"
              :class="{ selected: selectedRank === rank }"
              @click="$emit('select-rank', rank)"
            >
              {{ rank }}
            </button>
          </div>
        </div>

        <div class="selection-section">
          <h3>ASK WHO?</h3>
          <div class="opponent-list">
            <button
              v-for="opponent in opponents"
              :key="opponent.name"
              class="opponent-btn"
              :class="{ selected: selectedOpponent === opponent.name }"
              @click="$emit('select-opponent', opponent.name)"
            >
              <div class="opponent-avatar">
                <PixelFish :size="24" :color="fishColors[opponent.name] || 'blue'" />
              </div>
              <span class="opponent-name">{{ opponent.name }}</span>
              <span class="opponent-cards">{{ opponent.cardCount }}</span>
            </button>
          </div>
        </div>

        <div class="modal-actions">
          <button class="cancel-btn pixel-btn-secondary" @click="$emit('cancel')">CANCEL</button>
          <button
            class="confirm-btn pixel-btn-primary"
            :disabled="!canConfirm"
            @click="$emit('confirm')"
          >
            ASK!
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
  font-family: 'Press Start 2P', monospace;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  max-width: 450px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

.pixel-panel {
  background: #1a3a5c;
  border: 6px solid #ffd700;
  padding: 25px;
  box-shadow:
    inset -6px -6px 0 #0d2847,
    inset 6px 6px 0 #2a5a8c,
    12px 12px 0 rgba(0, 0, 0, 0.5);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-title {
  margin: 0 0 20px 0;
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
}

.rank-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.pixel-btn-small {
  padding: 10px 6px;
  background: rgba(0, 0, 0, 0.3);
  border: 3px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 0.7rem;
  font-family: 'Press Start 2P', monospace;
  cursor: pointer;
  transition: all 0.1s ease;
}

.pixel-btn-small:hover {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.1);
}

.pixel-btn-small.selected {
  background: #ff6b35;
  border-color: #ffd700;
  box-shadow:
    inset -2px -2px 0 #cc4a1a,
    inset 2px 2px 0 #ff9a6c;
}

.opponent-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.opponent-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  background: rgba(0, 0, 0, 0.3);
  border: 3px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  transition: all 0.1s ease;
  font-family: 'Press Start 2P', monospace;
}

.opponent-btn:hover {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.1);
}

.opponent-btn.selected {
  background: rgba(102, 126, 234, 0.3);
  border-color: #4fc3f7;
}

.opponent-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
}

.opponent-name {
  flex: 1;
  font-size: 0.55rem;
  text-align: left;
}

.opponent-cards {
  font-size: 0.5rem;
  color: #4fc3f7;
  background: rgba(0, 0, 0, 0.4);
  padding: 4px 8px;
  border: 2px solid #4fc3f7;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.pixel-btn-secondary,
.pixel-btn-primary {
  padding: 12px 20px;
  border: none;
  font-size: 0.6rem;
  font-family: 'Press Start 2P', monospace;
  cursor: pointer;
  transition: all 0.1s ease;
}

.pixel-btn-secondary {
  background: #4a4a4a;
  color: white;
  box-shadow:
    inset -3px -3px 0 #2a2a2a,
    inset 3px 3px 0 #6a6a6a,
    4px 4px 0 rgba(0, 0, 0, 0.4);
}

.pixel-btn-secondary:hover {
  transform: translate(1px, 1px);
  box-shadow:
    inset -3px -3px 0 #2a2a2a,
    inset 3px 3px 0 #6a6a6a,
    3px 3px 0 rgba(0, 0, 0, 0.4);
}

.pixel-btn-primary {
  background: #ff6b35;
  color: white;
  box-shadow:
    inset -3px -3px 0 #cc4a1a,
    inset 3px 3px 0 #ff9a6c,
    4px 4px 0 rgba(0, 0, 0, 0.4);
}

.pixel-btn-primary:hover:not(:disabled) {
  transform: translate(1px, 1px);
  box-shadow:
    inset -3px -3px 0 #cc4a1a,
    inset 3px 3px 0 #ff9a6c,
    3px 3px 0 rgba(0, 0, 0, 0.4);
}

.pixel-btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
