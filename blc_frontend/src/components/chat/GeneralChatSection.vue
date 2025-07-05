<!-- src/components/chat/GeneralChatSection.vue -->
<template>
  <div class="general-chat-section">
    <!-- 헤더 -->
    <div class="chat-header">
      <div class="header-info">
        <h2>⚾ {{ currentRoomName }}</h2>
        <p>모든 KBO 팀을 응원할 수 있는 공간</p>
      </div>
      <div class="stats-info">
        <div class="stat-item">
          <span class="stat-label">총 메시지</span>
          <span class="stat-value">{{ allMessages.length }}개</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">왼쪽팀</span>
          <span class="stat-value">{{ leftTeamCount }}개</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">오른쪽팀</span>
          <span class="stat-value">{{ rightTeamCount }}개</span>
        </div>
      </div>
    </div>

    <!-- 통합 채팅 영역 -->
    <div class="chat-main">
      <div ref="chatMessages" class="unified-messages-container">
        <div v-if="allMessages.length === 0" class="empty-messages">
          첫 번째 메시지를 기다리고 있습니다...
        </div>
        
        <!-- 모든 메시지를 시간순으로 표시하되, 팀에 따라 좌우 정렬 -->
        <div
          v-for="message in sortedAllMessages"
          :key="`unified-${message.id}`"
          :class="[
            'message-wrapper',
            isLeftTeam(message.teamId) ? 'left-team-message' : 'right-team-message'
          ]"
        >
          <ChatMessage
            :message="message"
            :teamColor="getTeamColorByTeamId(message.teamId)"
            :teamName="getTeamNameByTeamId(message.teamId)"
          />
        </div>
      </div>
    </div>

    <!-- 하단 입력 영역 -->
    <div class="chat-input-section">
      <!-- 팀 선택 -->
      <div class="team-selection">
        <h4 class="selection-title">응원할 팀을 선택하세요</h4>
        
        <!-- 10개 팀 수평 배열 -->
        <div class="teams-horizontal">
          <button
            v-for="(team, teamId) in KBO_TEAMS"
            :key="teamId"
            :class="['team-btn', { active: selectedTeam === parseInt(teamId) }]"
            :style="{
              backgroundColor: selectedTeam === parseInt(teamId) ? team.color : 'transparent',
              borderColor: team.color,
              color: selectedTeam === parseInt(teamId) ? 'white' : team.color
            }"
            @click="selectTeam(parseInt(teamId))"
          >
            <img :src="getTeamImageByCode(team.code)" class="team-logo" />
            <span class="team-name">{{ team.code }}</span>
          </button>
        </div>
      </div>

      <!-- 메시지 입력 -->
      <div class="input-container">
        <div v-if="!selectedTeam" class="team-select-prompt">
          <p>🎯 위에서 응원할 팀을 선택하고 채팅에 참여하세요!</p>
        </div>

        <div v-else class="input-wrapper">
          <div
            class="selected-team-indicator"
            :style="{
              backgroundColor: getSelectedTeamColor(),
              color: 'white',
            }"
          >
            {{ getSelectedTeamName() }} 응원단
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
              :style="{ backgroundColor: getSelectedTeamColor() }"
              @click="sendMessage"
            >
              전송
            </button>
          </div>

          <!-- 빠른 응원 메시지 -->
          <div class="quick-messages">
            <span class="quick-label">빠른 응원:</span>
            <button
              v-for="quick in quickMessages"
              :key="quick"
              class="quick-btn"
              :style="{
                borderColor: getSelectedTeamColor(),
                color: getSelectedTeamColor(),
              }"
              @click="useQuickMessage(quick)"
            >
              {{ quick }}
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
import { getTeamImageByCode } from '@/utils/teamImageByCode'
import ChatMessage from './ChatMessage.vue'

// KBO 10개 팀 정보
const KBO_TEAMS = {
  1: { name: '키움 히어로즈', code: '키움', color: '#570514' },
  2: { name: '두산 베어스', code: '두산', color: '#131230' },
  3: { name: '롯데 자이언츠', code: '롯데', color: '#041E42' },
  4: { name: 'SSG 랜더스', code: 'SSG', color: '#CE0E2D' },
  5: { name: 'KT 위즈', code: 'KT', color: '#000000' },
  6: { name: '삼성 라이온즈', code: '삼성', color: '#074CA1' },
  7: { name: 'KIA 타이거즈', code: '기아', color: '#EA0029' },
  8: { name: 'NC 다이노스', code: 'NC', color: '#315288' },
  9: { name: 'LG 트윈스', code: 'LG', color: '#C4184C' },
  10: { name: '한화 이글스', code: '한화', color: '#FF6600' }
}

// 팀 분할: 1-5 (왼쪽), 6-10 (오른쪽)
const leftTeams = [1, 2, 3, 4, 5]
const rightTeams = [6, 7, 8, 9, 10]

const quickMessages = ['👏 좋아요!', '🔥 화이팅!', '⚾ 홈런!', '🎯 스트라이크!', '😍 멋져요!']

const props = defineProps({
  roomId: {
    type: [String, Number],
    required: true,
  },
})

// 반응형 변수들
const chatStore = useChatStore()
const chatMessages = ref(null)
const message = ref('')
const selectedTeam = ref(null)

// Computed 속성들
const currentRoomName = computed(() => '전체 야구 팬 채팅방')

const allMessages = computed(() => chatStore.getAllMessages)

const sortedAllMessages = computed(() => {
  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
  return allMessages.value.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
})

const leftTeamCount = computed(() => {
  return allMessages.value.filter(msg => leftTeams.includes(msg.teamId)).length
})

const rightTeamCount = computed(() => {
  return allMessages.value.filter(msg => rightTeams.includes(msg.teamId)).length
})

// 헬퍼 함수들
const getTeamInfoByTeamId = (teamId) => {
  return KBO_TEAMS[teamId] || { name: '알 수 없음', code: '?', color: '#666666' }
}

const getTeamColorByTeamId = (teamId) => {
  return getTeamInfoByTeamId(teamId).color
}

const getTeamNameByTeamId = (teamId) => {
  return getTeamInfoByTeamId(teamId).code
}

const getSelectedTeamColor = () => {
  return getTeamInfoByTeamId(selectedTeam.value).color
}

const getSelectedTeamName = () => {
  return getTeamInfoByTeamId(selectedTeam.value).code
}

const isLeftTeam = (teamId) => {
  return leftTeams.includes(teamId)
}

const autoScrollToBottom = (element) => {
  if (element) {
    element.scrollTop = element.scrollHeight
  }
}

// 이벤트 핸들러들
const selectTeam = (teamId) => {
  selectedTeam.value = teamId
  chatStore.setSelectedTeam(teamId)
  console.log('팀 선택됨:', teamId, getTeamInfoByTeamId(teamId).name)
}

const handleInput = (event) => {
  const value = event.target.value
  if (value.length > 200) {
    message.value = value.slice(0, 200)
  }
}

const sendMessage = async () => {
  if (!message.value.trim() || !selectedTeam.value) return

  try {
    console.log('메시지 전송 시도:', {
      content: message.value.trim(),
      teamId: selectedTeam.value,
      isGeneral: true
    })
    
    await chatStore.sendMessage(message.value.trim(), selectedTeam.value)
    message.value = ''
  } catch (error) {
    console.error('메시지 전송 실패:', error)
  }
}

const useQuickMessage = (quickMsg) => {
  if (message.value.length + quickMsg.length <= 200) {
    message.value = message.value ? `${message.value} ${quickMsg}` : quickMsg
  }
}

// 워처
watch(
  allMessages,
  async (newMessages, oldMessages) => {
    console.log('전체 메시지 변경:', newMessages.length, '개')
    if (newMessages.length > (oldMessages?.length || 0)) {
      await nextTick()
      autoScrollToBottom(chatMessages.value)
    }
  },
  { deep: true, immediate: false }
)

// 라이프사이클
onMounted(async () => {
  try {
    console.log('🎮 GeneralChatSection 마운트:', props.roomId)
    await chatStore.connectToGeneralChat(props.roomId)
    
    await nextTick()
    autoScrollToBottom(chatMessages.value)
  } catch (error) {
    console.error('고정 채팅방 연결 실패:', error)
  }
})

onUnmounted(() => {
  chatStore.disconnect()
})
</script>

<style scoped>
.general-chat-section {
  display: flex;
  flex-direction: column;
  height: 900px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 헤더 */
.chat-header {
  background: linear-gradient(135deg, #2c5aa0, #1e3a5f);
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.header-info h2 {
  margin: 0 0 4px 0;
  font-size: 1.4rem;
}

.header-info p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.stats-info {
  display: flex;
  gap: 20px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  opacity: 0.8;
  margin-bottom: 2px;
}

.stat-value {
  display: block;
  font-size: 1rem;
  font-weight: bold;
}

/* 통합 채팅 영역 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  min-height: 0;
}

.unified-messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.message-wrapper {
  width: 100%;
  display: flex;
}

.left-team-message {
  justify-content: flex-start;
}

.right-team-message {
  justify-content: flex-end;
}

.message-wrapper :deep(.chat-message) {
  max-width: 70%;
}

.empty-messages {
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 40px 20px;
  font-size: 1.1rem;
}

.unified-messages-container::-webkit-scrollbar {
  width: 8px;
}

.unified-messages-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.unified-messages-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.unified-messages-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 입력 영역 */
.chat-input-section {
  padding: 20px;
  background: white;
  border-top: 2px solid #e9ecef;
  flex-shrink: 0;
}

.team-selection {
  margin-bottom: 20px;
}

.selection-title {
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  color: #2c5aa0;
  text-align: center;
}

.teams-horizontal {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
  max-width: 800px;
  margin: 0 auto;
}

.team-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 6px;
  border: 2px solid;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: bold;
  transition: all 0.2s ease;
  min-height: 60px;
  min-width: 70px;
}

.team-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.team-btn.active {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.team-logo {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.team-name {
  font-size: 0.7rem;
  text-align: center;
}

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

.quick-messages {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.quick-label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

.quick-btn {
  padding: 4px 12px;
  border: 1px solid;
  border-radius: 15px;
  background: transparent;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.quick-btn:hover {
  background-color: rgba(44, 90, 160, 0.1);
  transform: translateY(-1px);
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
  .general-chat-section {
    height: 800px;
  }

  .chat-header {
    padding: 15px;
    flex-direction: column;
    gap: 10px;
  }

  .stats-info {
    gap: 15px;
  }

  .chat-main {
    flex-direction: column;
  }

  .unified-messages-container {
    padding: 15px;
  }

  .message-wrapper :deep(.chat-message) {
    max-width: 85%;
  }

  .teams-horizontal {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 6px;
  }

  .team-btn {
    min-height: 50px;
    min-width: auto;
    padding: 6px 4px;
  }

  .team-logo {
    width: 16px;
    height: 16px;
  }

  .team-name {
    font-size: 0.65rem;
  }
}
</style>