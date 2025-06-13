<template>
  <div class="team-chat-section">
    <h3 class="chat-title">💬 팀별 실시간 채팅</h3>

    <!-- 팀 선택 버튼 -->
    <div class="team-selector">
      <button
        :class="['team-button', { active: selectedTeam === 'home' }]"
        :style="{
          borderColor: selectedTeam === 'home' ? homeTeamInfo.color : '#e9ecef',
          color: selectedTeam === 'home' ? homeTeamInfo.color : '#666',
        }"
        @click="selectTeam('home')"
      >
        <img
          :src="homeTeamInfo.image"
          :alt="homeTeamInfo.name"
          class="team-logo-small"
        />
        {{ game.homeTeam }} 응원
      </button>
      <button
        :class="['team-button', { active: selectedTeam === 'away' }]"
        :style="{
          borderColor: selectedTeam === 'away' ? awayTeamInfo.color : '#e9ecef',
          color: selectedTeam === 'away' ? awayTeamInfo.color : '#666',
        }"
        @click="selectTeam('away')"
      >
        <img
          :src="awayTeamInfo.image"
          :alt="awayTeamInfo.name"
          class="team-logo-small"
        />
        {{ game.awayTeam }} 응원
      </button>
    </div>

    <!-- 채팅 영역 -->
    <div class="chat-container">
      <!-- 홈팀 채팅 -->
      <div class="chat-column home-chat">
        <div
          class="chat-header"
          :style="{
            backgroundColor: homeTeamInfo.bgColor,
            color: homeTeamInfo.color,
          }"
        >
          <img
            :src="homeTeamInfo.image"
            :alt="homeTeamInfo.name"
            class="team-logo-header"
          />
          <span>{{ game.homeTeam }} 응원단</span>
        </div>
        <div ref="homeChat" class="chat-messages">
          <ChatMessage
            v-for="message in homeMessages"
            :key="message.id"
            :message="message"
            :teamColor="homeTeamInfo.color"
          />
        </div>
      </div>

      <!-- 원정팀 채팅 -->
      <div class="chat-column away-chat">
        <div
          class="chat-header"
          :style="{
            backgroundColor: awayTeamInfo.bgColor,
            color: awayTeamInfo.color,
          }"
        >
          <img
            :src="awayTeamInfo.image"
            :alt="awayTeamInfo.name"
            class="team-logo-header"
          />
          <span>{{ game.awayTeam }} 응원단</span>
        </div>
        <div ref="awayChat" class="chat-messages">
          <ChatMessage
            v-for="message in awayMessages"
            :key="message.id"
            :message="message"
            :teamColor="awayTeamInfo.color"
          />
        </div>
      </div>
    </div>

    <!-- 채팅 입력 -->
    <TeamChatInput
      :selectedTeam="selectedTeam"
      :homeTeam="game.homeTeam"
      :awayTeam="game.awayTeam"
      :homeColor="homeTeamInfo.color"
      :awayColor="awayTeamInfo.color"
      @sendMessage="handleSendMessage"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, nextTick, watch } from 'vue'
import { useChatStore } from '../../stores/chat'
import { getTeamInfo } from '../../utils/teamUtils'
import ChatMessage from './ChatMessage.vue'
import TeamChatInput from './TeamChatInput.vue'

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
const homeChat = ref(null)
const awayChat = ref(null)

const homeMessages = computed(() => chatStore.getHomeMessages)
const awayMessages = computed(() => chatStore.getAwayMessages)
const selectedTeam = computed(() => chatStore.getSelectedTeam)

const homeTeamInfo = computed(() => getTeamInfo(props.game.homeTeam))
const awayTeamInfo = computed(() => getTeamInfo(props.game.awayTeam))

// 새로운 메시지가 추가될 때마다 스크롤을 맨 아래로
watch(
  homeMessages,
  async () => {
    await nextTick()
    if (homeChat.value) {
      homeChat.value.scrollTop = homeChat.value.scrollHeight
    }
  },
  { deep: true }
)

watch(
  awayMessages,
  async () => {
    await nextTick()
    if (awayChat.value) {
      awayChat.value.scrollTop = awayChat.value.scrollHeight
    }
  },
  { deep: true }
)

const selectTeam = team => {
  chatStore.setSelectedTeam(team)
}

const handleSendMessage = content => {
  if (!selectedTeam.value) {
    alert('응원할 팀을 선택해주세요!')
    return
  }
  chatStore.sendMessage(content, selectedTeam.value)
}

onMounted(() => {
  chatStore.connectToGame(props.gameId, props.game)
})

onUnmounted(() => {
  chatStore.disconnect()
})
</script>

<style scoped>
.team-chat-section {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-title {
  font-size: 1.3rem;
  margin: 0;
  padding: 20px 20px 0;
  color: #2c5aa0;
  text-align: center;
}

.team-selector {
  display: flex;
  padding: 15px 20px;
  gap: 10px;
}

.team-button {
  flex: 1;
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
}

.team-button.active {
  background: #f8f9ff;
  font-weight: bold;
}

.team-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.team-logo-small {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
}

.chat-container {
  display: flex;
  flex: 1;
  min-height: 0;
}

.chat-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e9ecef;
}

.chat-column:last-child {
  border-right: none;
}

.chat-header {
  padding: 15px;
  text-align: center;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-bottom: 1px solid #e9ecef;
}

.team-logo-header {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  background: #fafafa;
  min-height: 300px;
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
  .chat-container {
    flex-direction: column;
  }

  .chat-column {
    border-right: none;
    border-bottom: 1px solid #e9ecef;
  }

  .chat-column:last-child {
    border-bottom: none;
  }

  .chat-messages {
    min-height: 200px;
  }

  .team-selector {
    flex-direction: column;
  }
}
</style>
