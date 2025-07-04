<!-- src/views/GameDetail.vue -->
<template>
  <div class="container">
    <button class="back-button" @click="goBack">← 메인으로 돌아가기</button>

    <div v-if="loading" class="loading">
      {{ isGeneralChat ? '고정 채팅방' : '경기 정보' }}을 불러오는 중...
    </div>

    <div v-else-if="!game && !isGeneralChat" class="error">
      경기 정보를 찾을 수 없습니다.
      <br>
      <small>Game ID: {{ gameId }}</small>
      <br>
      <small>Error: {{ gameStore.error }}</small>
    </div>

    <div v-else>
      <!-- 🆕 고정 채팅방과 경기별 채팅방 구분 -->
      <div v-if="isGeneralChat" class="general-chat-container">
        <!-- 고정 채팅방 헤더 정보 -->
        <div class="general-header">
          <h1>⚾ 전체 야구 팬 채팅방</h1>
          <p>모든 KBO 팀을 응원할 수 있는 공간입니다</p>
          <div class="general-stats">
            <span class="stat-badge">🔴 실시간</span>
            <span class="stat-badge">👥 {{ currentRoomInfo?.maxParticipants?.toLocaleString() }}명 수용</span>
            <span class="stat-badge">⚾ 10개 팀 참여</span>
          </div>
        </div>

        <!-- 🌟 고정 채팅방 컴포넌트 (10개 팀 좌우 분할) -->
        <GeneralChatSection :room-id="actualRoomId" />
      </div>

      <div v-else class="game-chat-container">
        <!-- 기존 경기별 채팅 -->
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
import GeneralChatSection from '../components/chat/GeneralChatSection.vue'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()
const chatStore = useChatStore()

// Props from router
const gameId = computed(() => route.params.gameId)
const routerRoomId = computed(() => route.params.roomId)

// 고정 채팅방인지 확인 (gameId가 'general'이거나 undefined인 경우)
const isGeneralChat = computed(() => 
  gameId.value === 'general' || gameId.value === undefined
)

// 실제 roomId 계산
const actualRoomId = computed(() => {
  if (isGeneralChat.value) {
    // 고정 채팅방: routerRoomId 사용
    return routerRoomId.value
  }
  // 경기별 채팅방: gameId 사용
  return gameId.value
})

const game = computed(() => gameStore.currentGame)
const loading = computed(() => gameStore.loading)

// 🌟 고정 채팅방 정보 (API에서 조회한 정보)
const currentRoomInfo = computed(() => chatStore.currentRoomInfo)

// 고정 채팅방 정보 (채팅방 목록에서 가져오기) - 백업용
const generalRoom = computed(() => {
  if (!isGeneralChat.value) return null
  return chatStore.roomsWithDetails.find(room => room.gameId === null)
})

// 팀 정보 (경기별 채팅방에서만 사용)
const homeTeamInfo = computed(() => 
  game.value ? getTeamInfo(game.value.homeTeam) : null
)
const awayTeamInfo = computed(() => 
  game.value ? getTeamInfo(game.value.awayTeam) : null
)

const goBack = () => {
  router.push('/')
}

// 이미지 로드 실패 시 백업 이미지 사용
const handleImageError = (event) => {
  console.warn('팀 로고 이미지 로드 실패:', event.target.src)
  event.target.style.display = 'none'
}

onMounted(async () => {
  console.log('🎮 GameDetail 마운트:', {
    gameId: gameId.value,
    roomId: routerRoomId.value,
    isGeneral: isGeneralChat.value,
    actualRoomId: actualRoomId.value,
    routePath: route.path,
    routeParams: route.params
  })
  
  try {
    if (isGeneralChat.value) {
      // 고정 채팅방: 채팅방 목록만 로드 (게임 정보는 불필요)
      console.log('🌟 고정 채팅방 모드')
      if (chatStore.roomsWithDetails.length === 0) {
        await chatStore.fetchActiveWithDetails()
      }
    } else {
      // 경기별 채팅방: 게임 상세 정보 로드
      console.log('🏟️ 경기별 채팅방 모드')
      
      // gameId가 유효한 숫자인지 확인
      const numericGameId = parseInt(gameId.value)
      if (isNaN(numericGameId)) {
        throw new Error(`잘못된 게임 ID: ${gameId.value}`)
      }
      
      await gameStore.fetchGameDetail(numericGameId)
      console.log('✅ 게임 상세 조회 완료:', game.value)
    }
  } catch (error) {
    console.error('❌ 상세 조회 실패:', error)
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.loading::before {
  content: '';
  width: 20px;
  height: 20px;
  border: 2px solid #e3e3e3;
  border-top: 2px solid #2c5aa0;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

/* 🌟 고정 채팅방 컨테이너 */
.general-chat-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.general-header {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #8B4513;
  padding: 25px;
  border-radius: 12px;
  text-align: center;
  border: 3px solid #DAA520;
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
}

.general-header h1 {
  margin: 0 0 8px 0;
  font-size: 1.8rem;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.general-header p {
  margin: 0 0 15px 0;
  font-size: 1rem;
  opacity: 0.9;
}

.general-stats {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.stat-badge {
  background: rgba(255, 255, 255, 0.9);
  color: #8B4513;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: bold;
  border: 2px solid #DAA520;
}

/* 🏟️ 경기별 채팅방 컨테이너 */
.game-chat-container {
  width: 100%;
}

/* 반응형 */
@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
  
  .general-header {
    padding: 20px 15px;
  }
  
  .general-header h1 {
    font-size: 1.5rem;
  }
  
  .general-stats {
    gap: 8px;
  }
  
  .stat-badge {
    font-size: 0.8rem;
    padding: 4px 8px;
  }
}
</style>