<template>
  <div class="chat-section">
    <h3 class="chat-title">💬 실시간 채팅</h3>
    
    <div class="chat-messages" ref="chatMessages">
      <ChatMessage
        v-for="message in messages"
        :key="message.id"
        :message="message"
      />
    </div>
    
    <ChatInput @send-message="handleSendMessage" />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, nextTick, watch } from 'vue'
import { useChatStore } from '../../stores/chat'
import ChatMessage from './ChatMessage.vue'
import ChatInput from './ChatInput.vue'

const props = defineProps({
  gameId: {
    type: [String, Number],
    required: true
  }
})

const chatStore = useChatStore()
const chatMessages = ref(null)

const messages = computed(() => chatStore.getMessages)
const participants = computed(() => chatStore.getParticipants)

// 새로운 메시지가 추가될 때마다 스크롤을 맨 아래로
watch(messages, async () => {
  await nextTick()
  if (chatMessages.value) {
    chatMessages.value.scrollTop = chatMessages.value.scrollHeight
  }
}, { deep: true })

const handleSendMessage = (content) => {
  chatStore.sendMessage(content)
}

onMounted(() => {
  chatStore.connectToGame(props.gameId)
})

onUnmounted(() => {
  chatStore.disconnect()
})
</script>

<style scoped>
.chat-section {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-title {
  font-size: 1.3rem;
  margin-bottom: 15px;
  color: #2c5aa0;
  border-bottom: 2px solid #2c5aa0;
  padding-bottom: 10px;
}

.chat-messages {
  height: 350px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 15px;
  flex: 1;
  background: #fafafa;
}

/* 스크롤바 스타일링 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

@media (max-width: 768px) {
  .chat-messages {
    height: 250px;
  }
}
</style>