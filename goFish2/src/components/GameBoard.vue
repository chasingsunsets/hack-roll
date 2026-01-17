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
import ChaosButton from './ChaosButton.vue'

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

// Chaos button state
const chaosButtonCooldown = ref(0)
const previewedCard = ref(null) // For preview actions

// Card gain animation state
const cardGainAnimation = ref(false)
const lastHandSize = ref(0)

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

const chaosButtonAvailable = computed(() =>
  chaosButtonCooldown.value === 0 &&
  currentTurn.value === 'player' &&
  !gameOver.value
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
    
    // Trigger card gain animation
    triggerCardGainAnimation(matchingCards)
    
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
  
  // Trigger card gain animation
  triggerCardGainAnimation([drawnCard])
  
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

  // Decrement chaos button cooldown when it's the player's turn
  if (currentTurn.value === 'player' && chaosButtonCooldown.value > 0) {
    chaosButtonCooldown.value--
  }

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

// Chaos button actions
function swapHandsWithOpponent() {
  const opponentsWithCards = opponents.value.filter(opp => opp.hand.length > 0)
  if (opponentsWithCards.length === 0 || playerHand.value.length === 0) return false

  const randomOpponent = opponentsWithCards[Math.floor(Math.random() * opponentsWithCards.length)]
  const tempHand = [...playerHand.value]
  playerHand.value = [...randomOpponent.hand]
  randomOpponent.hand = tempHand
  sortHand(playerHand.value)

  gameMessage.value = {
    text: `CHAOS! You swapped hands with ${randomOpponent.name}!`,
    type: 'warning'
  }
  checkForBooks('player')
  checkForBooks(randomOpponent.name)
  return true
}

function previewOpponentCard() {
  const opponentsWithCards = opponents.value.filter(opp => opp.hand.length > 0)
  if (opponentsWithCards.length === 0) return false

  const randomOpponent = opponentsWithCards[Math.floor(Math.random() * opponentsWithCards.length)]
  const randomCard = randomOpponent.hand[Math.floor(Math.random() * randomOpponent.hand.length)]
  previewedCard.value = { opponent: randomOpponent.name, card: randomCard }

  gameMessage.value = {
    text: `CHAOS! You peeked at ${randomOpponent.name}'s ${randomCard.rank}${randomCard.suit}!`,
    type: 'info'
  }

  // Clear preview after 3 seconds
  setTimeout(() => {
    previewedCard.value = null
  }, 3000)
  return true
}

function stealRandomCard() {
  const opponentsWithCards = opponents.value.filter(opp => opp.hand.length > 0)
  if (opponentsWithCards.length === 0) return false

  const randomOpponent = opponentsWithCards[Math.floor(Math.random() * opponentsWithCards.length)]
  const randomIndex = Math.floor(Math.random() * randomOpponent.hand.length)
  const stolenCard = randomOpponent.hand.splice(randomIndex, 1)[0]
  
  // Trigger card gain animation
  triggerCardGainAnimation([stolenCard])
  
  playerHand.value.push(stolenCard)
  sortHand(playerHand.value)

  gameMessage.value = {
    text: `CHAOS! You stole ${randomOpponent.name}'s ${stolenCard.rank}${stolenCard.suit}!`,
    type: 'success'
  }
  checkForBooks('player')
  return true
}

function giveRandomCard() {
  if (playerHand.value.length === 0) return false
  const opponentsWithSpace = opponents.value.filter(opp => true) // All opponents can receive cards

  const randomIndex = Math.floor(Math.random() * playerHand.value.length)
  const givenCard = playerHand.value.splice(randomIndex, 1)[0]
  const randomOpponent = opponentsWithSpace[Math.floor(Math.random() * opponentsWithSpace.length)]
  randomOpponent.hand.push(givenCard)

  gameMessage.value = {
    text: `CHAOS! You gave ${randomOpponent.name} your ${givenCard.rank}${givenCard.suit}!`,
    type: 'warning'
  }
  checkForBooks(randomOpponent.name)
  return true
}

function drawExtraCards() {
  if (deck.value.length === 0) return false
  const cardsToDraw = Math.min(2, deck.value.length)
  const drawnCards = []
  for (let i = 0; i < cardsToDraw; i++) {
    drawnCards.push(deck.value.pop())
  }
  
  // Trigger card gain animation
  triggerCardGainAnimation(drawnCards)
  
  playerHand.value.push(...drawnCards)
  sortHand(playerHand.value)

  gameMessage.value = {
    text: `CHAOS! You drew ${cardsToDraw} extra card${cardsToDraw > 1 ? 's' : ''}!`,
    type: 'success'
  }
  checkForBooks('player')
  return true
}

function discardRandomCards() {
  if (playerHand.value.length === 0) return false
  const cardsToDiscard = Math.min(2, playerHand.value.length)
  const discarded = []
  for (let i = 0; i < cardsToDiscard; i++) {
    const randomIndex = Math.floor(Math.random() * playerHand.value.length)
    discarded.push(playerHand.value.splice(randomIndex, 1)[0])
  }

  gameMessage.value = {
    text: `CHAOS! You discarded ${cardsToDiscard} card${cardsToDiscard > 1 ? 's' : ''}!`,
    type: 'warning'
  }
  return true
}

function forceOpponentDiscard() {
  const opponentsWithCards = opponents.value.filter(opp => opp.hand.length > 0)
  if (opponentsWithCards.length === 0) return false

  const randomOpponent = opponentsWithCards[Math.floor(Math.random() * opponentsWithCards.length)]
  const randomIndex = Math.floor(Math.random() * randomOpponent.hand.length)
  const discarded = randomOpponent.hand.splice(randomIndex, 1)[0]

  gameMessage.value = {
    text: `CHAOS! ${randomOpponent.name} was forced to discard a card!`,
    type: 'info'
  }
  return true
}

function revealRankAcrossHands() {
  const allRanks = [...new Set([...playerHand.value, ...opponents.value.flatMap(o => o.hand)].map(c => c.rank))]
  if (allRanks.length === 0) return false

  const randomRank = allRanks[Math.floor(Math.random() * allRanks.length)]
  const playerCount = playerHand.value.filter(c => c.rank === randomRank).length
  const opponentCounts = opponents.value.map(opp => ({
    name: opp.name,
    count: opp.hand.filter(c => c.rank === randomRank).length
  }))

  const counts = opponentCounts.map(o => `${o.name}: ${o.count}`).join(', ')
  gameMessage.value = {
    text: `CHAOS! Revealed ${randomRank}s - You: ${playerCount}, ${counts}`,
    type: 'info'
  }
  return true
}

function getBestRankHint() {
  if (playerHand.value.length === 0) return false

  // Find rank with most cards in player's hand
  const rankCounts = {}
  for (const card of playerHand.value) {
    rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1
  }

  let bestRank = null
  let maxCount = 0
  for (const rank in rankCounts) {
    if (rankCounts[rank] > maxCount) {
      maxCount = rankCounts[rank]
      bestRank = rank
    }
  }

  if (bestRank) {
    gameMessage.value = {
      text: `CHAOS! Hint: You have ${maxCount} ${bestRank}${maxCount > 1 ? 's' : ''} - good to ask for!`,
      type: 'info'
    }
    return true
  }
  return false
}

function shuffleAllHands() {
  // Collect all cards from all hands
  const allCards = [...playerHand.value]
  for (const opp of opponents.value) {
    allCards.push(...opp.hand)
    opp.hand = []
  }
  playerHand.value = []

  // Shuffle all cards
  const shuffled = shuffle(allCards)

  // Redistribute evenly
  const players = ['player', ...opponents.value.map(o => o.name)]
  let cardIndex = 0
  for (const player of players) {
    const cardsPerPlayer = Math.floor(shuffled.length / players.length)
    const startIndex = players.indexOf(player) * cardsPerPlayer
    const endIndex = startIndex + cardsPerPlayer + (players.indexOf(player) < shuffled.length % players.length ? 1 : 0)
    
    if (player === 'player') {
      playerHand.value = shuffled.slice(startIndex, endIndex)
      sortHand(playerHand.value)
    } else {
      const opp = opponents.value.find(o => o.name === player)
      if (opp) {
        opp.hand = shuffled.slice(startIndex, endIndex)
      }
    }
  }

  gameMessage.value = {
    text: 'CHAOS! All hands shuffled and redistributed!',
    type: 'warning'
  }
  checkForBooks('player')
  for (const opp of opponents.value) {
    checkForBooks(opp.name)
  }
  return true
}

// Weighted action selector
function selectChaosAction() {
  const actions = [
    { func: previewOpponentCard, weight: 15 },
    { func: stealRandomCard, weight: 12 },
    { func: drawExtraCards, weight: 12 },
    { func: getBestRankHint, weight: 10 },
    { func: revealRankAcrossHands, weight: 10 },
    { func: giveRandomCard, weight: 8 },
    { func: discardRandomCards, weight: 8 },
    { func: forceOpponentDiscard, weight: 8 },
    { func: swapHandsWithOpponent, weight: 5 },
    { func: shuffleAllHands, weight: 2 }
  ]

  // Calculate total weight
  const totalWeight = actions.reduce((sum, a) => sum + a.weight, 0)
  let random = Math.random() * totalWeight

  // Select action based on weight
  for (const action of actions) {
    random -= action.weight
    if (random <= 0) {
      return action.func
    }
  }

  // Fallback to first action
  return actions[0].func
}

function triggerCardGainAnimation(cards) {
  // Store the current hand size before adding cards
  lastHandSize.value = playerHand.value.length
  
  // Trigger screen celebration effect
  cardGainAnimation.value = true
  setTimeout(() => {
    cardGainAnimation.value = false
  }, 2000)
  
  // Add body class for screen effects
  document.body.classList.add('card-gain-celebration')
  setTimeout(() => {
    document.body.classList.remove('card-gain-celebration')
  }, 800)
}

function executeChaosAction() {
  if (!chaosButtonAvailable.value) return

  // Add visual chaos effect
  document.body.classList.add('chaos-active')
  setTimeout(() => {
    document.body.classList.remove('chaos-active')
  }, 1000)

  // Try actions until one succeeds (with fallback)
  const actionFunc = selectChaosAction()
  let success = actionFunc()

  // If action failed, try a safe fallback
  if (!success) {
    if (deck.value.length > 0) {
      success = drawExtraCards()
    } else if (playerHand.value.length > 0) {
      success = getBestRankHint()
    }
  }

  if (success) {
    // Set cooldown to 2 turns
    chaosButtonCooldown.value = 2
    checkGameOver()
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
  chaosButtonCooldown.value = 0
  previewedCard.value = null
  cardGainAnimation.value = false
  lastHandSize.value = 0

  dealCards()
  // Set initial hand size after dealing
  setTimeout(() => {
    lastHandSize.value = playerHand.value.length
  }, 100)
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
            <div class="chaos-button-wrapper">
              <ChaosButton
                :available="chaosButtonAvailable"
                :cooldown="chaosButtonCooldown"
                :disabled="gameOver || currentTurn !== 'player'"
                @activate="executeChaosAction"
              />
            </div>
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
            :card-gain-animation="cardGainAnimation"
            :last-hand-size="lastHandSize"
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
  transition: transform 0.3s ease;
}

/* Chaos effect when button is pressed */

@keyframes chaosShake {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  10% {
    transform: translate(-10px, -5px) rotate(-2deg);
  }
  20% {
    transform: translate(10px, 5px) rotate(2deg);
  }
  30% {
    transform: translate(-8px, 3px) rotate(-1deg);
  }
  40% {
    transform: translate(8px, -3px) rotate(1deg);
  }
  50% {
    transform: translate(-5px, -2px) rotate(-0.5deg);
  }
  60% {
    transform: translate(5px, 2px) rotate(0.5deg);
  }
  70% {
    transform: translate(-3px, 1px) rotate(-0.3deg);
  }
  80% {
    transform: translate(3px, -1px) rotate(0.3deg);
  }
  90% {
    transform: translate(-2px, 0) rotate(-0.1deg);
  }
}

@keyframes chaosWobble {
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.02) rotate(1deg);
  }
  75% {
    transform: scale(0.98) rotate(-1deg);
  }
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
  flex-wrap: wrap;
}

.chaos-button-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  order: -1; /* Place chaos button first (left of draw pile) */
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

  .chaos-button-wrapper {
    /* Already ordered first, no change needed */
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
