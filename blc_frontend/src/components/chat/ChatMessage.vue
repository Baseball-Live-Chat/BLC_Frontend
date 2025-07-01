<template>
  <div 
    class="chat-message" 
    :class="{ 
      'home-team': message.team === 'home',
      'away-team': message.team === 'away',
      'my-message': isMyMessage 
    }"
  >
    <div class="message-container">
      <!-- 팀 배지와 사용자 정보를 가로로 배치 -->
      <div class="message-header">
        <div class="team-badge" :style="{ backgroundColor: teamColor }">
          {{ teamName }}
        </div>
        <div class="user-info">
          <span class="username">{{ message.nickname || '익명' }}</span>
        </div>
      </div>

      <!-- 메시지 내용 -->
      <div 
        class="message-content" 
        :style="{ 
          borderLeftColor: message.team === 'home' ? teamColor : 'transparent',
          borderRightColor: message.team === 'away' ? teamColor : 'transparent'
        }"
      >
        {{ message.content }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
  teamColor: {
    type: String,
    required: true,
  },
  teamName: {
    type: String,
    required: true,
  },
})

// Auth Store 접근
const authStore = useAuthStore()

// 현재 사용자의 메시지인지 확인 (익명 사용자 고려)
const isMyMessage = computed(() => {
  // 로그인되지 않은 경우 - 익명 메시지는 모두 다른 사용자로 처리
  if (!authStore.isAuthenticated || !authStore.user) {
    return false
  }
  
  // 로그인된 경우 - 실제 사용자 ID 비교
  // 단, 익명 사용자(userId: 0)와는 구분
  return props.message.userId && props.message.userId === authStore.user.userId
})

const formatTime = timestamp => {
  // 날짜 표기 제거 - 백엔드에서 날짜가 오지 않음
  return ''
}
</script>

<style scoped>
.chat-message {
  margin-bottom: 12px;
  animation: fadeInUp 0.3s ease-out;
  display: flex;
  width: 100%;
}

/* 🏠 홈팀 메시지 - 왼쪽 정렬 */
.chat-message.home-team {
  justify-content: flex-start;
}

.chat-message.home-team .message-header {
  justify-content: flex-start;
}

.chat-message.away-team .message-header {
  justify-content: flex-end;
}

.chat-message.home-team .message-container {
  align-items: flex-start;
  text-align: left;
}

.chat-message.home-team .message-content {
  background: #f8f9fa;
  border-left: 4px solid;
  border-right: none;
  border-radius: 8px 18px 18px 8px;
}

/* ✈️ 원정팀 메시지 - 오른쪽 정렬 */
.chat-message.away-team {
  justify-content: flex-end;
}

.chat-message.away-team .message-container {
  align-items: flex-end;
  text-align: right;
}

.chat-message.away-team .message-content {
  background: #f8f9fa;
  border-right: 4px solid;
  border-left: none;
  border-radius: 18px 8px 8px 18px;
}

/* 👤 내 메시지 - 추가 스타일링 */
.chat-message.my-message .message-content {
  background: #e3f2fd !important;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chat-message.my-message .username {
  font-weight: bold;
  color: #1976d2;
}

/* 메시지 헤더 (팀 배지 + 사용자 정보) */
.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.message-container {
  max-width: 75%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  animation: slideIn 0.3s ease-out;
}

.team-badge {
  display: inline-block;
  color: white;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.user-info {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: #666;
}

.username {
  font-weight: 600;
  color: #333;
}

.message-content {
  padding: 10px 14px;
  word-wrap: break-word;
  line-height: 1.4;
  font-size: 0.95rem;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.message-content:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 애니메이션 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .message-container {
    max-width: 85%;
  }
  
  .message-content {
    font-size: 0.9rem;
    padding: 8px 12px;
  }
  
  .team-badge {
    font-size: 0.7rem;
    padding: 2px 8px;
  }
  
  .user-info {
    font-size: 0.75rem;
  }
}

/* 접근성 개선 */
@media (prefers-reduced-motion: reduce) {
  .chat-message,
  .message-container,
  .message-content {
    animation: none;
    transition: none;
  }
  
  .message-content:hover {
    transform: none;
  }
}


</style>