export const BANNED_MOVES = {
  SCRATCH_HEAD: {
    name: 'Scratching Head',
    icon: '🤔',
    description: 'Hand touches top of head',
    detectHint: 'Detected when hand landmarks are above forehead level'
  },
  TOUCH_FACE: {
    name: 'Touching Face',
    icon: '😮',
    description: 'Hand touches cheek or chin',
    detectHint: 'Detected when hand is within close proximity to face landmarks'
  },
  COVER_MOUTH: {
    name: 'Covering Mouth',
    icon: '🤭',
    description: 'Hand covers mouth area',
    detectHint: 'Detected when palm center is near mouth landmarks'
  },
  LOOK_AWAY: {
    name: 'Looking Away',
    icon: '👀',
    description: 'Face turns away from camera',
    detectHint: 'Detected when nose position deviates significantly from eye center'
  },
  RAISE_HANDS: {
    name: 'Raising Hands',
    icon: '🙌',
    description: 'Both hands raised above shoulders',
    detectHint: 'Detected when both wrists are above shoulder level'
  }
};

export const PENALTIES = {
  LOSE_CARD: {
    name: 'Lose a Card',
    description: 'A random card is removed from your hand',
    icon: '🃏',
    severity: 'high'
  },
  REVEAL_CARD: {
    name: 'Card Exposed',
    description: 'One of your cards is revealed for 10 seconds',
    icon: '👁️',
    severity: 'medium'
  },
  SKIP_TURN: {
    name: 'Turn Skipped',
    description: 'Your next turn is skipped',
    icon: '⏭️',
    severity: 'high'
  },
  DRAW_TWO: {
    name: 'Draw Two',
    description: 'Draw 2 extra cards from the deck',
    icon: '📥',
    severity: 'medium'
  },
  GIVE_CARD: {
    name: 'Forced Gift',
    description: 'Give a random card to who caught you',
    icon: '🎁',
    severity: 'high'
  },
  SHOW_HAND_COUNT: {
    name: 'Hand Exposed',
    description: 'Your card ranks are announced',
    icon: '📢',
    severity: 'low'
  },
  DOUBLE_JEOPARDY: {
    name: 'Double Jeopardy',
    description: 'Next violation triggers 2 penalties',
    icon: '⚠️',
    severity: 'medium'
  },
  FISHING_TRIP: {
    name: 'Fishing Trip',
    description: 'Next ask automatically fails',
    icon: '🎣',
    severity: 'medium'
  }
};

export function getMoveInfo(moveKey) {
  return BANNED_MOVES[moveKey] || null;
}

export function getPenaltyInfo(penaltyKey) {
  return PENALTIES[penaltyKey] || null;
}
