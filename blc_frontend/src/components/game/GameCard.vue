<template>
  <div class="game-card" @click="$emit('click')">
    <GameStatus :status="game.status" />
    
    <div class="teams">
      <div class="team">
        <div class="team-logo">{{ game.homeTeam }}</div>
        <div class="score">{{ game.homeScore }}</div>
      </div>
      <div class="vs">VS</div>
      <div class="team">
        <div class="team-logo">{{ game.awayTeam }}</div>
        <div class="score">{{ game.awayScore }}</div>
      </div>
    </div>
    
    <div class="game-info">
      {{ game.inning }} • {{ game.stadium }} • {{ game.startTime }}
    </div>
    
    <div class="cheering-info">
      <div class="cheer-count">{{ game.homeTeam }} {{ game.homeCheerCount }}</div>
      <div class="cheer-count">{{ game.awayTeam }} {{ game.awayCheerCount }}</div>
    </div>
    
    <div class="chat-preview">
      <h4>💬 실시간 채팅</h4>
      <div 
        v-for="message in game.recentMessages" 
        :key="message.id"
        class="chat-message"
      >
        {{ message.nickname }}: {{ message.content }}
      </div>
    </div>
  </div>
</template>

<script setup>
import GameStatus from './GameStatus.vue'

defineProps({
  game: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])
</script>

<style scoped>
.game-card {
  min-width: 300px;
  background: #fff;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.game-card:hover {
  border-color: #2c5aa0;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(44, 90, 160, 0.2);
}

.teams {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.team {
  text-align: center;
  flex: 1;
}

.team-logo {
  width: 40px;
  height: 40px;
  background: #2c5aa0;
  border-radius: 50%;
  margin: 0 auto 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
}

.vs {
  font-size: 1.2rem;
  font-weight: bold;
  color: #666;
  margin: 0 10px;
}

.score {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c5aa0;
  margin: 10px 0;
}

.game-info {
  text-align: center;
  margin-bottom: 15px;
  color: #666;
  font-size: 0.9rem;
}

.cheering-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.cheer-count {
  background: #ff6b6b;
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
}

.chat-preview {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 5px;
  border-left: 3px solid #2c5aa0;
}

.chat-preview h4 {
  font-size: 0.9rem;
  margin-bottom: 5px;
  color: #2c5aa0;
}

.chat-message {
  font-size: 0.8rem;
  color: #666;
  margin: 2px 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {
  .game-card {
    min-width: auto;
    margin-bottom: 15px;
  }
}
</style>