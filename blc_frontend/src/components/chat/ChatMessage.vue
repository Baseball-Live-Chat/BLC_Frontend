<template>
  <div class="chat-message" :class="{ 'my-message': isMyMessage }">
    <div class="message-container">
      <!-- 팀 배지 -->
      <div class="team-badge" :style="{ backgroundColor: teamColor }">
        {{ teamName }}
      </div>

      <!-- 사용자 정보 -->
      <div class="user-info">
        <span class="username">{{ message.nickname || '익명' }}</span>
        <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
      </div>

      <!-- 메시지 내용 -->
      <div class="message-content" :style="{ borderLeftColor: teamColor }">
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
  if (!timestamp) return ''

  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now - date) / (1000 * 60 * 60)

  if (diffInHours < 24) {
    // 24시간 이내면 시간만 표시
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } else {
    // 24시간 이후면 날짜와 시간 표시
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
}
</script>

<style scoped>
.chat-message {
  margin-bottom: 12px;
  animation: fadeInUp 0.3s ease-out;
}

.chat-message.my-message .message-container {
  margin-left: auto;
  max-width: 80%;
}

.chat-message.my-message .team-badge {
  margin-left: auto;
}

.chat-message.my-message .user-info {
  text-align: right;
}

.chat-message.my-message .message-content {
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
}

.message-container {
  max-width: 85%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.team-badge {
  display: inline-block;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: bold;
  text-align: center;
  width: fit-content;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

.username {
  font-weight: 600;
  color: #333;
  font-size: 0.85rem;
}

.timestamp {
  font-size: 0.75rem;
  color: #888;
}

.message-content {
  background: #ffffff;
  padding: 10px 14px;
  border-radius: 12px;
  border-left: 4px solid;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-size: 0.95rem;
  line-height: 1.4;
  color: #333;
  word-wrap: break-word;
  max-width: 100%;
}

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

/* 모바일 반응형 */
@media (max-width: 768px) {
  .message-container {
    max-width: 95%;
  }

  .chat-message.my-message .message-container {
    max-width: 90%;
  }

  .team-badge {
    font-size: 0.65rem;
    padding: 1px 6px;
    max-width: 70px;
  }

  .username {
    font-size: 0.8rem;
  }

  .timestamp {
    font-size: 0.7rem;
  }

  .message-content {
    padding: 8px 12px;
    font-size: 0.9rem;
    border-radius: 10px;
  }
}
</style>