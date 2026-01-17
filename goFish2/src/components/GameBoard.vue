<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import PlayerHand from './PlayerHand.vue'
import OpponentHand from './OpponentHand.vue'
import DrawPile from './DrawPile.vue'
import BookPile from './BookPile.vue'
import GameMessage from './GameMessage.vue'
import AskRankModal from './AskRankModal.vue'
import PixelBackground from './PixelBackground.vue'
import PixelFish from './PixelFish.vue'
import GoFishSplash from './GoFishSplash.vue'
import BookCompleteEffect from './BookCompleteEffect.vue'

// Camera & Gesture Detection
import CameraFeed from './camera/CameraFeed.vue'
import CameraPermission from './camera/CameraPermission.vue'
import MyBannedMoveHint from './banned-moves/MyBannedMoveHint.vue'
import BannedMoveAlert from './banned-moves/BannedMoveAlert.vue'
import DebugPanel from './banned-moves/DebugPanel.vue'
import { useCamera } from '../composables/useCamera'
import { useGestureDetection } from '../composables/useGestureDetection'
import { BANNED_MOVES } from '../services/gestureDefinitions'

// Constants
const SUITS = ['♠', '♥', '♦', '♣']
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const BANNED_MOVE_KEYS = Object.keys(BANNED_MOVES)

// Game state
const deck = ref([])
const playerHand = ref([])
const opponents = ref([
  { name: 'Bot 1', hand: [], books: [], bannedMove: null },
  { name: 'Bot 2', hand: [], books: [], bannedMove: null },
  { name: 'Bot 3', hand: [], books: [], bannedMove: null }
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

// Visual effects state
const showGoFishSplash = ref(false)
const showBookComplete = ref(false)
const completedBookRank = ref('')
const bookCompletePosition = ref({ x: 50, y: 50 })

// Camera & Gesture state
const { stream, isEnabled: cameraEnabled, error: cameraError, isLoading: cameraLoading, startCamera, stopCamera } = useCamera()
const { isReady: gestureReady, isLoading: gestureLoading, currentGestures, initialize: initGesture, startDetection, stopDetection } = useGestureDetection()
const cameraFeedRef = ref(null)
const showCameraPermission = ref(false)
const showCameraFeed = ref(false) // Controls camera feed visibility
const playerBannedMove = ref(null)
const showBannedMoveAlert = ref(false)
const currentPenalty = ref(null)
const debugMode = ref(false)

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

// Computed for debug panel
const otherPlayersForDebug = computed(() =>
  opponents.value.map(o => ({ id: o.name, name: o.name }))
)

const otherPlayersMoves = computed(() => {
  const moves = {}
  opponents.value.forEach(o => {
    moves[o.name] = { bannedMove: o.bannedMove }
  })
  return moves
})

// Camera & Gesture Functions
function assignBannedMoves() {
  // Assign random banned move to player
  playerBannedMove.value = BANNED_MOVE_KEYS[Math.floor(Math.random() * BANNED_MOVE_KEYS.length)]

  // Assign random banned moves to opponents
  opponents.value.forEach(opp => {
    opp.bannedMove = BANNED_MOVE_KEYS[Math.floor(Math.random() * BANNED_MOVE_KEYS.length)]
  })
}

async function enableCamera() {
  showCameraPermission.value = false
  showCameraFeed.value = true // Show camera feed first

  // Initialize gesture detection
  await initGesture()

  // Wait for the CameraFeed component to mount
  await new Promise(resolve => setTimeout(resolve, 200))

  if (cameraFeedRef.value) {
    const videoEl = cameraFeedRef.value.getVideoElement()
    await startCamera(videoEl)

    // Start gesture detection
    if (gestureReady.value && cameraEnabled.value) {
      startDetection(videoEl, onGestureDetected)
    }
  }
}

function disableCamera() {
  stopDetection()
  stopCamera()
  showCameraFeed.value = false
}

function toggleCamera() {
  if (showCameraFeed.value) {
    disableCamera()
  } else {
    showCameraPermission.value = true
  }
}

function onCameraPermissionGranted() {
  enableCamera()
}

function onCameraPermissionDenied() {
  showCameraPermission.value = false
}

function onGestureDetected(gesture) {
  // Check if player is doing their own banned move (bots catch them!)
  if (playerBannedMove.value === gesture.type) {
    // Player got caught by a bot!
    const catchingBot = opponents.value[Math.floor(Math.random() * opponents.value.length)]
    currentPenalty.value = {
      gestureType: gesture.type,
      gestureName: BANNED_MOVES[gesture.type]?.name,
      victimName: 'You',
      reporterName: catchingBot.name,
      penalties: [{ penaltyType: 'SKIP_TURN' }]
    }
    showBannedMoveAlert.value = true

    gameMessage.value = {
      text: `${catchingBot.name} caught YOU doing ${BANNED_MOVES[gesture.type]?.name}!`,
      type: 'warning'
    }
    return
  }

  // Check if detected gesture matches any opponent's banned move
  for (const opp of opponents.value) {
    if (opp.bannedMove === gesture.type) {
      // Caught an opponent!
      currentPenalty.value = {
        gestureType: gesture.type,
        gestureName: BANNED_MOVES[gesture.type]?.name,
        victimName: opp.name,
        reporterName: 'You',
        penalties: [{ penaltyType: 'SKIP_TURN' }]
      }
      showBannedMoveAlert.value = true

      gameMessage.value = {
        text: `You caught ${opp.name} doing ${BANNED_MOVES[gesture.type]?.name}!`,
        type: 'success'
      }
      break
    }
  }
}

function onBannedMoveAlertClose() {
  showBannedMoveAlert.value = false
  currentPenalty.value = null
}

function toggleDebugMode() {
  debugMode.value = !debugMode.value
}

function onSimulateGesture(playerId, gestureType) {
  // Simulate a gesture detection for testing
  const opp = opponents.value.find(o => o.name === playerId)
  if (opp && opp.bannedMove === gestureType) {
    currentPenalty.value = {
      gestureType: gestureType,
      gestureName: BANNED_MOVES[gestureType]?.name,
      victimName: opp.name,
      reporterName: 'You',
      penalties: [{ penaltyType: 'SKIP_TURN' }]
    }
    showBannedMoveAlert.value = true

    gameMessage.value = {
      text: `You caught ${opp.name} doing ${BANNED_MOVES[gestureType]?.name}!`,
      type: 'success'
    }
  } else {
    gameMessage.value = {
      text: `Wrong! ${opp?.name || 'Unknown'}'s banned move is not ${BANNED_MOVES[gestureType]?.name}.`,
      type: 'warning'
    }
  }
}

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
    // Go Fish! - Show splash effect
    showGoFishSplash.value = true
    gameMessage.value = {
      text: `Go Fish! ${opponentName} doesn't have any ${rank}s.`,
      type: 'warning'
    }
    selectedCard.value = null
    selectedRank.value = null
    selectedOpponent.value = null
  }
}

function onGoFishSplashComplete() {
  showGoFishSplash.value = false
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
    addBook = (rank) => {
      playerBooks.value.push({ rank })
      // Show book complete effect
      completedBookRank.value = rank
      bookCompletePosition.value = { x: 50, y: 60 }
      showBookComplete.value = true
    }
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

function onBookCompleteEffectDone() {
  showBookComplete.value = false
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
    { name: 'Bot 1', hand: [], books: [], bannedMove: null },
    { name: 'Bot 2', hand: [], books: [], bannedMove: null },
    { name: 'Bot 3', hand: [], books: [], bannedMove: null }
  ]
  currentTurn.value = 'player'
  selectedCard.value = null
  gameMessage.value = { text: 'Welcome to Go Fish! Select a card to ask for.', type: 'info' }
  showAskModal.value = false
  selectedRank.value = null
  selectedOpponent.value = null
  gameOver.value = false
  winner.value = null
  showGoFishSplash.value = false
  showBookComplete.value = false
  showBannedMoveAlert.value = false
  currentPenalty.value = null

  // Assign banned moves for this game
  assignBannedMoves()

  dealCards()
}

onMounted(() => {
  startNewGame()
})

onUnmounted(() => {
  disableCamera()
})
</script>

<template>
  <div class="game-board">
    <!-- Pixel Background -->
    <PixelBackground />

    <!-- Visual Effects -->
    <GoFishSplash :show="showGoFishSplash" @complete="onGoFishSplashComplete" />
    <BookCompleteEffect
      :show="showBookComplete"
      :rank="completedBookRank"
      :position="bookCompletePosition"
      @complete="onBookCompleteEffectDone"
    />

    <!-- Camera Permission Modal -->
    <CameraPermission
      v-if="showCameraPermission"
      @granted="onCameraPermissionGranted"
      @denied="onCameraPermissionDenied"
    />

    <!-- Banned Move Alert -->
    <BannedMoveAlert
      v-if="showBannedMoveAlert && currentPenalty"
      :penalty="currentPenalty"
      @close="onBannedMoveAlertClose"
    />

    <!-- Camera Feed (bottom right) -->
    <CameraFeed
      v-if="showCameraFeed"
      ref="cameraFeedRef"
      :is-detecting="gestureReady && cameraEnabled"
      :current-gestures="currentGestures"
      :stream="stream"
    />

    <!-- Header -->
    <div class="game-header">
      <div class="title-container">
        <PixelFish :size="48" color="gold" />
        <h1 class="game-title pixel-title">GO FISH!</h1>
        <PixelFish :size="48" color="blue" />
      </div>
      <div class="header-buttons">
        <button class="camera-btn pixel-btn" @click="toggleCamera" :class="{ active: showCameraFeed }">
          {{ showCameraFeed ? 'CAM ON' : 'CAM OFF' }}
        </button>
        <button class="debug-btn pixel-btn" @click="toggleDebugMode" :class="{ active: debugMode }">
          DEBUG
        </button>
        <button class="new-game-btn pixel-btn" @click="startNewGame">NEW GAME</button>
      </div>
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

    <!-- Debug Panel -->
    <div v-if="debugMode" class="debug-panel-container">
      <DebugPanel
        :other-players="otherPlayersForDebug"
        :other-players-moves="otherPlayersMoves"
        @simulate="onSimulateGesture"
      />
    </div>

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
  animation: fadeIn 0.3s steps(4);
}

.game-over-content {
  padding: 40px;
  text-align: center;
  max-width: 400px;
}

.trophy-fish {
  margin-bottom: 20px;
  animation: bounce 1s steps(4) infinite;
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

/* Header buttons */
.header-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.camera-btn,
.debug-btn {
  font-size: 0.5rem;
  padding: 8px 12px;
}

.camera-btn.active {
  background: #5dfc9a;
  color: #0a1628;
}

.debug-btn.active {
  background: #4fc3f7;
  color: #0a1628;
}

/* Banned move panel */
.banned-move-panel {
  position: fixed;
  top: 100px;
  left: 16px;
  z-index: 30;
  max-width: 280px;
}

/* Debug panel container */
.debug-panel-container {
  position: fixed;
  bottom: 16px;
  left: 16px;
  z-index: 35;
  max-width: 350px;
}

@media (max-width: 900px) {
  .banned-move-panel {
    position: static;
    max-width: 100%;
    margin: 10px 0;
  }

  .debug-panel-container {
    position: static;
    max-width: 100%;
    margin: 10px 0;
  }

  .header-buttons {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}
</style>
