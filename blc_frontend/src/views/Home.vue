<template>
  <div class="container">

    <!-- 경기 카드 섹션 -->
    <div class="games-section">
      <h2 class="games-title">🔥 활성화된 채팅방</h2>

      <div v-if="chatLoading" class="loading">채팅방 정보를 불러오는 중...</div>

      <div v-else-if="chatError" class="error">
        {{ chatError }}
      </div>

      <div v-else class="games-list">
        <ChatRoomCard
          v-for="item in chatRooms"
          :key="item.roomId"
          :room="item"
          :game="item.game"
          @click="goToChatRoom(item.roomId)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '../stores/chat'

import RankingSection from '../components/game/RankingSection.vue'
import ChatRoomCard from '../components/chat/ChatRoomCard.vue'

const router = useRouter()

const chatStore = useChatStore()
const chatRooms = computed(() => chatStore.roomsWithDetails)
const chatLoading = computed(() => chatStore.detailsLoading)
const chatError = computed(() => chatStore.detailsError)

const goToChatRoom = id => {
  router.push(`/games/${id}`)
}

onMounted(async () => {
  await chatStore.fetchActiveWithDetails()
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
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.games-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #2c5aa0;
  border-bottom: 2px solid #2c5aa0;
  padding-bottom: 10px;
}

.games-list {
  display: grid;
  /* 3열 고정 */
  grid-template-columns: repeat(3, minmax(200px, 1fr));
  gap: 20px;
  /* 가운데 정렬 옵션 (선택) */
  justify-content: center;
  align-content: start;
  padding: 10px 0;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.1rem;
}

.error {
  text-align: center;
  padding: 40px;
  color: #dc3545;
  font-size: 1.1rem;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 5px;
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }

  .games-list {
    flex-direction: column;
  }
}
</style>
