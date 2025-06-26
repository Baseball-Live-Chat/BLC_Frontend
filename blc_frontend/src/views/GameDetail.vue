<template>
  <div class="container">
    <button class="back-button" @click="goBack">← 메인으로 돌아가기</button>

    <!-- 🔍 디버그 정보 
    <div v-if="gameId" class="debug-info">
      <h3>🔍 디버그 정보</h3>
      <p><strong>Game ID:</strong> {{ gameId }}</p>
      <p><strong>Loading:</strong> {{ loading }}</p>
      <p><strong>Error:</strong> {{ gameStore.error }}</p>
      <p><strong>Current Game:</strong> {{ game ? '✅ 로드됨' : '❌ 없음' }}</p>
      
      <details v-if="game">
        <summary>📄 게임 데이터 상세</summary>
        <pre>{{ JSON.stringify(game, null, 2) }}</pre>
      </details>
    </div>-->

    <div v-if="loading" class="loading">경기 정보를 불러오는 중...</div>

    <div v-else-if="!game" class="error">
      경기 정보를 찾을 수 없습니다.
      <br>
      <small>Game ID: {{ gameId }}</small>
      <br>
      <small>Error: {{ gameStore.error }}</small>
    </div>

    <div v-else>
      

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
import UnifiedChatSection from '../components/chat/UnifiedChatSection.vue'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()
const chatStore = useChatStore()

const gameId = computed(() => route.params.gameId)
const game = computed(() => gameStore.currentGame)
const loading = computed(() => gameStore.loading)

// 팀 정보 (백업용 - API 실패시 로컬 정보 사용)
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

// 이미지 로드 실패 시 백업 이미지 사용
const handleImageError = (event) => {
  console.warn('팀 로고 이미지 로드 실패:', event.target.src)
  // 기본 이미지로 대체하거나 숨기기
  event.target.style.display = 'none'
}

onMounted(async () => {
  console.log('🎮 GameDetail 마운트, Game ID:', gameId.value)
  
  try {
    await gameStore.fetchGameDetail(gameId.value)
    console.log('✅ 게임 상세 조회 완료:', game.value)
  } catch (error) {
    console.error('❌ 게임 상세 조회 실패:', error)
  }
})

onUnmounted(() => {
  console.log('🔌 GameDetail 언마운트, 채팅 연결 해제')
  chatStore.disconnect()
})
</script>

<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

/* 🔍 디버그 정보 스타일 */
.debug-info {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  font-family: monospace;
  font-size: 0.9rem;
}

.debug-info h3 {
  margin: 0 0 10px 0;
  color: #495057;
}

.debug-info details {
  margin-top: 10px;
}

.debug-info pre {
  background: white;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.8rem;
}

/* 기존 스타일들 */
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

/* 🏟️ 경기 정보 헤더 */
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
  gap: 30px;
  margin-bottom: 20px;
}

.detail-team {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.detail-team-logo {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 50%;
  overflow: hidden;
}

.team-image {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.team-name {
  font-weight: bold;
  font-size: 1.1rem;
  color: #333;
}

.detail-score {
  font-size: 2rem;
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
  color: #666;
  font-size: 1rem;
}

.game-status {
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
  background: #e9ecef;
}

/* 채팅 섹션 */
.chat-section-full {
  width: 100%;
}

/* 반응형 */
@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
  
  .detail-teams {
    gap: 15px;
  }
  
  .detail-team-logo {
    width: 60px;
    height: 60px;
  }
  
  .team-image {
    width: 45px;
    height: 45px;
  }
  
  .detail-score {
    font-size: 1.5rem;
  }
  
  .debug-info {
    font-size: 0.8rem;
  }
}
</style>