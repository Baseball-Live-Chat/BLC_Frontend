<template>
  <div class="game-card" @click="$emit('click')">
    <!-- 경기 상태(예: LIVE) -->
    <GameStatus :status="computedStatus" />

    <!-- 팀, 스코어 영역은 그대로 재사용 -->
    <div class="teams">
      <!-- 홈팀 -->
      <div class="team">
        <div class="team-logo">
          <img
            :src="getTeamImageByCode(game.homeCode)"
            :alt="game.homeTeamName"
            class="team-image"
          />
        </div>
        <div class="team-name">{{ game.homeTeamName }}</div>
        <div class="score">{{ game.homeScore }}</div>
      </div>

      <div class="vs">VS</div>

      <!-- 원정팀 -->
      <div class="team">
        <div class="team-logo">
          <img
            :src="getTeamImageByCode(game.awayCode)"
            :alt="game.awayTeamName"
            class="team-image"
          />
        </div>
        <div class="team-name">{{ game.awayTeamName }}</div>
        <div class="score">{{ game.awayScore }}</div>
      </div>
    </div>

    <!-- 경기 정보(날짜와 구장) -->
    <div class="game-info">
      <div class="game-date">{{ formatDate(game.gameDateTime) }}</div>
      <div class="game-stadium">{{ game.stadium }}</div>
    </div>

    <!-- 채팅방 메타: 방 이름 + 참가자(?) -->
    <div class="room-meta">
      <h4>💬 {{ room.roomName.replace(/\s*채팅방$/, '') }}</h4>
      <p class="participants">
        <span class="label">채팅방 정원</span>
        <span class="colon">:</span>
        <span class="count">{{ room.maxParticipants }}명</span>
      </p>
    </div>

    <!-- 응원 현황(cheer) 영역은 그대로 재사용해도 되고, 
         room.participants가 있다면 그걸로 대체 
    <div class="cheering-info">
      <div class="cheer-count" :style="{ backgroundColor: homeTeamInfo.color }">
        {{ game.homeTeam }} {{ game.homeCheerCount }}
      </div>
      <div class="cheer-count" :style="{ backgroundColor: awayTeamInfo.color }">
        {{ game.awayTeam }} {{ game.awayCheerCount }}
      </div>
    </div> -->

    <!-- 채팅 미리보기: room 메시지를 보여주는 부분 -->
    <div class="chat-preview">
      <h4>🗨️ 실시간 채팅</h4>
      <div
        v-for="msg in room.recentMessages"
        :key="msg.id"
        class="chat-message"
      >
        {{ msg.nickname }}: {{ msg.content }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import GameStatus from '../game/GameStatus.vue'
import { getTeamImageByCode } from '@/utils/teamImageByCode'

const props = defineProps({
  room: { type: Object, required: true },
  game: { type: Object, required: true },
})

const emit = defineEmits(['click'])

// gameDateTime 기준으로 상태 계산
const computedStatus = computed(() => {
  const now = new Date()
  const gameDate = new Date(props.game.gameDateTime)
  return now >= gameDate ? 'LIVE' : 'SCHEDULED'
})

// 선택: gameDateTime을 보기 좋은 문자열로 바꾸는 간단 유틸
function formatDate(raw) {
  const d = new Date(raw)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.room-meta {
  text-align: center;
  margin-top: 12px;
}

.room-meta h4 {
  margin-bottom: 6px;
  font-size: 1rem;
  font-weight: 600;
}

/* participants 꾸밈 */
.participants {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
  color: #555;
}

.participants .label {
  font-weight: 500;
}

.participants .colon {
  color: #888;
}

.participants .count {
  font-weight: bold;
  color: #2c5aa0;
}

/* 호버했을 때 살짝 커지는 효과 */
.game-card:hover .count {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}

.game-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 15px; /* 취향에 맞게 */
}

.game-card {
  min-width: 300px;
  background: #fff;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.game-card:hover {
  border-color: #2c5aa0;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(44, 90, 160, 0.2);
}

.teams {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.team {
  text-align: center;
  flex: 1;
}

.team-logo {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin: 0 auto 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  overflow: hidden;
}

.team-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 50%;
}

.team-name {
  font-size: 0.9rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.vs {
  font-size: 1.2rem;
  font-weight: bold;
  color: #666;
  margin: 0 10px;
}

.score {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c5aa0;
  margin: 10px 0;
}

.game-date,
.game-stadium {
  display: block;
  font-size: 0.9rem;
  color: #666;
  /* 필요하다면 margin 조정 */
}

.cheering-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  gap: 10px;
}

.cheer-count {
  color: white;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
  flex: 1;
  text-align: center;
}

.chat-preview {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 5px;
  border-left: 3px solid #2c5aa0;
}

.chat-preview h4 {
  font-size: 0.9rem;
  margin-bottom: 5px;
  color: #2c5aa0;
}

.chat-message {
  font-size: 0.8rem;
  color: #666;
  margin: 2px 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {
  .game-card {
    min-width: auto;
    margin-bottom: 15px;
  }

  .cheering-info {
    flex-direction: column;
  }
}
</style>
