<script setup>
import PixelFish from './PixelFish.vue'

defineProps({
  players: {
    type: Array,
    required: true
    // Each player: { name: string, books: number, isCurrentPlayer: boolean }
  }
})

const fishColors = ['orange', 'blue', 'green', 'pink']
</script>

<template>
  <div class="scoreboard pixel-panel">
    <h3 class="scoreboard-title">SCORES</h3>
    <div class="players-list">
      <div
        v-for="(player, index) in players"
        :key="player.name"
        class="player-score"
        :class="{ 'current-player': player.isCurrentPlayer }"
      >
        <div class="player-avatar">
          <PixelFish :size="28" :color="fishColors[index % fishColors.length]" />
        </div>
        <div class="player-details">
          <span class="player-name">{{ player.name }}</span>
          <div class="books-display">
            <span v-for="i in player.books" :key="i" class="book-icon">*</span>
            <span v-if="player.books === 0" class="no-books">---</span>
          </div>
        </div>
        <div class="book-count">{{ player.books }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.scoreboard {
  padding: 15px;
  min-width: 220px;
  font-family: 'Press Start 2P', monospace;
}

.pixel-panel {
  background: #1a3a5c;
  border: 4px solid #4fc3f7;
  box-shadow:
    inset -4px -4px 0 #0d2847,
    inset 4px 4px 0 #2a5a8c,
    8px 8px 0 rgba(0, 0, 0, 0.4);
}

.scoreboard-title {
  margin: 0 0 15px 0;
  font-size: 0.8rem;
  color: #ffd700;
  text-align: center;
  text-shadow: 2px 2px 0 #cc8800;
  letter-spacing: 2px;
}

.players-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.player-score {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.player-score.current-player {
  background: rgba(255, 215, 0, 0.15);
  border-color: #ffd700;
}

.player-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.player-name {
  font-size: 0.55rem;
  color: #fff;
}

.books-display {
  display: flex;
  gap: 2px;
}

.book-icon {
  font-size: 0.7rem;
  color: #ffd700;
}

.no-books {
  font-size: 0.5rem;
  color: rgba(255, 255, 255, 0.3);
}

.book-count {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
  color: #1a3a5c;
  background: #5dfc9a;
  border: 2px solid #3adc7a;
  box-shadow:
    inset -2px -2px 0 #2abc5a,
    inset 2px 2px 0 #7afcba;
}
</style>
