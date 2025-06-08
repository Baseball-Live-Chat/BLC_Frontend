<template>
  <div class="chat-message-item">
    <div class="chat-user">{{ message.nickname }}</div>
    <div class="chat-text">{{ message.content }}</div>
    <div class="chat-time">{{ formatTime(message.timestamp) }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
})

const formatTime = timestamp => {
  if (!timestamp) return ''

  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}
</script>

<style scoped>
.chat-message-item {
  margin-bottom: 12px;
  padding: 10px;
  background: white;
  border-radius: 8px;
  border-left: 3px solid #2c5aa0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  animation: slideInRight 0.3s ease-out;
}

.chat-user {
  font-weight: bold;
  color: #2c5aa0;
  font-size: 0.9rem;
  margin-bottom: 3px;
}

.chat-text {
  font-size: 0.9rem;
  margin-bottom: 5px;
  line-height: 1.4;
  color: #333;
  word-wrap: break-word;
}

.chat-time {
  font-size: 0.7rem;
  color: #999;
  text-align: right;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .chat-message-item {
    padding: 8px;
    margin-bottom: 10px;
  }

  .chat-text {
    font-size: 0.85rem;
  }
}
</style>
