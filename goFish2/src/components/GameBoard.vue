<script setup>
import { ref, computed, onMounted } from 'vue'
import PlayerHand from './PlayerHand.vue'
import OpponentHand from './OpponentHand.vue'
import DrawPile from './DrawPile.vue'
import BookPile from './BookPile.vue'
import GameMessage from './GameMessage.vue'
import AskRankModal from './AskRankModal.vue'
import PixelBackground from './PixelBackground.vue'
import PixelFish from './PixelFish.vue'

// Constants
const SUITS = ['♠', '♥', '♦', '♣']
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

// Game state
const deck = ref([])
const playerHand = ref([])
const opponents = ref([
  { name: 'Bot 1', hand: [], books: [] },
  { name: 'Bot 2', hand: [], books: [] },
  { name: 'Bot 3', hand: [], books: [] }
])
const playerBooks = ref([])
const currentTurn = ref('player') // 'player' or opponent name
const selectedCard = ref(null)
const gameMessage = ref({ text: 'Welcome to Go Fish! Select a card to ask for.', type: 'info' })
const showAskModal = ref(false)
const selectedRank = ref(null)
const selectedOpponent = ref(null)
const gameOver = ref(false)
const winner = ref(null)

// Computed
const playerRanks = computed(() => {
  const ranks = [...new Set(playerHand.value.map(card => card.rank))]
  return ranks.sort((a, b) => RANKS.indexOf(a) - RANKS.indexOf(b))
})

const opponentData = computed(() =>
  opponents.value.map(opp => ({
    name: opp.name,
    cardCount: opp.hand.length
  }))
)

const totalBooks = computed(() =>
  playerBooks.value.length + opponents.value.reduce((sum, o) => sum + o.books.length, 0)
)

const canDrawCard = computed(() =>
  currentTurn.value === 'player' &&
  deck.value.length > 0 &&
  selectedCard.value === null &&
  gameMessage.value.type === 'warning'
)

// Functions
function createDeck() {
  const newDeck = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      newDeck.push({ suit, rank })
    }
  }
  return shuffle(newDeck)
}

function shuffle(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function dealCards() {
  const cardsPerPlayer = 7

  // Deal to player
  for (let i = 0; i < cardsPerPlayer; i++) {
    if (deck.value.length > 0) {
      playerHand.value.push(deck.value.pop())
    }
  }

  // Deal to opponents
  for (const opponent of opponents.value) {
    for (let i = 0; i < cardsPerPlayer; i++) {
      if (deck.value.length > 0) {
        opponent.hand.push(deck.value.pop())
      }
    }
  }

  sortHand(playerHand.value)
}

function sortHand(hand) {
  hand.sort((a, b) => {
    const rankDiff = RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank)
    if (rankDiff !== 0) return rankDiff
    return SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit)
  })
}

function selectCard(card) {
  if (currentTurn.value !== 'player' || gameOver.value) return

  if (selectedCard.value && selectedCard.value.suit === card.suit && selectedCard.value.rank === card.rank) {
    selectedCard.value = null
    selectedRank.value = null
  } else {
    selectedCard.value = card
    selectedRank.value = card.rank
    showAskModal.value = true
  }
}

function selectRank(rank) {
  selectedRank.value = rank
}

function selectOpponentForAsk(name) {
  selectedOpponent.value = name
}

function confirmAsk() {
  if (!selectedRank.value || !selectedOpponent.value) return

  showAskModal.value = false
  askForCards(selectedOpponent.value, selectedRank.value)
}

function cancelAsk() {
  showAskModal.value = false
  selectedCard.value = null
  selectedRank.value = null
  selectedOpponent.value = null
}

function askForCards(opponentName, rank) {
  const opponent = opponents.value.find(o => o.name === opponentName)
  const matchingCards = opponent.hand.filter(card => card.rank === rank)

  if (matchingCards.length > 0) {
    // Success! Get the cards
    opponent.hand = opponent.hand.filter(card => card.rank !== rank)
    playerHand.value.push(...matchingCards)
    sortHand(playerHand.value)

    gameMessage.value = {
      text: `${opponentName} had ${matchingCards.length} ${rank}(s)! You get another turn.`,
      type: 'success'
    }

    checkForBooks('player')

    // Player gets another turn
    setTimeout(() => {
      if (!gameOver.value) {
        selectedCard.value = null
        selectedRank.value = null
        selectedOpponent.value = null
        gameMessage.value = { text: 'Select a card to ask for another rank!', type: 'action' }
      }
    }, 1500)
  } else {
    // Go Fish!
    gameMessage.value = {
      text: `Go Fish! ${opponentName} doesn't have any ${rank}s.`,
      type: 'warning'
    }
    selectedCard.value = null
    selectedRank.value = null
    selectedOpponent.value = null
  }
}

function drawCard() {
  if (deck.value.length === 0 || currentTurn.value !== 'player') return

  const drawnCard = deck.value.pop()
  playerHand.value.push(drawnCard)
  sortHand(playerHand.value)

  gameMessage.value = {
    text: `You drew a ${drawnCard.rank}${drawnCard.suit}!`,
    type: 'info'
  }

  checkForBooks('player')

  // End player turn
  setTimeout(() => {
    if (!gameOver.value) {
      nextTurn()
    }
  }, 1500)
}

function checkForBooks(playerType) {
  let hand, addBook

  if (playerType === 'player') {
    hand = playerHand
    addBook = (rank) => playerBooks.value.push({ rank })
  } else {
    const opponent = opponents.value.find(o => o.name === playerType)
    hand = { value: opponent.hand }
    addBook = (rank) => opponent.books.push({ rank })
  }

  const rankCounts = {}
  for (const card of hand.value) {
    rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1
  }

  for (const rank in rankCounts) {
    if (rankCounts[rank] === 4) {
      // Found a book!
      hand.value = hand.value.filter(card => card.rank !== rank)
      if (playerType === 'player') {
        playerHand.value = hand.value
      } else {
        opponents.value.find(o => o.name === playerType).hand = hand.value
      }
      addBook(rank)

      if (playerType === 'player') {
        gameMessage.value = {
          text: `You completed a book of ${rank}s!`,
          type: 'success'
        }
      }
    }
  }

  checkGameOver()
}

function nextTurn() {
  const turnOrder = ['player', ...opponents.value.map(o => o.name)]
  const currentIndex = turnOrder.indexOf(currentTurn.value)
  const nextIndex = (currentIndex + 1) % turnOrder.length
  currentTurn.value = turnOrder[nextIndex]

  if (currentTurn.value !== 'player') {
    setTimeout(() => {
      if (!gameOver.value) {
        playOpponentTurn(currentTurn.value)
      }
    }, 1000)
  } else {
    gameMessage.value = { text: 'Your turn! Select a card to ask for.', type: 'action' }
  }
}

function playOpponentTurn(opponentName) {
  const opponent = opponents.value.find(o => o.name === opponentName)

  if (opponent.hand.length === 0) {
    if (deck.value.length > 0) {
      opponent.hand.push(deck.value.pop())
    } else {
      nextTurn()
      return
    }
  }

  // Pick a random card from hand to ask for
  const randomCard = opponent.hand[Math.floor(Math.random() * opponent.hand.length)]
  const rank = randomCard.rank

  // Pick a random target (could be player or another opponent)
  const targets = ['player', ...opponents.value.filter(o => o.name !== opponentName).map(o => o.name)]
  const target = targets[Math.floor(Math.random() * targets.length)]

  gameMessage.value = {
    text: `${opponentName} asks ${target === 'player' ? 'you' : target} for ${rank}s...`,
    type: 'info'
  }

  setTimeout(() => {
    let targetHand
    if (target === 'player') {
      targetHand = playerHand.value
    } else {
      targetHand = opponents.value.find(o => o.name === target).hand
    }

    const matchingCards = targetHand.filter(card => card.rank === rank)

    if (matchingCards.length > 0) {
      // Success for opponent
      if (target === 'player') {
        playerHand.value = playerHand.value.filter(card => card.rank !== rank)
      } else {
        opponents.value.find(o => o.name === target).hand =
          targetHand.filter(card => card.rank !== rank)
      }

      opponent.hand.push(...matchingCards)

      gameMessage.value = {
        text: `${target === 'player' ? 'You gave' : target + ' gave'} ${matchingCards.length} ${rank}(s) to ${opponentName}!`,
        type: 'info'
      }

      checkForBooks(opponentName)

      // Opponent gets another turn
      setTimeout(() => {
        if (!gameOver.value) {
          playOpponentTurn(opponentName)
        }
      }, 1500)
    } else {
      // Go Fish for opponent
      if (deck.value.length > 0) {
        const drawnCard = deck.value.pop()
        opponent.hand.push(drawnCard)

        gameMessage.value = {
          text: `Go Fish! ${opponentName} drew a card.`,
          type: 'warning'
        }

        checkForBooks(opponentName)
      }

      setTimeout(() => {
        if (!gameOver.value) {
          nextTurn()
        }
      }, 1500)
    }
  }, 1500)
}

function checkGameOver() {
  const total = playerBooks.value.length + opponents.value.reduce((sum, o) => sum + o.books.length, 0)

  if (total === 13) {
    gameOver.value = true

    let maxBooks = playerBooks.value.length
    winner.value = 'You'

    for (const opp of opponents.value) {
      if (opp.books.length > maxBooks) {
        maxBooks = opp.books.length
        winner.value = opp.name
      }
    }

    gameMessage.value = {
      text: `Game Over! ${winner.value} win${winner.value === 'You' ? '' : 's'} with ${maxBooks} books!`,
      type: 'success'
    }
  }
}

function startNewGame() {
  deck.value = createDeck()
  playerHand.value = []
  playerBooks.value = []
  opponents.value = [
    { name: 'Bot 1', hand: [], books: [] },
    { name: 'Bot 2', hand: [], books: [] },
    { name: 'Bot 3', hand: [], books: [] }
  ]
  currentTurn.value = 'player'
  selectedCard.value = null
  gameMessage.value = { text: 'Welcome to Go Fish! Select a card to ask for.', type: 'info' }
  showAskModal.value = false
  selectedRank.value = null
  selectedOpponent.value = null
  gameOver.value = false
  winner.value = null

  dealCards()
}

onMounted(() => {
  startNewGame()
})
</script>

<template>
  <div class="game-board">
    <!-- Pixel Background -->
    <PixelBackground />

    <!-- Header -->
    <div class="game-header">
      <div class="title-container">
        <PixelFish :size="48" color="gold" />
        <h1 class="game-title">GO FISH!</h1>
        <PixelFish :size="48" color="blue" />
      </div>
      <button class="new-game-btn pixel-btn" @click="startNewGame">NEW GAME</button>
    </div>

    <!-- Main game area - Card table layout -->
    <div class="game-table">
      <!-- Top row: Bot 2 (top center) -->
      <div class="table-top">
        <OpponentHand
          :name="opponents[1].name"
          :card-count="opponents[1].hand.length"
          :is-current-turn="currentTurn === opponents[1].name"
          position="top"
        />
      </div>

      <!-- Middle row: Bot 1 (left), Center area, Bot 3 (right) -->
      <div class="table-middle">
        <!-- Bot 1 - Left side -->
        <div class="table-left">
          <OpponentHand
            :name="opponents[0].name"
            :card-count="opponents[0].hand.length"
            :is-current-turn="currentTurn === opponents[0].name"
            position="left"
          />
        </div>

        <!-- Center: Draw pile, message, book piles -->
        <div class="table-center">
          <div class="message-area">
            <GameMessage :message="gameMessage.text" :type="gameMessage.type" />
          </div>
          <div class="center-content">
            <DrawPile
              :cards-remaining="deck.length"
              :can-draw="canDrawCard"
              @draw="drawCard"
            />
            <div class="all-book-piles">
              <BookPile
                :books="playerBooks"
                player-name="You"
                fish-color="orange"
                :is-current-player="currentTurn === 'player'"
              />
              <BookPile
                :books="opponents[0].books"
                :player-name="opponents[0].name"
                fish-color="blue"
                :is-current-player="currentTurn === opponents[0].name"
              />
              <BookPile
                :books="opponents[1].books"
                :player-name="opponents[1].name"
                fish-color="green"
                :is-current-player="currentTurn === opponents[1].name"
              />
              <BookPile
                :books="opponents[2].books"
                :player-name="opponents[2].name"
                fish-color="pink"
                :is-current-player="currentTurn === opponents[2].name"
              />
            </div>
          </div>
        </div>

        <!-- Bot 3 - Right side -->
        <div class="table-right">
          <OpponentHand
            :name="opponents[2].name"
            :card-count="opponents[2].hand.length"
            :is-current-turn="currentTurn === opponents[2].name"
            position="right"
          />
        </div>
      </div>

      <!-- Bottom row: Player (bottom center) -->
      <div class="table-bottom">
        <div class="player-area">
          <div class="player-info">
            <div class="player-avatar pixel-avatar">
              <PixelFish :size="32" color="orange" />
            </div>
            <span class="player-name">YOUR HAND</span>
            <span class="card-count-badge">{{ playerHand.length }} cards</span>
          </div>
          <PlayerHand
            :cards="playerHand"
            :selected-card="selectedCard"
            @select-card="selectCard"
          />
        </div>
      </div>
    </div>

    <!-- Ask modal -->
    <AskRankModal
      :show="showAskModal"
      :available-ranks="playerRanks"
      :opponents="opponentData"
      :selected-rank="selectedRank"
      :selected-opponent="selectedOpponent"
      @select-rank="selectRank"
      @select-opponent="selectOpponentForAsk"
      @confirm="confirmAsk"
      @cancel="cancelAsk"
    />

    <!-- Game over overlay -->
    <div v-if="gameOver" class="game-over-overlay">
      <div class="game-over-content pixel-panel">
        <div class="trophy-fish">
          <PixelFish :size="80" color="gold" />
        </div>
        <h2>GAME OVER!</h2>
        <p class="winner-text">{{ winner }} win{{ winner === 'You' ? '' : 's' }}!</p>
        <div class="final-scores">
          <div class="score-item">
            <span>You</span>
            <span>{{ playerBooks.length }} books</span>
          </div>
          <div v-for="opp in opponents" :key="opp.name" class="score-item">
            <span>{{ opp.name }}</span>
            <span>{{ opp.books.length }} books</span>
          </div>
        </div>
        <button class="play-again-btn pixel-btn" @click="startNewGame">PLAY AGAIN</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.game-board {
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  position: relative;
  font-family: 'Press Start 2P', monospace;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
  margin-bottom: 20px;
  background: rgba(0, 0, 0, 0.5);
  border: 4px solid #ffd700;
  border-radius: 0;
  box-shadow:
    inset -4px -4px 0 rgba(0, 0, 0, 0.3),
    inset 4px 4px 0 rgba(255, 255, 255, 0.1),
    8px 8px 0 rgba(0, 0, 0, 0.4);
}

.title-container {
  display: flex;
  align-items: center;
  gap: 20px;
}

.game-title {
  margin: 0;
  font-size: 1.8rem;
  color: #ffd700;
  text-shadow:
    4px 4px 0 #cc8800,
    -2px -2px 0 #ffee88;
  letter-spacing: 4px;
}

/* Pixel button style */
.pixel-btn {
  padding: 12px 24px;
  background: #ff6b35;
  border: none;
  color: white;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.7rem;
  cursor: pointer;
  position: relative;
  box-shadow:
    inset -4px -4px 0 #cc4a1a,
    inset 4px 4px 0 #ff9a6c,
    6px 6px 0 rgba(0, 0, 0, 0.4);
  transition: all 0.1s ease;
}

.pixel-btn:hover {
  transform: translate(2px, 2px);
  box-shadow:
    inset -4px -4px 0 #cc4a1a,
    inset 4px 4px 0 #ff9a6c,
    4px 4px 0 rgba(0, 0, 0, 0.4);
}

.pixel-btn:active {
  transform: translate(4px, 4px);
  box-shadow:
    inset -4px -4px 0 #cc4a1a,
    inset 4px 4px 0 #ff9a6c,
    2px 2px 0 rgba(0, 0, 0, 0.4);
}

/* Card table layout */
.game-table {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px);
  gap: 10px;
}

.table-top {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 10px;
}

.table-middle {
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 0 10px;
}

.table-left {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.table-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  flex: 1;
}

.center-content {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 30px;
}

.all-book-piles {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.table-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.table-bottom {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding: 10px;
}

.message-area {
  display: flex;
  justify-content: center;
  min-height: 50px;
}

.player-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(0, 0, 0, 0.5);
  padding: 10px 20px;
  border: 3px solid #4fc3f7;
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.4);
}

.pixel-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-name {
  font-weight: bold;
  color: #fff;
  font-size: 0.8rem;
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.5);
}

.card-count-badge {
  background: #1a3a5c;
  padding: 6px 12px;
  font-size: 0.6rem;
  color: #4fc3f7;
  border: 2px solid #4fc3f7;
}

/* Game over overlay */
.game-over-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.pixel-panel {
  background: #1a3a5c;
  border: 6px solid #ffd700;
  box-shadow:
    inset -6px -6px 0 #0d2847,
    inset 6px 6px 0 #2a5a8c,
    12px 12px 0 rgba(0, 0, 0, 0.5);
}

.game-over-content {
  padding: 40px;
  text-align: center;
  max-width: 400px;
}

.trophy-fish {
  margin-bottom: 20px;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.game-over-content h2 {
  margin: 0 0 15px 0;
  font-size: 1.5rem;
  color: #ffd700;
  text-shadow: 3px 3px 0 #cc8800;
}

.winner-text {
  font-size: 1rem;
  color: #fff;
  margin-bottom: 25px;
}

.final-scores {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 25px;
}

.score-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 0.6rem;
}

.play-again-btn {
  margin-top: 10px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Responsive */
@media (max-width: 1100px) {
  .center-content {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .all-book-piles {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 900px) {
  .game-table {
    height: auto;
    min-height: calc(100vh - 140px);
  }

  .table-middle {
    flex-direction: column;
    gap: 15px;
  }

  .table-left,
  .table-right {
    justify-content: center;
  }

  .game-title {
    font-size: 1.2rem;
  }

  .title-container svg {
    display: none;
  }

  .center-content {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }

  .all-book-piles {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
