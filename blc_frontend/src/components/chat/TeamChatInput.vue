<template>
  <div class="team-chat-input">
    <div v-if="!selectedTeam" class="team-select-prompt">
      <p>응원할 팀을 선택하고 채팅해주세요! 👆</p>
    </div>

    <div v-else class="input-container">
      <div
        class="selected-team-indicator"
        :style="{ backgroundColor: teamColor, color: 'white' }"
      >
        {{ selectedTeam === 'home' ? homeTeam : awayTeam }} 응원
      </div>

      <div class="input-wrapper">
        <input
          v-model="message"
          type="text"
          placeholder="응원 메시지를 입력하세요..."
          class="message-input"
          maxlength="200"
          @keyup.enter="sendMessage"
          @input="handleInput"
        />
        <button
          class="send-button"
          :disabled="!message.trim()"
          :style="{ backgroundColor: teamColor }"
          @click="sendMessage"
        >
          전송
        </button>
      </div>

      <div class="message-info">
        <span class="char-count">{{ message.length }}/200</span>
        <span class="quick-messages">
          빠른 응원:
          <button
            v-for="quick in quickMessages"
            :key="quick"
            class="quick-btn"
            @click="useQuickMessage(quick)"
          >
            {{ quick }}
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  selectedTeam: {
    type: String,
    default: null,
  },
  homeTeam: {
    type: String,
    required: true,
  },
  awayTeam: {
    type: String,
    required: true,
  },
  homeColor: {
    type: String,
    required: true,
  },
  awayColor: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['send-message'])

const message = ref('')

const teamColor = computed(() => {
  return props.selectedTeam === 'home' ? props.homeColor : props.awayColor
})

const quickMessages = computed(() => {
  if (props.selectedTeam === 'home') {
    return ['화이팅!', '홈런!', '수비 좋아!', '좋은 경기!', '응원합니다!']
  } else {
    return ['화이팅!', '역전하자!', '끝까지!', '좋은 플레이!', '응원합니다!']
  }
})

const sendMessage = () => {
  if (!message.value.trim() || !props.selectedTeam) return

  emit('send-message', message.value.trim())
  message.value = ''
}

const useQuickMessage = quickMsg => {
  if (message.value.length + quickMsg.length <= 200) {
    message.value = message.value ? `${message.value} ${quickMsg}` : quickMsg
  }
}

const handleInput = () => {
  // 입력 제한 처리 등 추가 로직
}
</script>

<style scoped>
.team-chat-input {
  padding: 20px;
  border-top: 1px solid #e9ecef;
  background: white;
}

.team-select-prompt {
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
}

.team-select-prompt p {
  margin: 0;
  font-size: 1.1rem;
}

.selected-team-indicator {
  text-align: center;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 15px;
  display: inline-block;
}

.input-wrapper {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 25px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease;
}

.message-input:focus {
  border-color: #2c5aa0;
}

.send-button {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 80px;
}

.send-button:disabled {
  background: #ccc !important;
  cursor: not-allowed;
}

.send-button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.message-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #666;
}

.char-count {
  font-weight: 500;
}

.quick-messages {
  display: flex;
  align-items: center;
  gap: 5px;
}

.quick-btn {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 12px;
  background: white;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-btn:hover {
  background: #f8f9fa;
  border-color: #aaa;
}

@media (max-width: 768px) {
  .message-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .quick-messages {
    flex-wrap: wrap;
  }
}
</style>
