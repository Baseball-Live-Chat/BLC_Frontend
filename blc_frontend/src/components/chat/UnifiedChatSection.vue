<template>
  <!-- 베팅 섹션 (기존 TeamFirepowerIndicator 교체) -->
  <BettingSection
    :gameId="gameId"
    :game="game"
    :homeTeamInfo="homeTeamInfo"
    :awayTeamInfo="awayTeamInfo"
  />
  
  <div class="unified-chat-section">
    <!-- 채팅방 헤더 -->
    <div class="chat-header">
      <div class="match-info">
        <img
          :src="homeTeamInfo.image"
          :alt="homeTeamInfo.name"
          class="team-logo"
        />
        <span class="vs-text">{{ game.homeTeam }} vs {{ game.awayTeam }}</span>
        <img
          :src="awayTeamInfo.image"
          :alt="awayTeamInfo.name"
          class="team-logo"
        />
      </div>
      <div class="online-count">
        <span
          >💬 총 {{ sortedAllMessages.length }}개 메시지 (홈{{
            homeMessages.length
          }}
          / 원정{{ awayMessages.length }})</span
        >
      </div>
    </div>

    <!-- 통합 채팅 메시지 영역 -->
    <div ref="chatMessages" class="chat-messages-container">
      <!-- 시간순으로 정렬된 모든 메시지 표시 -->
      <template
        v-for="message in sortedAllMessages"
        :key="`msg-${message.team}-${message.id}`"
      >
        <ChatMessage
          :message="message"
          :teamColor="
            message.team === 'home' ? homeTeamInfo.color : awayTeamInfo.color
          "
          :teamName="message.team === 'home' ? game.homeTeam : game.awayTeam"
        />
      </template>
    </div>

    <!-- 팀 선택 및 채팅 입력 -->
    <div class="chat-input-section">
      <!-- 팀 선택 버튼 -->
      <div class="team-selection">
        <button
          :class="['team-btn', { active: selectedTeam === 'home' }]"
          :style="{
            backgroundColor:
              selectedTeam === 'home' ? homeTeamInfo.color : 'transparent',
            color: selectedTeam === 'home' ? 'white' : homeTeamInfo.color,
            borderColor: homeTeamInfo.color,
          }"
          @click="selectTeam('home')"
        >
          <img
            :src="homeTeamInfo.image"
            :alt="game.homeTeam"
            class="team-btn-logo"
          />
          {{ game.homeTeam }}
        </button>

        <button
          :class="['team-btn', { active: selectedTeam === 'away' }]"
          :style="{
            backgroundColor:
              selectedTeam === 'away' ? awayTeamInfo.color : 'transparent',
            color: selectedTeam === 'away' ? 'white' : awayTeamInfo.color,
            borderColor: awayTeamInfo.color,
          }"
          @click="selectTeam('away')"
        >
          <img
            :src="awayTeamInfo.image"
            :alt="game.awayTeam"
            class="team-btn-logo"
          />
          {{ game.awayTeam }}
        </button>
      </div>

      <!-- 채팅 입력 -->
      <div class="input-container">
        <div v-if="!selectedTeam" class="team-select-prompt">
          <p>🔝 응원할 팀을 선택하고 채팅에 참여하세요!</p>
        </div>

        <div v-else class="input-wrapper">
          <div
            class="selected-team-indicator"
            :style="{
              backgroundColor:
                selectedTeam === 'home'
                  ? homeTeamInfo.color
                  : awayTeamInfo.color,
              color: 'white',
            }"
          >
            {{ selectedTeam === 'home' ? game.homeTeam : game.awayTeam }}
            응원단
          </div>

          <div class="message-input-area">
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
              :style="{
                backgroundColor:
                  selectedTeam === 'home'
                    ? homeTeamInfo.color
                    : awayTeamInfo.color,
              }"
              @click="sendMessage"
            >
              전송
            </button>
          </div>
          <div class="input-info">
            <span class="char-count">{{ message.length }}/200</span>
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
import ChatMessage from './ChatMessage.vue'
import BettingSection from '../betting/BettingSection.vue' // 베팅 컴포넌트 import

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
const message = ref('')
const selectedTeam = ref(null)

const homeMessages = computed(() => chatStore.getHomeMessages)
const awayMessages = computed(() => chatStore.getAwayMessages)
const sortedAllMessages = computed(() => chatStore.getAllMessages)

const homeTeamInfo = computed(() => getTeamInfo(props.game.homeTeam))
const awayTeamInfo = computed(() => getTeamInfo(props.game.awayTeam))

// 새로운 메시지가 추가될 때마다 스크롤을 맨 아래로
watch(
  sortedAllMessages,
  async () => {
    console.log('sortedAllMessages 변경됨, 스크롤 이동')
    await nextTick()
    if (chatMessages.value) {
      chatMessages.value.scrollTop = chatMessages.value.scrollHeight
    }
  },
  { deep: true }
)

const selectTeam = team => {
  selectedTeam.value = team
  chatStore.setSelectedTeam(team)
  console.log('팀 선택됨:', team)
}

const handleInput = event => {
  const value = event.target.value
  if (value.length > 200) {
    message.value = value.slice(0, 200)
  }
}

const sendMessage = async () => {
  if (!message.value.trim() || !selectedTeam.value) return

  try {
    await chatStore.sendMessage(message.value.trim(), selectedTeam.value)
    message.value = '' // 전송 후 입력창 비우기
  } catch (error) {
    console.error('메시지 전송 실패:', error)
  }
}

onMounted(async () => {
  try {
    await chatStore.connectToGame(props.gameId, props.game)
  } catch (error) {
    console.error('채팅방 연결 실패:', error)
  }
})

onUnmounted(() => {
  chatStore.disconnect()
})
</script>

<style scoped>
.unified-chat-section {
  display: flex;
  flex-direction: column;
  height: 900px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 채팅방 헤더 */
.chat-header {
  background: linear-gradient(135deg, #2c5aa0, #1e3a5f);
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.match-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: bold;
  font-size: 1.1rem;
}

.team-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
  background: white;
  border-radius: 50%;
  padding: 2px;
}

.vs-text {
  color: white;
  font-size: 1rem;
}

.online-count {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* 채팅 메시지 영역 */
.chat-messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

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

/* 채팅 입력 섹션 */
.chat-input-section {
  padding: 20px;
  background: white;
  border-top: 1px solid #e9ecef;
}

/* 팀 선택 버튼 */
.team-selection {
  display: flex;
  gap: 12px;
  margin-bottom: 15px;
  justify-content: center;
}

.team-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 2px solid;
  border-radius: 25px;
  background: transparent;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: all 0.3s ease;
  min-width: 120px;
  justify-content: center;
}

.team-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.team-btn.active {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.team-btn-logo {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

/* 입력 컨테이너 */
.input-container {
  margin-top: 15px;
}

.team-select-prompt {
  text-align: center;
  padding: 20px;
  color: #6c757d;
  font-size: 1rem;
}

.team-select-prompt p {
  margin: 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #2c5aa0;
}

.selected-team-indicator {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.message-input-area {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
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
  box-shadow: 0 0 0 3px rgba(44, 90, 160, 0.1);
}

.send-button {
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: all 0.3s ease;
  min-width: 80px;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.send-button:disabled {
  background: #6c757d !important;
  cursor: not-allowed;
  opacity: 0.6;
}

.input-info {
  display: flex;
  justify-content: flex-end;
}

.char-count {
  font-size: 0.8rem;
  color: #6c757d;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .unified-chat-section {
    height: 800px;
  }

  .chat-header {
    padding: 12px 15px;
  }

  .match-info {
    font-size: 1rem;
    gap: 8px;
  }

  .team-logo {
    width: 28px;
    height: 28px;
  }

  .chat-messages-container {
    padding: 15px;
    gap: 10px;
  }

  .chat-input-section {
    padding: 15px;
  }

  .team-selection {
    gap: 8px;
  }

  .team-btn {
    padding: 8px 16px;
    font-size: 0.9rem;
    min-width: 100px;
  }

  .message-input {
    font-size: 0.9rem;
    padding: 10px 14px;
  }

  .send-button {
    font-size: 0.9rem;
    padding: 10px 20px;
    min-width: 70px;
  }
}
</style>