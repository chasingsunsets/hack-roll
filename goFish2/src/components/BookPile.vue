<script setup>
import PixelFish from './PixelFish.vue'

defineProps({
  books: {
    type: Array,
    default: () => []
    // Each book: { rank: string }
  },
  playerName: {
    type: String,
    default: 'Player'
  },
  fishColor: {
    type: String,
    default: 'orange'
  },
  isCurrentPlayer: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="book-pile" :class="{ 'current-player': isCurrentPlayer }">
    <div class="pile-header">
      <PixelFish :size="20" :color="fishColor" />
      <span class="player-name">{{ playerName }}</span>
      <span class="book-count">{{ books.length }}</span>
    </div>
    <div class="books-display">
      <div
        v-for="(book, index) in books"
        :key="index"
        class="book-stack"
        :style="{ '--stack-index': index }"
      >
        <div class="book-card">
          <span class="book-rank">{{ book.rank }}</span>
        </div>
      </div>
      <div v-if="books.length === 0" class="no-books">
        <span>---</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.book-pile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.15);
  min-width: 80px;
  font-family: 'Press Start 2P', monospace;
}

.book-pile.current-player {
  border-color: #ffd700;
  background: rgba(255, 215, 0, 0.1);
}

.pile-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.player-name {
  font-size: 0.45rem;
  color: #fff;
  max-width: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-count {
  font-size: 0.5rem;
  color: #5dfc9a;
  background: rgba(0, 0, 0, 0.4);
  padding: 2px 6px;
  border: 2px solid #5dfc9a;
}

.books-display {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
  min-height: 40px;
  max-width: 100px;
}

.book-stack {
  position: relative;
}

.book-card {
  width: 28px;
  height: 38px;
  background: linear-gradient(135deg, #f8f4e8 0%, #e8e4d8 100%);
  border: 2px solid #2c2c2c;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    inset -2px -2px 0 #d4d0c4,
    inset 2px 2px 0 #ffffff,
    3px 3px 0 rgba(0, 0, 0, 0.3);
}

.book-rank {
  font-size: 0.7rem;
  font-weight: bold;
  color: #1a1a2e;
}

.no-books {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.5rem;
  height: 38px;
}
</style>
