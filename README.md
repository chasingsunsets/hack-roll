# Go Fish! - Endless Game

A multiplayer online card game with a pixel art aesthetic, gesture detection, and chaos elements. Built with Vue 3, Socket.IO, and WebRTC.

## Features

### Core Gameplay
- Classic Go Fish card game mechanics
- Real-time multiplayer support with lobby system
- Turn-based gameplay with visual feedback
- Book completion tracking and scoring
- Pixel art UI with underwater theme

### Interactive Features
- **Gesture Detection**: Uses MediaPipe for face and hand gesture recognition
- **Banned Moves System**: Players are assigned banned gestures they must avoid during gameplay
- **Singlish Voice Chat**: Text-to-speech integration with Singaporean slang and accent
- **Peer-to-Peer Video**: WebRTC video feeds for face-to-face gameplay
- **Sound Effects**: Immersive audio feedback for game actions

### Chaos Elements
- **Octopus Troll**: Random card swapping animations
- **Deck Swap Troll**: Unexpected deck shuffling effects
- **Earthquake Troll**: Screen shake and visual turbulence
- **Taunt System**: Players can send taunts to opponents
- **Slang Comments**: Share Singlish expressions during gameplay

## Tech Stack

### Frontend
- **Vue 3**: Progressive JavaScript framework with Composition API
- **Vite**: Fast build tool and dev server
- **MediaPipe Tasks Vision**: AI-powered gesture and face landmark detection
- **Socket.IO Client**: Real-time bidirectional communication
- **WebRTC**: Peer-to-peer video streaming

### Key Dependencies
```json
{
  "@mediapipe/tasks-vision": "^0.10.22-rc.20250304",
  "socket.io-client": "^4.8.3",
  "vue": "^3.5.24"
}
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- A modern browser with camera access support
- Backend server running (see server directory)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hack-roll/goFish2
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the local development URL (typically `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
goFish2/
├── src/
│   ├── components/
│   │   ├── banned-moves/      # Gesture detection and banned move system
│   │   ├── camera/             # Camera feed and permission components
│   │   ├── Card.vue            # Playing card component
│   │   ├── GameBoard.vue       # Main game board (single player)
│   │   ├── MultiplayerGameBoard.vue  # Multiplayer game board
│   │   ├── Lobby.vue           # Game lobby and room management
│   │   ├── PlayerHand.vue      # Player's card hand
│   │   ├── OpponentHand.vue    # Opponent's card display
│   │   ├── DrawPile.vue        # Draw pile component
│   │   ├── BookPile.vue        # Completed books display
│   │   ├── TrollerOctopus.vue  # Octopus troll animation
│   │   ├── DeckSwapTroll.vue   # Deck swap animation
│   │   ├── EarthquakeTroll.vue # Earthquake effect
│   │   └── ...                 # Other game components
│   ├── composables/
│   │   ├── useCamera.js        # Camera access management
│   │   ├── useGestureDetection.js  # Gesture recognition logic
│   │   ├── useSocket.js        # Socket.IO connection and events
│   │   ├── useWebRTC.js        # WebRTC peer connections
│   │   ├── useSoundEffects.js  # Audio management
│   │   ├── useElevenLabsTTS.js # Text-to-speech integration
│   │   └── useTurbulence.js    # Visual effects
│   ├── services/
│   │   ├── gestureDefinitions.js  # Gesture type definitions
│   │   └── gestureService.js      # Gesture detection service
│   ├── assets/
│   │   ├── animations.css      # Animation styles
│   │   └── design-tokens.css   # Design system tokens
│   ├── App.vue                 # Root component
│   ├── main.js                 # Application entry point
│   └── style.css               # Global styles
├── public/                     # Static assets
├── index.html                  # HTML entry point
├── vite.config.js             # Vite configuration
└── package.json               # Project dependencies and scripts
```

## How to Play

1. **Join a Game**:
   - Enter a room code to join an existing game, or create a new room
   - Wait for other players to join (2-4 players supported)

2. **Gameplay**:
   - On your turn, select an opponent by clicking their avatar
   - Choose a card rank from your hand to ask for
   - If the opponent has cards of that rank, they give them to you
   - If not, you hear "Go Fish!" and must draw a card
   - Complete books (4 cards of the same rank) to score points

3. **Gesture Detection**:
   - Allow camera access when prompted
   - Each player is assigned a "banned move" gesture
   - If you perform your banned gesture, opponents can report you
   - Avoid your banned move while trying to catch opponents doing theirs!

4. **Interactive Features**:
   - Use Singlish buttons to send voice messages with local slang
   - Watch out for chaos troll events that shake up the game
   - Send taunts to opponents to add some competitive banter

5. **Winning**:
   - The game ends when all books are completed
   - The player with the most books wins!

## Game Modes

### Standard Mode
Classic Go Fish gameplay with modern multiplayer features.

### Chaos Mode
Includes random troll events:
- Octopus steals and swaps cards
- Earthquake shakes the screen
- Deck swaps confuse players

## Camera & Gesture Features

The game uses MediaPipe's Vision Tasks for:
- **Face Detection**: Tracks player faces for video feeds
- **Hand Gestures**: Detects various hand poses
- **Gesture Tracking**: Monitors banned moves including:
  - Peace sign
  - Thumbs up
  - Middle finger
  - Fist
  - Shaka (hang loose)
  - Rock on (horns)
  - Covering mouth
  - And more...

## Configuration

### Gesture Detection Settings
Adjust in [useGestureDetection.js](src/composables/useGestureDetection.js):
- Detection interval
- Confirmation frames required
- Cooldown periods

### Socket Connection
Configure server URL in [useSocket.js](src/composables/useSocket.js)

## Troubleshooting

### Camera Not Working
- Ensure browser has camera permissions
- Check if camera is already in use by another application
- Try using HTTPS (required for camera access on most browsers)

### Gesture Detection Not Responding
- Ensure good lighting conditions
- Keep hands clearly visible in camera frame
- Check browser console for MediaPipe loading errors

### Connection Issues
- Verify backend server is running
- Check Socket.IO server URL configuration
- Ensure firewall allows WebSocket connections

## Browser Support

- Chrome/Edge (recommended for best MediaPipe performance)
- Firefox
- Safari (WebRTC support may vary)

## Performance Tips

- Use a dedicated GPU for better gesture detection performance
- Close unnecessary browser tabs to free up resources
- Ensure stable internet connection for smooth multiplayer experience

## Development

### Adding New Gestures
1. Define gesture in [gestureDefinitions.js](src/services/gestureDefinitions.js)
2. Implement detection logic in [gestureService.js](src/services/gestureService.js)
3. Update UI components as needed

### Customizing Visuals
- Modify [design-tokens.css](src/assets/design-tokens.css) for color schemes
- Edit [animations.css](src/assets/animations.css) for animation styles
- Update pixel art components for new visual effects

## Credits

Built for a hackathon project combining classic card games with modern web technologies.

## License

[Add your license information here]
