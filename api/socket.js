import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();

// CORS configuration for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL || 'https://your-app.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Constants
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const BANNED_MOVES = ['SCRATCH_HEAD', 'TOUCH_FACE', 'COVER_MOUTH', 'LOOK_AWAY', 'RAISE_HANDS'];
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 4;
const OCTOPUS_TROLL_CHANCE = 0.15;
const DECK_SWAP_TROLL_CHANCE = 0.12;
const EARTHQUAKE_TROLL_CHANCE = 0.10;

// Game rooms storage
const rooms = new Map();
const sessions = new Map();

// Import the rest of the server logic from server.js
// For Vercel deployment, we need to export the app and socket handler

let io;

export default function handler(req, res) {
  if (!io) {
    const httpServer = require('http').createServer(app);

    io = new Server(httpServer, {
      cors: {
        origin: function(origin, callback) {
          if (!origin) return callback(null, true);
          if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        credentials: true,
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling']
    });

    // Socket.io connection handling
    io.on('connection', (socket) => {
      console.log('Player connected:', socket.id);

      // All socket event handlers will go here
      // This is a placeholder - full implementation needed

      socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
      });
    });
  }

  app(req, res);
}
