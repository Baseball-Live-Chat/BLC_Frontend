<template>
  <div class="container">
    <button class="back-button" @click="goBack">← 메인으로 돌아가기</button>

    <div v-if="loading" class="loading">경기 정보를 불러오는 중...</div>

    <div v-else-if="!game" class="error">경기 정보를 찾을 수 없습니다.</div>

    <div v-else>
      <!--<div class="detail-header">
        <div class="detail-teams">
          <div class="detail-team">
            <div class="detail-team-logo">
              <img
                :src="homeTeamInfo.image"
                :alt="homeTeamInfo.name"
                class="team-image"
              />
            </div>
            <div class="team-name">{{ game.homeTeamName }}</div>
            <div class="detail-score">{{ game.homeScore }}</div>
          </div>
          <div class="detail-vs">VS</div>
          <div class="detail-team">
            <div class="detail-team-logo">
              <img
                :src="awayTeamInfo.image"
                :alt="awayTeamInfo.name"
                class="team-image"
              />
            </div>
            <div class="team-name">{{ game.awayTeamName }}</div>
            <div class="detail-score">{{ game.awayScore }}</div>
          </div>
        </div>
        <div class="game-info">
          {{ game.inning }} • {{ game.stadium }} • {{ game.startTime }} •
          <span class="game-status">{{ getStatusText(game.status) }}</span>
        </div>
      </div>-->

      <!-- 문자중계 (상단) -->
      <!-- <div class="commentary-section">
        <LiveCommentary :gameId="gameId" />
      </div> -->

      <!-- 통합 채팅 (하단 전체 너비) -->
      <div class="chat-section-full">
        <UnifiedChatSection :game-id="gameId" :game="game" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'
import { useChatStore } from '../stores/chat'
import { getTeamInfo } from '../utils/teamUtils'
import LiveCommentary from '../components/commentary/LiveCommentary.vue'
import UnifiedChatSection from '../components/chat/UnifiedChatSection.vue'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()
const chatStore = useChatStore()

const gameId = computed(() => route.params.gameId)
const game = computed(() => gameStore.currentGame)
const loading = computed(() => gameStore.loading)

const homeTeamInfo = computed(() => getTeamInfo(game.value?.homeTeam))
const awayTeamInfo = computed(() => getTeamInfo(game.value?.awayTeam))

const getStatusText = status => {
  const statusMap = {
    LIVE: '🔴 LIVE',
    ENDED: '⚫ 경기종료',
    SCHEDULED: '⏰ 경기예정',
    DELAYED: '⏸️ 경기지연',
  }
  return statusMap[status] || status
}

const goBack = () => {
  router.push('/')
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
  max-width: 1400px;
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
  border-radius: 50%;
  margin: 0 auto 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border: 3px solid #e9ecef;
  overflow: hidden;
}

.team-image {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 50%;
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

.game-status {
  font-weight: bold;
  color: #2c5aa0;
}

.commentary-section {
  margin-bottom: 20px;
}

.chat-section-full {
  margin-bottom: 20px;
}

/* 통합 채팅이 전체 너비를 차지하도록 */
.chat-section-full :deep(.unified-chat-section) {
  min-height: 600px;
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
  }

  .team-image {
    width: 50px;
    height: 50px;
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

  .chat-section-full :deep(.unified-chat-section) {
    min-height: 500px;
  }
}
</style>
