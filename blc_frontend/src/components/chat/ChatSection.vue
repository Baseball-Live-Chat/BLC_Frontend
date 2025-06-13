<template>
  <div class="chat-message" :class="{ 'my-message': isMyMessage }">
    <div class="message-header">
      <span class="nickname" :style="{ color: teamColor }">{{
        message.nickname
      }}</span>
      <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
    </div>
    <div class="message-content" :style="{ borderLeftColor: teamColor }">
      {{ message.content }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
  teamColor: {
    type: String,
    default: '#666666',
  },
})

const isMyMessage = computed(() => {
  return props.message.nickname === '👤나'
})

const formatTime = timestamp => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}
</script>

<style scoped>
.chat-message {
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  background: white;
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.chat-message:hover {
  background: #f8f9fa;
  transform: translateY(-1px);
}

.chat-message.my-message {
  background: #e3f2fd;
  border-color: #bbdefb;
}

.chat-message.my-message:hover {
  background: #e1f5fe;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.nickname {
  font-weight: bold;
  font-size: 0.85rem;
}

.timestamp {
  font-size: 0.75rem;
  color: #999;
}

.message-content {
  font-size: 0.9rem;
  line-height: 1.4;
  color: #333;
  padding-left: 8px;
  border-left: 3px solid #ddd;
  word-wrap: break-word;
}

.my-message .message-content {
  font-weight: 500;
}

@media (max-width: 768px) {
  .chat-message {
    padding: 6px 10px;
    margin-bottom: 8px;
  }

  .nickname {
    font-size: 0.8rem;
  }

  .message-content {
    font-size: 0.85rem;
  }
}
</style>
