<template>
  <div class="container">
    <button class="back-button" @click="goBack">← 메인으로 돌아가기</button>

    <div v-if="loading" class="loading">경기 정보를 불러오는 중...</div>

    <div v-else-if="!game" class="error">경기 정보를 찾을 수 없습니다.</div>

    <div v-else>
      <!-- 경기 정보 헤더 -->
      <div class="detail-header">
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
      </div>

      <!-- WebSocket 연결 상태 표시 -->
      <div class="connection-status">
        <div v-if="chatConnected" class="status-connected">
          🟢 실시간 채팅 연결됨
          <span v-if="participants > 0">({{ participants }}명 접속)</span>
        </div>
        <div v-else-if="connectionError" class="status-error">
          🔴 {{ connectionError }}
          <button @click="reconnectChat" class="reconnect-btn">재연결</button>
        </div>
        <div v-else class="status-connecting">🟡 채팅방 연결 중...</div>
      </div>

      <!-- 문자중계 섹션 (선택사항) -->
      <!-- <div class="commentary-section">
        <LiveCommentary :gameId="gameId" />
      </div> -->

      <!-- 팀별 채팅 섹션 (전체 너비) -->
      <div class="chat-section-full">
        <TeamChatSection
          :gameId="gameId"
          :game="game"
          :disabled="!chatConnected"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'
import { useChatStore } from '../stores/chat'
import { getTeamInfo } from '../utils/teamUtils'
// import LiveCommentary from '../components/commentary/LiveCommentary.vue'
import TeamChatSection from '../components/chat/TeamChatSection.vue'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()
const chatStore = useChatStore()

// Computed properties
const gameId = computed(() => route.params.gameId)
const game = computed(() => gameStore.currentGame)
const loading = computed(() => gameStore.loading)

const homeTeamInfo = computed(() => getTeamInfo(game.value?.homeTeam))
const awayTeamInfo = computed(() => getTeamInfo(game.value?.awayTeam))

// 채팅 관련 상태
const chatConnected = computed(() => chatStore.isConnected)
const connectionError = computed(() => chatStore.getConnectionError)
const participants = computed(() => chatStore.getParticipants)

// Methods
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

const reconnectChat = () => {
  if (game.value) {
    chatStore.reconnect()
  }
}

// Lifecycle hooks
onMounted(async () => {
  try {
    // 게임 정보 먼저 로드
    await gameStore.fetchGameDetail(gameId.value)

    // 게임 정보 로드 후 채팅 연결
    if (game.value) {
      console.log('🎮 게임 정보 로드 완료, 채팅 연결 시작...')
      chatStore.connectToGame(gameId.value, game.value)
    }
  } catch (error) {
    console.error('게임 정보 로드 실패:', error)
  }
})

onBeforeUnmount(() => {
  // 페이지 떠날 때 채팅 연결 해제
  console.log('📤 GameDetail 페이지 종료, 채팅 연결 해제')
  chatStore.disconnect()
})

onUnmounted(() => {
  // 컴포넌트 완전 해제 시에도 확실히 정리
  chatStore.disconnect()
})

// 브라우저 닫기/새로고침 시 연결 해제
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    chatStore.disconnect()
  })
}
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
  justify-content: center;
  align-items: center;
  gap: 40px;
  margin-bottom: 20px;
}

.detail-team {
  text-align: center;
}

.detail-team-logo {
  margin-bottom: 15px;
}

.team-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.team-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.detail-score {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c5aa0;
}

.detail-vs {
  font-size: 1.5rem;
  font-weight: bold;
  color: #666;
}

.game-info {
  text-align: center;
  font-size: 1.1rem;
  color: #666;
}

.game-status {
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
  background: #f8f9fa;
}

/* WebSocket 연결 상태 스타일 */
.connection-status {
  margin-bottom: 20px;
  text-align: center;
}

.status-connected {
  background: #d4edda;
  color: #155724;
  padding: 12px 20px;
  border-radius: 8px;
  border: 1px solid #c3e6cb;
  font-weight: 500;
}

.status-error {
  background: #f8d7da;
  color: #721c24;
  padding: 12px 20px;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.status-connecting {
  background: #fff3cd;
  color: #856404;
  padding: 12px 20px;
  border-radius: 8px;
  border: 1px solid #ffeaa7;
  font-weight: 500;
}

.reconnect-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s ease;
}

.reconnect-btn:hover {
  background: #c82333;
}

.chat-section-full {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-height: 600px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .container {
    padding: 10px;
  }

  .detail-teams {
    gap: 20px;
  }

  .team-image {
    width: 60px;
    height: 60px;
  }

  .detail-score {
    font-size: 2rem;
  }

  .connection-status {
    font-size: 0.9rem;
  }

  .status-error {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
