<template>
  <div class="team-chat-section">
    <!-- 채팅방 헤더 -->
    <div class="chat-header">
      <div class="teams-header">
        <div class="team-info">
          <img
            :src="homeTeamInfo.image"
            :alt="homeTeamInfo.name"
            class="team-logo"
          />
          <span>{{ game.homeTeam }}</span>
        </div>
        <span class="vs-text">VS</span>
        <div class="team-info">
          <img
            :src="awayTeamInfo.image"
            :alt="awayTeamInfo.name"
            class="team-logo"
          />
          <span>{{ game.awayTeam }}</span>
        </div>
      </div>
      <div class="connection-info">
        <span v-if="participants > 0">👥 {{ participants }}명 참여 중</span>
        <span class="live-indicator">🔴 LIVE</span>
      </div>
    </div>

    <!-- 팀 선택 -->
    <div class="team-selector">
      <button
        :class="['team-select-btn', { active: selectedTeam === 'home' }]"
        :style="{
          backgroundColor:
            selectedTeam === 'home' ? homeTeamInfo.color : 'transparent',
          borderColor: homeTeamInfo.color,
          color: selectedTeam === 'home' ? 'white' : homeTeamInfo.color,
        }"
        @click="selectTeam('home')"
      >
        <img :src="homeTeamInfo.image" class="btn-logo" />
        {{ game.homeTeam }} 응원
      </button>

      <button
        :class="['team-select-btn', { active: selectedTeam === 'away' }]"
        :style="{
          backgroundColor:
            selectedTeam === 'away' ? awayTeamInfo.color : 'transparent',
          borderColor: awayTeamInfo.color,
          color: selectedTeam === 'away' ? 'white' : awayTeamInfo.color,
        }"
        @click="selectTeam('away')"
      >
        <img :src="awayTeamInfo.image" class="btn-logo" />
        {{ game.awayTeam }} 응원
      </button>
    </div>

    <!-- 통합 채팅 메시지 영역 -->
    <div ref="chatMessages" class="chat-messages-container">
      <div v-if="allMessages.length === 0" class="empty-chat">
        💬 채팅을 시작해보세요!
      </div>

      <div
        v-for="message in allMessages"
        :key="message.id"
        :class="[
          'message-wrapper',
          {
            'my-message': message.userId === currentUserId,
            'home-team': message.team === 'home',
            'away-team': message.team === 'away',
          },
        ]"
      >
        <div class="message-bubble">
          <div class="message-header">
            <img
              :src="getTeamLogo(message.team)"
              class="message-team-logo"
              :alt="`${message.team} 팀`"
            />
            <span class="nickname">{{ message.nickname }}</span>
            <span class="timestamp">{{ formatTime(message.createdAt) }}</span>
          </div>
          <div
            class="message-content"
            :style="{ backgroundColor: getMessageColor(message.team) }"
          >
            {{ message.content }}
          </div>
        </div>
      </div>
    </div>

    <!-- 채팅 입력 영역 -->
    <div class="chat-input-section">
      <div v-if="!selectedTeam" class="team-select-prompt">
        응원할 팀을 선택해주세요 ⬆️
      </div>

      <div v-else class="input-container">
        <div
          class="selected-team-badge"
          :style="{ backgroundColor: getSelectedTeamColor() }"
        >
          <img :src="getSelectedTeamLogo()" class="badge-logo" />
          {{ getSelectedTeamName() }} 응원 중
        </div>

        <div class="input-wrapper">
          <input
            v-model="inputMessage"
            type="text"
            class="message-input"
            :placeholder="`${getSelectedTeamName()} 팬들과 이야기해보세요...`"
            maxlength="200"
            @keyup.enter="sendMessage"
            @input="handleInput"
          />
          <button
            class="send-button"
            :style="{ backgroundColor: getSelectedTeamColor() }"
            :disabled="!canSend"
            @click="sendMessage"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>

        <div class="input-info">
          <span class="char-count">{{ inputMessage.length }}/200</span>
          <div class="quick-messages">
            <button
              v-for="quick in quickMessages"
              :key="quick"
              class="quick-btn"
              @click="useQuickMessage(quick)"
            >
              {{ quick }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, nextTick, watch } from 'vue'
import { useChatStore } from '../../stores/chat'
import { getTeamInfo } from '../../utils/teamUtils'

const props = defineProps({
  gameId: {
    type: [String, Number],
    required: true,
  },
  game: {
    type: Object,
    required: true,
  },
})

const chatStore = useChatStore()
const chatMessages = ref(null)
const inputMessage = ref('')

// 임시 현재 사용자 ID (로그인 시스템 연동 시 변경)
const currentUserId = 1

// Computed properties
const allMessages = computed(() => chatStore.getAllMessages)
const selectedTeam = computed(() => chatStore.getSelectedTeam)
const participants = computed(() => chatStore.getParticipants)

const homeTeamInfo = computed(() => getTeamInfo(props.game.homeTeam))
const awayTeamInfo = computed(() => getTeamInfo(props.game.awayTeam))

const canSend = computed(() => {
  return inputMessage.value.trim().length > 0 && selectedTeam.value
})

const quickMessages = computed(() => {
  const common = ['화이팅!', '좋아!', '멋져!', '대박!', '🔥']
  return common
})

// Methods
const selectTeam = team => {
  chatStore.setSelectedTeam(team)
}

const sendMessage = () => {
  if (!canSend.value) return

  const success = chatStore.sendMessage(inputMessage.value.trim())
  if (success) {
    inputMessage.value = ''
  }
}

const handleInput = () => {
  // 입력 제한 등 추가 로직
}

const useQuickMessage = quick => {
  if (inputMessage.value.length + quick.length <= 200) {
    inputMessage.value = inputMessage.value
      ? `${inputMessage.value} ${quick}`
      : quick
  }
}

const formatTime = date => {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

const getTeamLogo = team => {
  return team === 'home' ? homeTeamInfo.value.image : awayTeamInfo.value.image
}

const getMessageColor = team => {
  const teamInfo = team === 'home' ? homeTeamInfo.value : awayTeamInfo.value
  return teamInfo.bgColor || '#f8f9fa'
}

const getSelectedTeamColor = () => {
  if (!selectedTeam.value) return '#ccc'
  return selectedTeam.value === 'home'
    ? homeTeamInfo.value.color
    : awayTeamInfo.value.color
}

const getSelectedTeamLogo = () => {
  if (!selectedTeam.value) return ''
  return selectedTeam.value === 'home'
    ? homeTeamInfo.value.image
    : awayTeamInfo.value.image
}

const getSelectedTeamName = () => {
  if (!selectedTeam.value) return ''
  return selectedTeam.value === 'home'
    ? props.game.homeTeam
    : props.game.awayTeam
}

// 새 메시지 시 스크롤 맨 아래로
watch(
  allMessages,
  async () => {
    await nextTick()
    if (chatMessages.value) {
      chatMessages.value.scrollTop = chatMessages.value.scrollHeight
    }
  },
  { deep: true }
)

// Lifecycle
onMounted(() => {
  chatStore.connectToGame(props.gameId, props.game)
})

onUnmounted(() => {
  chatStore.disconnect()
})
</script>

<style scoped>
.team-chat-section {
  display: flex;
  flex-direction: column;
  height: 600px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 헤더 영역 */
.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  text-align: center;
}

.teams-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 10px;
}

.team-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  font-size: 1.1rem;
}

.team-logo {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
}

.vs-text {
  font-size: 1.2rem;
  font-weight: bold;
  opacity: 0.9;
}

.connection-info {
  display: flex;
  justify-content: center;
  gap: 15px;
  font-size: 0.9rem;
  opacity: 0.9;
}

.live-indicator {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* 팀 선택 영역 */
.team-selector {
  display: flex;
  padding: 15px;
  gap: 10px;
  background: #f8f9fa;
}

.team-select-btn {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid;
  border-radius: 25px;
  background: transparent;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.team-select-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-logo {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
}

/* 메시지 영역 */
.chat-messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #fafbfc;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.empty-chat {
  text-align: center;
  color: #666;
  font-style: italic;
  margin-top: 100px;
  font-size: 1.1rem;
}

.message-wrapper {
  display: flex;
  max-width: 80%;
}

.message-wrapper.home-team {
  align-self: flex-start;
}

.message-wrapper.away-team {
  align-self: flex-end;
}

.message-bubble {
  width: 100%;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 0.85rem;
}

.message-team-logo {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  object-fit: cover;
}

.nickname {
  font-weight: 600;
  color: #333;
}

.timestamp {
  color: #888;
  margin-left: auto;
}

.message-content {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 1rem;
  line-height: 1.4;
  word-wrap: break-word;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.away-team .message-content {
  border-radius: 18px 18px 4px 18px;
}

.home-team .message-content {
  border-radius: 18px 18px 18px 4px;
}

/* 입력 영역 */
.chat-input-section {
  border-top: 1px solid #e9ecef;
  background: white;
  padding: 15px;
}

.team-select-prompt {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 20px;
}

.selected-team-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 15px;
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.badge-logo {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  object-fit: cover;
}

.input-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
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
  border-color: #4285f4;
}

.send-button {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.send-button:disabled {
  background: #ccc !important;
  cursor: not-allowed;
}

.send-button:not(:disabled):hover {
  transform: scale(1.1);
}

.input-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  font-size: 0.8rem;
}

.char-count {
  color: #666;
}

.quick-messages {
  display: flex;
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
  background: #f0f0f0;
  border-color: #999;
}

/* 스크롤바 스타일링 */
.chat-messages-container::-webkit-scrollbar {
  width: 6px;
}

.chat-messages-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chat-messages-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chat-messages-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 반응형 */
@media (max-width: 768px) {
  .team-chat-section {
    height: 500px;
  }

  .teams-header {
    gap: 15px;
  }

  .team-info {
    font-size: 1rem;
  }

  .team-selector {
    flex-direction: column;
  }

  .message-wrapper {
    max-width: 85%;
  }

  .input-info {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}
</style>
