<!-- src/views/Home.vue -->
<template>
  <div class="container">
    <!-- 채팅방 섹션 -->
    <div class="games-section">
      <h2 class="games-title">💬 채팅방 목록</h2>

      <div v-if="chatLoading" class="loading">채팅방 정보를 불러오는 중...</div>

      <div v-else-if="chatError" class="error">
        {{ chatError }}
      </div>

      <div v-else class="games-list">
        <!-- 🌟 고정 채팅방 (첫 번째, 특별 스타일) -->
        <GeneralChatRoomCard
          v-if="generalChatRoom"
          :room="generalChatRoom"
          @click="goToGeneralChat()"
          class="general-card"
        />
        
        <!-- 📋 기존 경기별 채팅방들 -->
        <ChatRoomCard
          v-for="item in gameChatRooms"
          :key="item.roomId"
          :room="item"
          :game="item.game"
          @click="goToChatRoom(item.roomId)"
        />

        <!-- 📭 채팅방이 없을 때 -->
        <div v-if="!generalChatRoom && gameChatRooms.length === 0" class="no-rooms">
          <div class="no-rooms-icon">💭</div>
          <h3>활성화된 채팅방이 없습니다</h3>
          <p>곧 새로운 경기가 시작되면 채팅방이 생성됩니다!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '../stores/chat'

import ChatRoomCard from '../components/chat/ChatRoomCard.vue'
import GeneralChatRoomCard from '../components/chat/GeneralChatRoomCard.vue'

const router = useRouter()
const chatStore = useChatStore()

// 💡 Computed: 채팅방 데이터 분리
const chatRooms = computed(() => chatStore.roomsWithDetails)
const chatLoading = computed(() => chatStore.detailsLoading)
const chatError = computed(() => chatStore.detailsError)

// 🌟 고정 채팅방 (gameId가 null인 방)
const generalChatRoom = computed(() => 
  chatRooms.value.find(room => room.gameId === null)
)

// 📋 경기별 채팅방 (gameId가 있는 방들)
const gameChatRooms = computed(() =>
  chatRooms.value.filter(room => room.gameId !== null)
)

// 🎯 네비게이션 함수들
const goToGeneralChat = () => {
  if (generalChatRoom.value) {
    // 고정 채팅방은 roomId로 이동 (/chat/1)
    router.push(`/chat/${generalChatRoom.value.roomId}`)
  }
}

const goToChatRoom = (roomId) => {
  // 경기별 채팅방: gameId를 찾아서 이동
  const room = chatRooms.value.find(r => r.roomId === roomId)
  if (room && room.gameId !== null) {
    router.push(`/games/${room.gameId}`)
  } else {
    console.error('게임 ID를 찾을 수 없습니다:', roomId)
  }
}

// 🚀 초기 데이터 로드
onMounted(async () => {
  console.log('🏠 Home 컴포넌트 마운트 - 채팅방 목록 로드 시작')
  await chatStore.fetchActiveWithDetails()
  console.log('✅ 채팅방 목록 로드 완료:', {
    total: chatRooms.value.length,
    general: generalChatRoom.value ? 1 : 0,
    games: gameChatRooms.value.length
  })
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.games-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.games-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #2c5aa0;
  border-bottom: 3px solid #2c5aa0;
  padding-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 📋 채팅방 목록 그리드 */
.games-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  align-items: start;
}

/* 🌟 고정 채팅방을 첫 번째로 정렬하되 같은 그리드에 포함 */
.general-card {
  order: -1; /* 첫 번째로 정렬 */
  /* 다른 카드들과 동일한 그리드 셀 크기 유지 */
}

/* 📭 빈 상태 */
.no-rooms {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.no-rooms-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.7;
}

.no-rooms h3 {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  color: #333;
}

.no-rooms p {
  margin: 0;
  font-size: 0.9rem;
  color: #888;
}

/* 🔄 로딩 상태 */
.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.1rem;
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

/* ❌ 에러 상태 */
.error {
  text-align: center;
  padding: 40px;
  color: #dc3545;
  font-size: 1.1rem;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  margin: 20px 0;
}

/* 📱 모바일 반응형 */
@media (max-width: 768px) {
  .container {
    padding: 10px;
  }

  .games-section {
    padding: 15px;
  }

  .games-title {
    font-size: 1.3rem;
  }

  .games-list {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .general-card {
    order: -1; /* 첫 번째로 정렬 유지 */
  }

  .no-rooms {
    padding: 40px 15px;
  }

  .no-rooms-icon {
    font-size: 3rem;
  }
}

/* 🎨 호버 효과 개선 */
@media (hover: hover) {
  .games-list > * :hover {
    transform: translateY(-2px);
    transition: transform 0.2s ease;
  }
}
</style>