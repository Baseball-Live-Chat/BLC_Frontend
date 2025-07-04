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
          <span class="stat-value">{{ leftTeamMessages.length }}개</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">오른쪽팀</span>
          <span class="stat-value">{{ rightTeamMessages.length }}개</span>
        </div>
      </div>
    </div>

    <!-- 메인 채팅 영역 (좌우 분할) -->
    <div class="chat-main">
      <!-- 왼쪽 영역 (팀 1-5 메시지 표시) -->
      <div class="chat-side left-side">
        
        <!-- 왼쪽 메시지 영역 -->
        <div ref="leftMessages" class="messages-container left-messages">
          <ChatMessage
            v-for="message in leftTeamMessages"
            :key="`left-${message.id}`"
            :message="message"
            :teamColor="getTeamColorByTeamId(message.teamId)"
            :teamName="getTeamNameByTeamId(message.teamId)"
          />
        </div>
      </div>

      <!-- 오른쪽 영역 (팀 6-10 메시지 표시) -->
      <div class="chat-side right-side">
        
        <!-- 오른쪽 메시지 영역 -->
        <div ref="rightMessages" class="messages-container right-messages">
          <ChatMessage
            v-for="message in rightTeamMessages"
            :key="`right-${message.id}`"
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

const chatStore = useChatStore()
const leftMessages = ref(null)
const rightMessages = ref(null)
const message = ref('')
const selectedTeam = ref(null)

const currentRoomName = computed(() => '전체 야구 팬 채팅방')

// 모든 메시지
const allMessages = computed(() => chatStore.getAllMessages)

// 팀별 메시지 분할
const leftTeamMessages = computed(() => 
  allMessages.value.filter(msg => leftTeams.includes(msg.teamId))
)

const rightTeamMessages = computed(() => 
  allMessages.value.filter(msg => rightTeams.includes(msg.teamId))
)

// 팀 정보 헬퍼 함수들
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

// 새로운 메시지가 추가될 때마다 해당 영역 스크롤을 맨 아래로
watch(
  leftTeamMessages,
  async () => {
    await nextTick()
    if (leftMessages.value) {
      leftMessages.value.scrollTop = leftMessages.value.scrollHeight
    }
  },
  { deep: true }
)

watch(
  rightTeamMessages,
  async () => {
    await nextTick()
    if (rightMessages.value) {
      rightMessages.value.scrollTop = rightMessages.value.scrollHeight
    }
  },
  { deep: true }
)

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
    message.value = '' // 전송 후 입력창 비우기
  } catch (error) {
    console.error('메시지 전송 실패:', error)
  }
}

const useQuickMessage = (quickMsg) => {
  if (message.value.length + quickMsg.length <= 200) {
    message.value = message.value ? `${message.value} ${quickMsg}` : quickMsg
  }
}

onMounted(async () => {
  try {
    console.log('🎮 GeneralChatSection 마운트:', props.roomId)
    await chatStore.connectToGeneralChat(props.roomId)
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

/* 메인 채팅 영역 */
.chat-main {
  flex: 1;
  display: flex;
  background: #f8f9fa;
}

.chat-side {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.side-header {
  padding: 15px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-bottom: 2px solid #dee2e6;
}

.side-header h3 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  color: #495057;
}

.team-badges {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.team-badge-small {
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: bold;
  color: white;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.left-messages {
  background: #e2e2e2;
}

.right-messages {
  background: #e2e2e2;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

/* 10개 팀 수평 배열 */
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

/* 입력 영역 */
.chat-input-section {
  padding: 20px;
  background: white;
  border-top: 2px solid #e9ecef;
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

.teams-container {
  display: flex;
  gap: 30px;
  justify-content: center;
}

.teams-group {
  flex: 1;
  max-width: 300px;
}

.group-title {
  margin: 0 0 10px 0;
  font-size: 0.9rem;
  color: #495057;
  text-align: center;
  font-weight: bold;
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 8px;
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

  .chat-side {
    height: 200px;
  }

  .divider {
    height: 3px;
    width: auto;
  }

  .vs-indicator {
    padding: 4px 8px;
    font-size: 0.7rem;
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