<template>
  <div class="container">
    <button class="back-button" @click="goBack">← 메인으로 돌아가기</button>

    <div v-if="loading" class="loading">경기 정보를 불러오는 중...</div>

    <div v-else-if="!game" class="error">경기 정보를 찾을 수 없습니다.</div>

    <div v-else>
      <div class="detail-header">
        <div class="detail-teams">
          <div class="detail-team">
            <div class="detail-team-logo">{{ game.homeTeam }}</div>
            <div class="team-name">{{ game.homeTeamName }}</div>
            <div class="detail-score">{{ game.homeScore }}</div>
          </div>
          <div class="detail-vs">VS</div>
          <div class="detail-team">
            <div class="detail-team-logo">{{ game.awayTeam }}</div>
            <div class="team-name">{{ game.awayTeamName }}</div>
            <div class="detail-score">{{ game.awayScore }}</div>
          </div>
        </div>
        <div class="game-info">
          {{ game.inning }} • {{ game.stadium }} • {{ game.startTime }} •
          <GameStatus :status="game.status" class="inline-status" />
        </div>
      </div>

      <!-- <CheeringSection :game="game" @cheer="handleCheer" /> -->

      <div class="detail-content">
        <LiveCommentary :gameId="gameId" />
        <ChatSection :gameId="gameId" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'
import { useChatStore } from '../stores/chat'
import GameStatus from '../components/game/GameStatus.vue'
import CheeringSection from '../components/cheering/CheeringSection.vue'
import LiveCommentary from '../components/commentary/LiveCommentary.vue'
import ChatSection from '../components/chat/ChatSection.vue'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()
const chatStore = useChatStore()

const gameId = computed(() => route.params.gameId)
const game = computed(() => gameStore.currentGame)
const loading = computed(() => gameStore.loading)

const goBack = () => {
  router.push('/')
}

const handleCheer = team => {
  gameStore.cheerForTeam(gameId.value, team)
}

onMounted(async () => {
  await gameStore.fetchGameDetail(gameId.value)
})

onUnmounted(() => {
  chatStore.disconnect()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.back-button {
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 20px;
  font-size: 1rem;
  transition: background 0.3s ease;
}

.back-button:hover {
  background: #5a6268;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 1.2rem;
}

.error {
  text-align: center;
  padding: 60px 20px;
  color: #dc3545;
  font-size: 1.2rem;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
}

.detail-header {
  background: white;
  padding: 30px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.detail-teams {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.detail-team {
  text-align: center;
  flex: 1;
}

.detail-team-logo {
  width: 80px;
  height: 80px;
  background: #2c5aa0;
  border-radius: 50%;
  margin: 0 auto 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.4rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.team-name {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.detail-score {
  font-size: 3rem;
  font-weight: bold;
  color: #2c5aa0;
}

.detail-vs {
  font-size: 1.8rem;
  font-weight: bold;
  color: #666;
  margin: 0 30px;
}

.game-info {
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.inline-status {
  position: static;
  margin: 0;
}

.detail-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }

  .detail-header {
    padding: 20px;
  }

  .detail-teams {
    flex-direction: column;
    gap: 20px;
  }

  .detail-team-logo {
    width: 60px;
    height: 60px;
    font-size: 1.2rem;
  }

  .detail-score {
    font-size: 2.5rem;
  }

  .detail-vs {
    font-size: 1.5rem;
    margin: 10px 0;
  }

  .game-info {
    font-size: 1rem;
    flex-direction: column;
    gap: 5px;
  }

  .detail-content {
    grid-template-columns: 1fr;
  }
}
</style>
