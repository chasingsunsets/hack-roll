<script setup>
import { ref } from 'vue';
import { BANNED_MOVES } from '../../services/gestureDefinitions';

const props = defineProps({
  otherPlayers: {
    type: Array,
    default: () => []
  },
  otherPlayersMoves: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['simulate']);

const expanded = ref(false);

function simulateGesture(playerId, gestureType) {
  emit('simulate', playerId, gestureType);
}

const bannedMovesList = Object.entries(BANNED_MOVES);
</script>

<template>
  <div class="debug-panel">
    <!-- Terminal header -->
    <button class="terminal-header" @click="expanded = !expanded">
      <span class="terminal-icon">&gt;</span>
      <span class="terminal-title">DEBUG_CONSOLE</span>
      <span class="terminal-toggle">{{ expanded ? '[-]' : '[+]' }}</span>
    </button>

    <!-- Terminal content -->
    <div v-if="expanded" class="terminal-content">
      <!-- Scanlines -->
      <div class="terminal-scanlines"></div>

      <div class="terminal-output">
        <p class="output-line">
          <span class="prompt">$</span>
          <span class="command">./simulate_gesture.sh</span>
        </p>
        <p class="output-hint">// TEST PENALTY SYSTEM WITHOUT CAMERA</p>

        <!-- No players message -->
        <div v-if="otherPlayers.length === 0" class="no-players">
          <span class="error-text">[ERROR]</span> NO_PLAYERS_FOUND
        </div>

        <!-- Player sections -->
        <div v-for="player in otherPlayers" :key="player.id" class="player-block">
          <div class="player-line">
            <span class="prompt">&gt;</span>
            <span class="player-name">{{ player.name.toUpperCase() }}</span>
            <span v-if="otherPlayersMoves[player.id]" class="banned-tag">
              [{{ BANNED_MOVES[otherPlayersMoves[player.id].bannedMove]?.name?.toUpperCase() }}]
            </span>
          </div>

          <div class="gesture-grid">
            <button
              v-for="[key, move] in bannedMovesList"
              :key="key"
              class="gesture-btn"
              :class="{ 'gesture-btn--correct': otherPlayersMoves[player.id]?.bannedMove === key }"
              @click="simulateGesture(player.id, key)"
              :title="move.description"
            >
              <span class="btn-icon">{{ move.icon }}</span>
              <span class="btn-label">{{ move.name?.split(' ')[0]?.toUpperCase() }}</span>
            </button>
          </div>
        </div>

        <!-- Blinking cursor -->
        <p class="cursor-line">
          <span class="prompt">$</span>
          <span class="cursor blink">_</span>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.debug-panel {
  background: var(--ocean-abyss, #0a1628);
  border: 4px solid var(--feedback-success, #5dfc9a);
  box-shadow:
    4px 4px 0 rgba(0, 0, 0, 0.5),
    0 0 20px rgba(93, 252, 154, 0.2);
  overflow: hidden;
  font-family: 'Press Start 2P', monospace;
}

.terminal-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--ocean-deep, #0d2847);
  border: none;
  border-bottom: 2px solid var(--feedback-success, #5dfc9a);
  cursor: pointer;
  font-family: 'Press Start 2P', monospace;
}

.terminal-header:hover {
  background: var(--ocean-mid, #1a3a5c);
}

.terminal-icon {
  font-size: 0.5rem;
  color: var(--feedback-success, #5dfc9a);
  animation: cursor-blink 1s steps(1) infinite;
}

@keyframes cursor-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.terminal-title {
  flex: 1;
  font-size: 0.45rem;
  color: var(--feedback-success, #5dfc9a);
  text-align: left;
}

.terminal-toggle {
  font-size: 0.45rem;
  color: var(--suit-wave, #4fc3f7);
}

.terminal-content {
  position: relative;
  max-height: 300px;
  overflow-y: auto;
}

.terminal-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 2px,
    rgba(93, 252, 154, 0.03) 2px,
    rgba(93, 252, 154, 0.03) 4px
  );
  pointer-events: none;
  z-index: 5;
}

.terminal-output {
  padding: 12px;
}

.output-line {
  margin: 0 0 8px;
  display: flex;
  gap: 8px;
}

.prompt {
  color: var(--feedback-success, #5dfc9a);
  font-size: 0.45rem;
}

.command {
  color: var(--suit-wave, #4fc3f7);
  font-size: 0.45rem;
}

.output-hint {
  margin: 0 0 16px;
  font-size: 0.35rem;
  color: rgba(255, 255, 255, 0.4);
}

.no-players {
  padding: 12px;
  text-align: center;
  font-size: 0.45rem;
}

.error-text {
  color: var(--suit-coral, #ff6b35);
}

.player-block {
  margin-bottom: 16px;
  padding: 10px;
  background: rgba(93, 252, 154, 0.1);
  border: 2px solid var(--ocean-deep, #0d2847);
}

.player-line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.player-name {
  font-size: 0.5rem;
  color: #fff;
}

.banned-tag {
  font-size: 0.35rem;
  color: var(--feedback-success, #5dfc9a);
  padding: 2px 6px;
  background: rgba(93, 252, 154, 0.2);
  border: 1px solid var(--feedback-success, #5dfc9a);
}

.gesture-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.gesture-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  background: var(--ocean-deep, #0d2847);
  border: 2px solid var(--ocean-mid, #1a3a5c);
  cursor: pointer;
  font-family: 'Press Start 2P', monospace;
  transition: all 0.1s;
}

.gesture-btn:hover {
  background: var(--ocean-mid, #1a3a5c);
  border-color: var(--suit-wave, #4fc3f7);
  transform: scale(1.05);
}

.gesture-btn:active {
  transform: scale(0.95);
}

.gesture-btn--correct {
  border-color: var(--feedback-success, #5dfc9a);
  background: rgba(93, 252, 154, 0.3);
  box-shadow: 0 0 8px rgba(93, 252, 154, 0.4);
}

.btn-icon {
  font-size: 1rem;
}

.btn-label {
  font-size: 0.3rem;
  color: rgba(255, 255, 255, 0.6);
}

.cursor-line {
  margin: 16px 0 0;
  display: flex;
  gap: 8px;
}

.cursor {
  color: var(--feedback-success, #5dfc9a);
  font-size: 0.5rem;
}

.blink {
  animation: cursor-blink 1s steps(1) infinite;
}
</style>
