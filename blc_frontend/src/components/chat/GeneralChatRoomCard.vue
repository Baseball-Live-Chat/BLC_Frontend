<!-- src/components/chat/GeneralChatRoomCard.vue -->
<template>
  <div class="general-chat-card" @click="$emit('click')">
    <!-- 특별 뱃지 -->
    <div class="special-badge">고정</div>
    
    <!-- 헤더 -->
    <div class="card-header">
      <h3>{{ room.roomName }}</h3>
    </div>
    
    <!-- 10개 팀 아이콘 그리드 -->
    <div class="teams-grid">
      <div 
        v-for="(team, teamId) in KBO_TEAMS" 
        :key="teamId"
        class="team-icon"
        :style="{ 
          backgroundColor: team.color + '20',
          borderColor: team.color 
        }"
        :title="team.name"
      >
        <img 
          :src="getTeamImageByCode(team.code)" 
          :alt="team.name"
          class="team-logo"
        />
        <span class="team-code">{{ team.code }}</span>
      </div>
    </div>
    
    <!-- 참가자 정보 -->
    <div class="participants-info">
      <div class="info-item">
        <span class="icon">🟢</span>
        <span class="label">최대 참가자</span>
        <span class="value">{{ room.maxParticipants?.toLocaleString() }}명</span>
      </div>
      <div class="info-item">
        <span class="icon">💬</span>
        <span class="label">실시간 채팅</span>
        <span class="value">활성화</span>
      </div>
    </div>

    <!-- 특별 안내 -->
    <!-- <div class="special-notice">
      <span class="notice-icon">⚡</span>
      <span class="notice-text">모든 KBO 팀을 응원할 수 있어요!</span>
    </div> -->
  </div>
</template>

<script setup>
import { getTeamImageByCode } from '@/utils/teamImageByCode'

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

const props = defineProps({
  room: {
    type: Object,
    required: true,
  },
})

defineEmits(['click'])
</script>

<style scoped>
.general-chat-card {
  min-width: 300px;
  background: linear-gradient(135deg, #fff9c4 0%, #fff 100%);
  border: 3px solid #FFD700;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
  overflow: hidden;
}

.general-chat-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent,
    rgba(255, 215, 0, 0.1),
    transparent
  );
  transform: rotate(45deg);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

.general-chat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(255, 215, 0, 0.4);
  border-color: #FFA500;
}

/* 특별 뱃지 */
.special-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #8B4513;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
  z-index: 1;
}

/* 헤더 */
.card-header {
  text-align: center;
  margin-bottom: 20px;
  z-index: 1;
  position: relative;
  background: transparent; /* 배경 제거 */
}

.card-header h3 {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  font-weight: bold;
  color: #8B4513;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  background: transparent; /* 배경 제거 */
}

.description {
  margin: 0;
  font-size: 0.9rem;
  color: #B8860B;
  font-weight: 500;
}

/* 팀 아이콘 그리드 */
.teams-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 20px;
  z-index: 1;
  position: relative;
}

.team-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  border: 2px solid;
  border-radius: 8px;
  transition: all 0.2s ease;
  background: white;
}

.team-icon:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.team-logo {
  width: 20px;
  height: 20px;
  object-fit: contain;
  margin-bottom: 2px;
}

.team-code {
  font-size: 0.65rem;
  font-weight: bold;
  color: inherit;
}

/* 참가자 정보 */
.participants-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  z-index: 1;
  position: relative;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.8);
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #E6D700;
}

.info-item .icon {
  font-size: 0.8rem;
}

.info-item .label {
  font-size: 0.75rem;
  color: #8B4513;
  font-weight: 500;
}

.info-item .value {
  font-size: 0.75rem;
  font-weight: bold;
  color: #B8860B;
}

/* 특별 안내 */
.special-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: linear-gradient(135deg, #FFE135, #FFD700);
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #E6D700;
  z-index: 1;
  position: relative;
}

.notice-icon {
  font-size: 0.9rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.notice-text {
  font-size: 0.8rem;
  font-weight: bold;
  color: #8B4513;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .general-chat-card {
    min-width: auto;
    margin-bottom: 15px;
    padding: 16px;
  }

  .teams-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 6px;
  }

  .team-icon {
    padding: 6px 3px;
  }

  .team-logo {
    width: 16px;
    height: 16px;
  }

  .team-code {
    font-size: 0.6rem;
  }

  .participants-info {
    flex-direction: column;
    gap: 8px;
  }

  .card-header h3 {
    font-size: 1.1rem;
  }
}
</style>