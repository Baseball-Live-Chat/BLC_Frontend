<template>
  <div class="chat-input-area">
    <input
      v-model="message"
      type="text"
      class="chat-input"
      placeholder="채팅을 입력하세요..."
      @keypress.enter="sendMessage"
      @input="handleInput"
      maxlength="200"
    />
    <button 
      class="chat-send" 
      @click="sendMessage"
      :disabled="!canSend"
    >
      전송
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['send-message'])

const message = ref('')

const canSend = computed(() => {
  return message.value.trim().length > 0
})

const handleInput = (event) => {
  // 특수문자나 이모지도 허용하되, 너무 긴 메시지는 제한
  const value = event.target.value
  if (value.length > 200) {
    message.value = value.slice(0, 200)
  }
}

const sendMessage = () => {
  if (!canSend.value) return
  
  const content = message.value.trim()
  if (content) {
    emit('send-message', content)
    message.value = ''
  }
}
</script>

<style scoped>
.chat-input-area {
  display: flex;
  gap: 10px;
  align-items: center;
}

.chat-input {
  flex: 1;
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 25px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease;
}

.chat-input:focus {
  border-color: #2c5aa0;
  box-shadow: 0 0 0 3px rgba(44, 90, 160, 0.1);
}

.chat-send {
  background: #2c5aa0;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: all 0.3s ease;
  min-width: 80px;
}

.chat-send:hover:not(:disabled) {
  background: #1e3a5f;
  transform: translateY(-1px);
}

.chat-send:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

@media (max-width: 768px) {
  .chat-input {
    font-size: 0.9rem;
    padding: 10px 12px;
  }
  
  .chat-send {
    font-size: 0.9rem;
    padding: 10px 16px;
    min-width: 70px;
  }
}
</style>