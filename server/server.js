import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    activeRooms: rooms.size,
    activeSessions: sessions.size
  });
});

const server = createServer(app);

// Allow localhost for development and environment variable for production
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:5177",
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : [])
];

// Function to check if origin is allowed (includes .vercel.app domains)
function isOriginAllowed(origin) {
  if (!origin) return true; // Allow requests with no origin
  if (allowedOrigins.includes(origin)) return true;
  // Allow all .vercel.app domains
  if (origin.endsWith('.vercel.app')) return true;
  return false;
}

const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Constants
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const BANNED_MOVES = ['SCRATCH_HEAD', 'TOUCH_FACE', 'COVER_MOUTH', 'LOOK_AWAY', 'RAISE_HANDS'];
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 4;
const OCTOPUS_TROLL_CHANCE = 0.15; // 15% chance per turn
const DECK_SWAP_TROLL_CHANCE = 0.12; // 12% chance per turn
const EARTHQUAKE_TROLL_CHANCE = 0.10; // 10% chance per turn

// Game rooms storage
const rooms = new Map();
// Player session storage (maps sessionId to room info)
const sessions = new Map();

// Helper functions
function generateSessionId() {
  return 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

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

function createRoom(hostSocketId, hostName, sessionId) {
  let code;
  do {
    code = generateRoomCode();
  } while (rooms.has(code));

  const room = {
    code,
    hostId: sessionId,
    players: [{
      id: sessionId,
      socketId: hostSocketId,
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

  // Store session mapping
  sessions.set(sessionId, { roomCode: code, playerName: hostName });

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

    // Random octopus troller event (15% chance)
    if (Math.random() < OCTOPUS_TROLL_CHANCE) {
      // Notify only the affected player that they got trolled
      io.to(nextPlayer.socketId).emit('octopus-troll', {
        playerId: nextPlayer.id,
        playerName: nextPlayer.name
      });

      // Notify everyone else that the player's turn was skipped (after animation)
      setTimeout(() => {
        io.to(room.code).emit('turn-skipped', {
          playerId: nextPlayer.id,
          playerName: nextPlayer.name,
          reason: 'octopus_troll'
        });
      }, 3800); // Wait for octopus animation to complete

      continue; // Skip to next player
    }

    // Random deck swap troller event (12% chance)
    if (Math.random() < DECK_SWAP_TROLL_CHANCE && room.players.filter(p => p.connected).length >= 2) {
      // Get all connected players
      const connectedPlayers = room.players.filter(p => p.connected);

      // Randomly shuffle the hands among connected players
      const hands = connectedPlayers.map(p => p.hand);

      // Fisher-Yates shuffle
      for (let i = hands.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [hands[i], hands[j]] = [hands[j], hands[i]];
      }

      // Assign shuffled hands back to players
      connectedPlayers.forEach((player, index) => {
        player.hand = hands[index];
        sortHand(player.hand);
      });

      // Create swap mapping for notification
      const swapInfo = connectedPlayers.map((player, index) => ({
        playerId: player.id,
        playerName: player.name,
        newHandCount: hands[index].length
      }));

      // Notify all players about the deck swap
      io.to(room.code).emit('deck-swap-troll', {
        players: swapInfo,
        message: 'Deck Swap! Everyone\'s hands have been randomly swapped!'
      });

      // Update all clients with new game state
      setTimeout(() => {
        const publicPlayers = getPublicPlayerData(room.players, null);
        room.players.forEach(player => {
          if (player.socketId) {
            io.to(player.socketId).emit('game-state-update', {
              hand: player.hand,
              players: publicPlayers,
              deckCount: room.deck.length
            });
          }
        });
      }, 3500); // Wait for animation to complete
    }

    // Random earthquake troller event (10% chance)
    if (Math.random() < EARTHQUAKE_TROLL_CHANCE && room.players.filter(p => p.connected).length >= 2) {
      // Notify all players about the earthquake
      io.to(room.code).emit('earthquake-troll', {
        message: 'Earthquake! The ground is shaking!'
      });

      // Note: Earthquake doesn't affect game flow, just visual effect
      // Players can continue playing during the earthquake animation
    }

    break;
  } while (room.players.some(p => p.connected));
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Create a new room
  socket.on('create-room', (playerName, existingSessionId, callback) => {
    // Handle old API (no sessionId)
    if (typeof existingSessionId === 'function') {
      callback = existingSessionId;
      existingSessionId = null;
    }

    const sessionId = existingSessionId || generateSessionId();
    const room = createRoom(socket.id, playerName, sessionId);
    socket.join(room.code);
    socket.sessionId = sessionId;
    console.log(`Room ${room.code} created by ${playerName} (session: ${sessionId})`);
    callback({
      success: true,
      roomCode: room.code,
      sessionId: sessionId,
      players: getPublicPlayerData(room.players, sessionId)
    });
  });

  // Join an existing room
  socket.on('join-room', (roomCode, playerName, existingSessionId, callback) => {
    // Handle old API (no sessionId)
    if (typeof existingSessionId === 'function') {
      callback = existingSessionId;
      existingSessionId = null;
    }

    const room = rooms.get(roomCode.toUpperCase());

    if (!room) {
      callback({ success: false, error: 'Room not found' });
      return;
    }

    if (room.gameStarted) {
      callback({ success: false, error: 'Game already started' });
      return;
    }

    if (room.players.length >= MAX_PLAYERS) {
      callback({ success: false, error: 'Room is full (max 4 players)' });
      return;
    }

    const sessionId = existingSessionId || generateSessionId();

    const player = {
      id: sessionId,
      socketId: socket.id,
      name: playerName,
      hand: [],
      books: [],
      bannedMove: BANNED_MOVES[Math.floor(Math.random() * BANNED_MOVES.length)],
      connected: true,
      skipNextTurn: false
    };

    room.players.push(player);
    socket.join(roomCode.toUpperCase());
    socket.sessionId = sessionId;

    // Store session mapping
    sessions.set(sessionId, { roomCode: room.code, playerName });

    console.log(`${playerName} joined room ${roomCode} (session: ${sessionId})`);

    // Notify all players in room
    for (const p of room.players) {
      if (p.socketId) {
        io.to(p.socketId).emit('player-joined', {
          players: getPublicPlayerData(room.players, p.id),
          newPlayer: playerName
        });
      }
    }

    callback({
      success: true,
      roomCode: room.code,
      sessionId: sessionId,
      players: getPublicPlayerData(room.players, sessionId)
    });
  });

  // Rejoin a room after refresh/disconnect
  socket.on('rejoin-room', (sessionId, callback) => {
    const sessionData = sessions.get(sessionId);

    if (!sessionData) {
      callback({ success: false, error: 'Session not found' });
      return;
    }

    const room = rooms.get(sessionData.roomCode);

    if (!room) {
      sessions.delete(sessionId);
      callback({ success: false, error: 'Room no longer exists' });
      return;
    }

    const player = room.players.find(p => p.id === sessionId);

    if (!player) {
      sessions.delete(sessionId);
      callback({ success: false, error: 'Player not in room' });
      return;
    }

    // Update socket connection
    player.socketId = socket.id;
    player.connected = true;
    socket.sessionId = sessionId;
    socket.join(room.code);

    console.log(`${player.name} rejoined room ${room.code} (session: ${sessionId})`);

    // Notify other players
    for (const p of room.players) {
      if (p.id !== sessionId && p.socketId) {
        io.to(p.socketId).emit('player-rejoined', {
          playerId: sessionId,
          playerName: player.name,
          players: getPublicPlayerData(room.players, p.id)
        });
      }
    }

    // Send full game state to rejoining player
    callback({
      success: true,
      roomCode: room.code,
      sessionId: sessionId,
      players: getPublicPlayerData(room.players, sessionId),
      hand: player.hand,
      deckCount: room.deck.length,
      currentTurnId: room.players[room.currentTurnIndex]?.id,
      gameStarted: room.gameStarted,
      gameOver: room.gameOver,
      winner: room.winner,
      yourBannedMove: player.bannedMove,
      isHost: room.hostId === sessionId
    });
  });

  // Start the game
  socket.on('start-game', (roomCode, callback) => {
    const room = rooms.get(roomCode);

    if (!room) {
      callback({ success: false, error: 'Room not found' });
      return;
    }

    if (room.hostId !== socket.sessionId) {
      callback({ success: false, error: 'Only the host can start the game' });
      return;
    }

    if (room.players.length < MIN_PLAYERS) {
      callback({ success: false, error: `Need at least ${MIN_PLAYERS} players` });
      return;
    }

    room.gameStarted = true;
    room.currentTurnIndex = 0;
    dealCards(room);

    // Send game state to each player (with their own hand and banned move)
    for (const player of room.players) {
      if (player.socketId) {
        io.to(player.socketId).emit('game-started', {
          players: getPublicPlayerData(room.players, player.id),
          hand: player.hand,
          deckCount: room.deck.length,
          currentTurnId: room.players[room.currentTurnIndex].id,
          yourBannedMove: player.bannedMove
        });
      }
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
    if (currentPlayer.id !== socket.sessionId) {
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
        if (player.socketId) {
          io.to(player.socketId).emit('cards-transferred', {
            fromPlayerId: targetPlayerId,
            toPlayerId: socket.sessionId,
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
    if (currentPlayer.id !== socket.sessionId) {
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
      if (player.socketId) {
        io.to(player.socketId).emit('card-drawn', {
          playerId: socket.sessionId,
          drawnCard: player.id === socket.sessionId ? drawnCard : null, // Only show card to drawer
          hand: player.hand,
          players: getPublicPlayerData(room.players, player.id),
          deckCount: room.deck.length,
          currentTurnId: room.players[room.currentTurnIndex].id,
          completedBooks,
          gameOver,
          winner: room.winner
        });
      }
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

    const reporter = room.players.find(p => p.id === socket.sessionId);
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

  // Turbulence event - reveals all hands temporarily
  socket.on('turbulence-start', (roomCode) => {
    const room = rooms.get(roomCode);
    if (!room || !room.gameStarted) return;

    // Send all player hands (including cards) to all players
    const allHandsData = room.players.map(p => ({
      id: p.id,
      name: p.name,
      cards: p.hand,
      cardCount: p.hand.length
    }));

    io.to(room.code).emit('turbulence-reveal', {
      allHands: allHandsData
    });
  });

  // Report gesture detected (camera sees the reporting player doing a gesture)
  socket.on('gesture-detected', (roomCode, gestureType, callback) => {
    console.log(`Gesture detected from ${socket.sessionId}: ${gestureType}`);
    const room = rooms.get(roomCode);

    if (!room || !room.gameStarted) {
      console.log('Invalid game state - room not found or game not started');
      callback({ success: false, error: 'Invalid game state' });
      return;
    }

    const player = room.players.find(p => p.id === socket.sessionId);

    if (!player) {
      console.log('Player not found');
      callback({ success: false, error: 'Player not found' });
      return;
    }

    console.log(`Player ${player.name} gesture: ${gestureType}, their banned move: ${player.bannedMove}`);

    // Check if this gesture is the player's OWN banned move (they got caught!)
    if (player.bannedMove === gestureType) {
      // Pick a random other player as the "catcher"
      const otherPlayers = room.players.filter(p => p.id !== socket.sessionId && p.connected);
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

  // Singlish slang comment
  socket.on('slang-comment', (roomCode, slangText, callback) => {
    const room = rooms.get(roomCode);

    if (!room || !room.gameStarted) {
      callback({ success: false, error: 'Invalid game state' });
      return;
    }

    const player = room.players.find(p => p.id === socket.sessionId);

    if (!player) {
      callback({ success: false, error: 'Player not found' });
      return;
    }

    // Broadcast the slang comment to all players in the room
    io.to(room.code).emit('slang-comment-broadcast', {
      playerId: player.id,
      playerName: player.name,
      slangText: slangText
    });

    callback({ success: true });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id, 'sessionId:', socket.sessionId);

    // Find and update any rooms this player was in
    for (const [code, room] of rooms) {
      const playerIndex = room.players.findIndex(p => p.id === socket.sessionId);
      if (playerIndex !== -1) {
        room.players[playerIndex].connected = false;
        room.players[playerIndex].socketId = null; // Clear the socket reference

        if (room.gameStarted) {
          // Notify other players
          io.to(code).emit('player-disconnected', {
            playerId: socket.sessionId,
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
          // Game hasn't started, remove player from session
          sessions.delete(socket.sessionId);
          room.players.splice(playerIndex, 1);

          if (room.players.length === 0) {
            rooms.delete(code);
          } else {
            // If host left, assign new host
            if (room.hostId === socket.sessionId) {
              room.hostId = room.players[0].id;
            }
            io.to(code).emit('player-left', {
              playerId: socket.sessionId,
              players: getPublicPlayerData(room.players, null),
              newHostId: room.hostId
            });
          }
        }
        break;
      }
    }
  });

  // WebRTC signaling events
  socket.on('webrtc-offer', ({ to, offer }) => {
    const room = Array.from(rooms.values()).find(r =>
      r.players.some(p => p.socketId === socket.id)
    )
    if (room) {
      const targetPlayer = room.players.find(p => p.id === to)
      if (targetPlayer && targetPlayer.socketId) {
        io.to(targetPlayer.socketId).emit('webrtc-offer', {
          from: socket.sessionId,
          offer
        })
      }
    }
  })

  socket.on('webrtc-answer', ({ to, answer }) => {
    const room = Array.from(rooms.values()).find(r =>
      r.players.some(p => p.socketId === socket.id)
    )
    if (room) {
      const targetPlayer = room.players.find(p => p.id === to)
      if (targetPlayer && targetPlayer.socketId) {
        io.to(targetPlayer.socketId).emit('webrtc-answer', {
          from: socket.sessionId,
          answer
        })
      }
    }
  })

  socket.on('webrtc-ice-candidate', ({ to, candidate }) => {
    const room = Array.from(rooms.values()).find(r =>
      r.players.some(p => p.socketId === socket.id)
    )
    if (room) {
      const targetPlayer = room.players.find(p => p.id === to)
      if (targetPlayer && targetPlayer.socketId) {
        io.to(targetPlayer.socketId).emit('webrtc-ice-candidate', {
          from: socket.sessionId,
          candidate
        })
      }
    }
  })
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Go Fish server running on port ${PORT}`);
});
