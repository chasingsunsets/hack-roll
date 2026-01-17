import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177"],
    methods: ["GET", "POST"]
  }
});

// Constants
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const BANNED_MOVES = ['SCRATCH_HEAD', 'TOUCH_FACE', 'COVER_MOUTH', 'LOOK_AWAY', 'RAISE_HANDS'];

// Game rooms storage
const rooms = new Map();

// Helper functions
function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  return shuffle(deck);
}

function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function createRoom(hostId, hostName) {
  let code;
  do {
    code = generateRoomCode();
  } while (rooms.has(code));

  const room = {
    code,
    hostId,
    players: [{
      id: hostId,
      name: hostName,
      hand: [],
      books: [],
      bannedMove: BANNED_MOVES[Math.floor(Math.random() * BANNED_MOVES.length)],
      connected: true,
      skipNextTurn: false
    }],
    deck: [],
    currentTurnIndex: 0,
    gameStarted: false,
    gameOver: false,
    winner: null
  };

  rooms.set(code, room);
  return room;
}

function getPublicPlayerData(players, forPlayerId) {
  return players.map(p => ({
    id: p.id,
    name: p.name,
    cardCount: p.hand.length,
    books: p.books,
    bannedMove: p.id === forPlayerId ? null : p.bannedMove, // Hide own banned move
    connected: p.connected,
    isYou: p.id === forPlayerId
  }));
}

function getPlayerHand(room, playerId) {
  const player = room.players.find(p => p.id === playerId);
  return player ? player.hand : [];
}

function dealCards(room) {
  room.deck = createDeck();
  const cardsPerPlayer = room.players.length <= 3 ? 7 : 5;

  for (const player of room.players) {
    player.hand = [];
    player.books = [];
    for (let i = 0; i < cardsPerPlayer; i++) {
      if (room.deck.length > 0) {
        player.hand.push(room.deck.pop());
      }
    }
    sortHand(player.hand);
  }
}

function sortHand(hand) {
  hand.sort((a, b) => {
    const rankDiff = RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank);
    if (rankDiff !== 0) return rankDiff;
    return SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
  });
}

function checkForBooks(player) {
  const rankCounts = {};
  for (const card of player.hand) {
    rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
  }

  const completedBooks = [];
  for (const rank in rankCounts) {
    if (rankCounts[rank] === 4) {
      player.hand = player.hand.filter(card => card.rank !== rank);
      player.books.push({ rank });
      completedBooks.push(rank);
    }
  }
  return completedBooks;
}

function checkGameOver(room) {
  const totalBooks = room.players.reduce((sum, p) => sum + p.books.length, 0);
  if (totalBooks === 13) {
    room.gameOver = true;
    let maxBooks = 0;
    let winner = null;
    for (const player of room.players) {
      if (player.books.length > maxBooks) {
        maxBooks = player.books.length;
        winner = player;
      }
    }
    room.winner = winner ? { id: winner.id, name: winner.name, books: winner.books.length } : null;
    return true;
  }
  return false;
}

function nextTurn(room) {
  do {
    room.currentTurnIndex = (room.currentTurnIndex + 1) % room.players.length;
    const nextPlayer = room.players[room.currentTurnIndex];

    // Skip disconnected players
    if (!nextPlayer.connected && room.players.some(p => p.connected)) {
      continue;
    }

    // Handle skip turn penalty
    if (nextPlayer.skipNextTurn) {
      nextPlayer.skipNextTurn = false;
      // Notify everyone that this player's turn was skipped
      io.to(room.code).emit('turn-skipped', {
        playerId: nextPlayer.id,
        playerName: nextPlayer.name,
        reason: 'banned_move_penalty'
      });
      continue;
    }

    break;
  } while (room.players.some(p => p.connected));
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Create a new room
  socket.on('create-room', (playerName, callback) => {
    const room = createRoom(socket.id, playerName);
    socket.join(room.code);
    console.log(`Room ${room.code} created by ${playerName}`);
    callback({
      success: true,
      roomCode: room.code,
      players: getPublicPlayerData(room.players, socket.id)
    });
  });

  // Join an existing room
  socket.on('join-room', (roomCode, playerName, callback) => {
    const room = rooms.get(roomCode.toUpperCase());

    if (!room) {
      callback({ success: false, error: 'Room not found' });
      return;
    }

    if (room.gameStarted) {
      callback({ success: false, error: 'Game already started' });
      return;
    }

    if (room.players.length >= 4) {
      callback({ success: false, error: 'Room is full' });
      return;
    }

    const player = {
      id: socket.id,
      name: playerName,
      hand: [],
      books: [],
      bannedMove: BANNED_MOVES[Math.floor(Math.random() * BANNED_MOVES.length)],
      connected: true,
      skipNextTurn: false
    };

    room.players.push(player);
    socket.join(roomCode.toUpperCase());

    console.log(`${playerName} joined room ${roomCode}`);

    // Notify all players in room
    io.to(room.code).emit('player-joined', {
      players: getPublicPlayerData(room.players, socket.id),
      newPlayer: playerName
    });

    callback({
      success: true,
      roomCode: room.code,
      players: getPublicPlayerData(room.players, socket.id)
    });
  });

  // Start the game
  socket.on('start-game', (roomCode, callback) => {
    const room = rooms.get(roomCode);

    if (!room) {
      callback({ success: false, error: 'Room not found' });
      return;
    }

    if (room.hostId !== socket.id) {
      callback({ success: false, error: 'Only the host can start the game' });
      return;
    }

    if (room.players.length < 2) {
      callback({ success: false, error: 'Need at least 2 players' });
      return;
    }

    room.gameStarted = true;
    room.currentTurnIndex = 0;
    dealCards(room);

    // Send game state to each player (with their own hand)
    for (const player of room.players) {
      io.to(player.id).emit('game-started', {
        players: getPublicPlayerData(room.players, player.id),
        hand: player.hand,
        deckCount: room.deck.length,
        currentTurnId: room.players[room.currentTurnIndex].id
      });
    }

    callback({ success: true });
  });

  // Ask for cards
  socket.on('ask-for-cards', (roomCode, targetPlayerId, rank, callback) => {
    const room = rooms.get(roomCode);

    if (!room || !room.gameStarted) {
      callback({ success: false, error: 'Invalid game state' });
      return;
    }

    const currentPlayer = room.players[room.currentTurnIndex];
    if (currentPlayer.id !== socket.id) {
      callback({ success: false, error: 'Not your turn' });
      return;
    }

    const targetPlayer = room.players.find(p => p.id === targetPlayerId);
    if (!targetPlayer) {
      callback({ success: false, error: 'Target player not found' });
      return;
    }

    const matchingCards = targetPlayer.hand.filter(card => card.rank === rank);

    if (matchingCards.length > 0) {
      // Success - transfer cards
      targetPlayer.hand = targetPlayer.hand.filter(card => card.rank !== rank);
      currentPlayer.hand.push(...matchingCards);
      sortHand(currentPlayer.hand);

      const completedBooks = checkForBooks(currentPlayer);
      const gameOver = checkGameOver(room);

      // Notify all players
      for (const player of room.players) {
        io.to(player.id).emit('cards-transferred', {
          fromPlayerId: targetPlayerId,
          toPlayerId: socket.id,
          rank,
          count: matchingCards.length,
          hand: player.hand,
          players: getPublicPlayerData(room.players, player.id),
          deckCount: room.deck.length,
          currentTurnId: currentPlayer.id, // Same player continues
          completedBooks,
          gameOver,
          winner: room.winner
        });
      }

      callback({ success: true, gotCards: true, count: matchingCards.length });
    } else {
      // Go Fish!
      callback({ success: true, gotCards: false, goFish: true });
    }
  });

  // Draw a card (Go Fish)
  socket.on('draw-card', (roomCode, callback) => {
    const room = rooms.get(roomCode);

    if (!room || !room.gameStarted) {
      callback({ success: false, error: 'Invalid game state' });
      return;
    }

    const currentPlayer = room.players[room.currentTurnIndex];
    if (currentPlayer.id !== socket.id) {
      callback({ success: false, error: 'Not your turn' });
      return;
    }

    let drawnCard = null;
    if (room.deck.length > 0) {
      drawnCard = room.deck.pop();
      currentPlayer.hand.push(drawnCard);
      sortHand(currentPlayer.hand);
    }

    const completedBooks = checkForBooks(currentPlayer);
    const gameOver = checkGameOver(room);

    // Move to next turn
    nextTurn(room);

    // Notify all players
    for (const player of room.players) {
      io.to(player.id).emit('card-drawn', {
        playerId: socket.id,
        drawnCard: player.id === socket.id ? drawnCard : null, // Only show card to drawer
        hand: player.hand,
        players: getPublicPlayerData(room.players, player.id),
        deckCount: room.deck.length,
        currentTurnId: room.players[room.currentTurnIndex].id,
        completedBooks,
        gameOver,
        winner: room.winner
      });
    }

    callback({ success: true, drawnCard });
  });

  // Report banned move (old method - catching others)
  socket.on('report-banned-move', (roomCode, victimId, gestureType, callback) => {
    const room = rooms.get(roomCode);

    if (!room || !room.gameStarted) {
      callback({ success: false, error: 'Invalid game state' });
      return;
    }

    const reporter = room.players.find(p => p.id === socket.id);
    const victim = room.players.find(p => p.id === victimId);

    if (!reporter || !victim) {
      callback({ success: false, error: 'Player not found' });
      return;
    }

    // Check if the gesture matches the victim's banned move
    if (victim.bannedMove === gestureType) {
      // Correct report - apply penalty (skip turn)
      io.to(room.code).emit('banned-move-caught', {
        victimId: victim.id,
        victimName: victim.name,
        reporterId: reporter.id,
        reporterName: reporter.name,
        gestureType,
        correct: true
      });

      callback({ success: true, correct: true });
    } else {
      // Wrong report
      callback({ success: true, correct: false });
    }
  });

  // Report gesture detected (camera sees the reporting player doing a gesture)
  socket.on('gesture-detected', (roomCode, gestureType, callback) => {
    const room = rooms.get(roomCode);

    if (!room || !room.gameStarted) {
      callback({ success: false, error: 'Invalid game state' });
      return;
    }

    const player = room.players.find(p => p.id === socket.id);

    if (!player) {
      callback({ success: false, error: 'Player not found' });
      return;
    }

    // Check if this gesture is the player's OWN banned move (they got caught!)
    if (player.bannedMove === gestureType) {
      // Pick a random other player as the "catcher"
      const otherPlayers = room.players.filter(p => p.id !== socket.id && p.connected);
      const catcher = otherPlayers.length > 0
        ? otherPlayers[Math.floor(Math.random() * otherPlayers.length)]
        : { id: 'system', name: 'The System' };

      // Apply penalty: skip their next turn
      player.skipNextTurn = true;

      // Notify all players
      io.to(room.code).emit('banned-move-caught', {
        victimId: player.id,
        victimName: player.name,
        reporterId: catcher.id,
        reporterName: catcher.name,
        gestureType,
        correct: true,
        penalty: 'SKIP_TURN'
      });

      callback({ success: true, caught: true, catcherName: catcher.name, penalty: 'SKIP_TURN' });
    } else {
      callback({ success: true, caught: false });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);

    // Find and update any rooms this player was in
    for (const [code, room] of rooms) {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players[playerIndex].connected = false;

        if (room.gameStarted) {
          // Notify other players
          io.to(code).emit('player-disconnected', {
            playerId: socket.id,
            playerName: room.players[playerIndex].name,
            players: getPublicPlayerData(room.players, null)
          });

          // If it was their turn, skip to next
          if (room.currentTurnIndex === playerIndex) {
            nextTurn(room);
            io.to(code).emit('turn-changed', {
              currentTurnId: room.players[room.currentTurnIndex].id
            });
          }
        } else {
          // Game hasn't started, remove player
          room.players.splice(playerIndex, 1);

          if (room.players.length === 0) {
            rooms.delete(code);
          } else {
            // If host left, assign new host
            if (room.hostId === socket.id) {
              room.hostId = room.players[0].id;
            }
            io.to(code).emit('player-left', {
              playerId: socket.id,
              players: getPublicPlayerData(room.players, null),
              newHostId: room.hostId
            });
          }
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Go Fish server running on port ${PORT}`);
});
