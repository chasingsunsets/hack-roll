<script setup>
import { ref } from 'vue'

const emit = defineEmits(['slang-clicked'])

// Each slang has a text, icon, and audio file name
const slangs = [
  { text: 'Walao eh!', icon: '😤', audio: 'walao-eh.mp3' },
  { text: 'Alamak!', icon: '😱', audio: 'alamak.mp3' },
  { text: 'Aiyo!', icon: '😩', audio: 'aiyo.mp3' },
  { text: 'Wah lau!', icon: '😮', audio: 'wah-lau.mp3' },
  { text: 'Shiok ah!', icon: '😋', audio: 'shiok-ah.mp3' },
  { text: 'Can lah!', icon: '👍', audio: 'can-lah.mp3' },
  { text: 'Paiseh leh!', icon: '😅', audio: 'paiseh-leh.mp3' },
  { text: 'Sian!', icon: '😑', audio: 'sian.mp3' }
]

const cooldown = ref(false)

function handleSlangClick(slang) {
  if (cooldown.value) return

  // Emit slang with audio file info
  emit('slang-clicked', { text: slang.text, audio: slang.audio })

  // Cooldown to prevent spam
  cooldown.value = true
  setTimeout(() => {
    cooldown.value = false
  }, 2000)
}
</script>

<template>
  <div class="singlish-buttons">
    <div class="header">
      <span class="emoji">💬</span>
      <span class="title">Comments</span>
    </div>
    <div class="slang-column">
      <button
        v-for="slang in slangs"
        :key="slang.text"
        class="slang-btn pixel-btn"
        @click="handleSlangClick(slang)"
        :disabled="cooldown"
      >
        <span class="emoji">{{ slang.icon }}</span>
        <span class="text">{{ slang.text }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.singlish-buttons {
  position: fixed;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(0, 0, 0, 0.85);
  padding: 12px;
  border: 4px solid #000;
  border-radius: 12px;
  box-shadow: 4px 4px 0 #000;
}

.header {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  padding-bottom: 8px;
  border-bottom: 3px solid #667eea;
  margin-bottom: 4px;
}

.header .emoji {
  font-size: 1.2rem;
}

.header .title {
  font-family: 'Press Start 2P', monospace;
  font-size: 0.7rem;
  color: #fff;
  text-shadow: 2px 2px 0 #000;
}

.slang-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pixel-btn {
  font-family: 'Press Start 2P', monospace;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: 3px solid #000;
  padding: 10px 14px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow:
    3px 3px 0 #000,
    inset -2px -2px 0 rgba(0,0,0,0.3),
    inset 2px 2px 0 rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 150px;
}

.pixel-btn:hover:not(:disabled) {
  transform: translate(1px, 1px);
  box-shadow:
    2px 2px 0 #000,
    inset -2px -2px 0 rgba(0,0,0,0.3),
    inset 2px 2px 0 rgba(255,255,255,0.3);
  background: linear-gradient(135deg, #7a8eff 0%, #8a5fb8 100%);
}

.pixel-btn:active:not(:disabled) {
  transform: translate(3px, 3px);
  box-shadow:
    0px 0px 0 #000,
    inset -2px -2px 0 rgba(0,0,0,0.5),
    inset 2px 2px 0 rgba(255,255,255,0.2);
}

.pixel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slang-btn .emoji {
  font-size: 1.3rem;
  line-height: 1;
}

.slang-btn .text {
  font-size: 0.55rem;
  white-space: nowrap;
  flex: 1;
}

/* Mobile responsive */
@media (max-width: 1024px) {
  .singlish-buttons {
    left: 10px;
    padding: 10px;
  }

  .pixel-btn {
    min-width: 130px;
    padding: 8px 12px;
  }

  .slang-btn .text {
    font-size: 0.5rem;
  }

  .header .title {
    font-size: 0.6rem;
  }
}

@media (max-width: 768px) {
  .singlish-buttons {
    left: 8px;
    top: auto;
    bottom: 80px;
    transform: none;
    padding: 8px;
  }

  .slang-column {
    gap: 6px;
    max-height: 300px;
    overflow-y: auto;
  }

  .pixel-btn {
    min-width: 120px;
    padding: 8px 10px;
  }

  .slang-btn .emoji {
    font-size: 1.1rem;
  }

  .slang-btn .text {
    font-size: 0.45rem;
  }

  .header .title {
    font-size: 0.55rem;
  }
}

@media (max-width: 480px) {
  .singlish-buttons {
    left: 5px;
    bottom: 70px;
  }

  .pixel-btn {
    min-width: 100px;
    padding: 6px 8px;
    gap: 6px;
  }

  .slang-btn .emoji {
    font-size: 1rem;
  }

  .slang-btn .text {
    font-size: 0.4rem;
  }

  .header {
    padding-bottom: 6px;
    gap: 6px;
  }

  .header .emoji {
    font-size: 1rem;
  }

  .header .title {
    font-size: 0.5rem;
  }

  .slang-column {
    gap: 5px;
    max-height: 250px;
  }
}
</style>
