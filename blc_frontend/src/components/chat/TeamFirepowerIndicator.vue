<template>
  <div class="firepower-container">
    <div class="firepower-header">
      <h3>🔥 실시간 응원 화력</h3>
      <div class="total-power">총 {{ totalMessages }}개의 응원 메시지</div>
    </div>

    <div class="firepower-battle">
      <!-- 홈팀 화력 -->
      <div class="team-firepower home-team">
        <div class="team-info">
          <img
            :src="homeTeamInfo.image"
            :alt="homeTeamInfo.name"
            class="team-avatar"
          />
          <div class="team-details">
            <div class="team-name">{{ homeTeam }}</div>
            <div class="message-count">{{ homeMessageCount }}개 메시지</div>
          </div>
        </div>

        <div class="power-bar-container">
          <div
            class="power-bar home-bar"
            :style="{
              width: homePercentage + '%',
              backgroundColor: homeTeamInfo.color,
              boxShadow: `0 0 10px ${homeTeamInfo.color}40`,
            }"
          >
            <div class="power-sparks">
              <span v-for="n in homeFireLevel" :key="n" class="spark">⚡</span>
            </div>
          </div>
          <div class="percentage-text">{{ homePercentage }}%</div>
        </div>
      </div>

      <!-- VS 중앙 -->
      <div class="vs-section">
        <div class="vs-text">VS</div>
        <div class="battle-intensity">
          <div class="intensity-meter">
            <div
              class="intensity-fill"
              :style="{
                height: battleIntensity + '%',
                background: `linear-gradient(to top, #ff6b6b, #ffd93d, #6bcf7f)`,
              }"
            ></div>
          </div>
          <div class="intensity-label">
            열기 {{ Math.round(battleIntensity) }}%
          </div>
        </div>
      </div>

      <!-- 원정팀 화력 -->
      <div class="team-firepower away-team">
        <div class="team-info">
          <img
            :src="awayTeamInfo.image"
            :alt="awayTeamInfo.name"
            class="team-avatar"
          />
          <div class="team-details">
            <div class="team-name">{{ awayTeam }}</div>
            <div class="message-count">{{ awayMessageCount }}개 메시지</div>
          </div>
        </div>

        <div class="power-bar-container">
          <div class="percentage-text">{{ awayPercentage }}%</div>
          <div
            class="power-bar away-bar"
            :style="{
              width: awayPercentage + '%',
              backgroundColor: awayTeamInfo.color,
              boxShadow: `0 0 10px ${awayTeamInfo.color}40`,
            }"
          >
            <div class="power-sparks">
              <span v-for="n in awayFireLevel" :key="n" class="spark">⚡</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 화력 레벨 표시 -->
    <div class="fire-levels">
      <div class="level-indicator">
        <span class="level-label">화력 등급:</span>
        <div class="level-badges">
          <span
            :class="['level-badge', { active: homeFireLevel >= 1 }]"
            :style="{ borderColor: homeTeamInfo.color }"
          >
            {{ homeTeam }} {{ getFireLevelText(homeFireLevel) }}
          </span>
          <span
            :class="['level-badge', { active: awayFireLevel >= 1 }]"
            :style="{ borderColor: awayTeamInfo.color }"
          >
            {{ awayTeam }} {{ getFireLevelText(awayFireLevel) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  homeTeam: {
    type: String,
    required: true,
  },
  awayTeam: {
    type: String,
    required: true,
  },
  homeMessageCount: {
    type: Number,
    default: 0,
  },
  awayMessageCount: {
    type: Number,
    default: 0,
  },
  homeTeamInfo: {
    type: Object,
    required: true,
  },
  awayTeamInfo: {
    type: Object,
    required: true,
  },
})

// 총 메시지 수
const totalMessages = computed(
  () => props.homeMessageCount + props.awayMessageCount
)

// 각 팀 비율 계산
const homePercentage = computed(() => {
  if (totalMessages.value === 0) return 50
  return Math.round((props.homeMessageCount / totalMessages.value) * 100)
})

const awayPercentage = computed(() => {
  if (totalMessages.value === 0) return 50
  return Math.round((props.awayMessageCount / totalMessages.value) * 100)
})

// 화력 레벨 계산 (메시지 수에 따라 1-5 레벨)
const homeFireLevel = computed(() => {
  return Math.min(Math.floor(props.homeMessageCount / 5) + 1, 5)
})

const awayFireLevel = computed(() => {
  return Math.min(Math.floor(props.awayMessageCount / 5) + 1, 5)
})

// 전체 경기 열기 (총 메시지 수와 균형도로 계산)
const battleIntensity = computed(() => {
  const maxIntensity = Math.min(totalMessages.value * 2, 100) // 최대 100%
  const balance =
    1 - Math.abs(homePercentage.value - awayPercentage.value) / 100 // 균형도 (0-1)
  return Math.round(maxIntensity * (0.7 + balance * 0.3)) // 균형이 맞을수록 열기 증가
})

// 화력 레벨 텍스트
const getFireLevelText = level => {
  const levels = {
    1: '🔥 시작',
    2: '🔥🔥 열정',
    3: '🔥🔥🔥 폭발',
    4: '🔥🔥🔥🔥 최고조',
    5: '🔥🔥🔥🔥🔥 전설',
  }
  return levels[level] || '🔥 시작'
}
</script>

<style scoped>
.firepower-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  color: white;
  position: relative;
  overflow: hidden;
}

.firepower-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  pointer-events: none;
}

.firepower-header {
  text-align: center;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.firepower-header h3 {
  margin: 0 0 8px 0;
  font-size: 1.4rem;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.total-power {
  font-size: 0.9rem;
  opacity: 0.9;
}

.firepower-battle {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.team-firepower {
  flex: 1;
}

.team-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.team-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  object-fit: contain;
  background: white;
  padding: 2px;
}

.team-details {
  flex: 1;
}

.team-name {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 2px;
}

.message-count {
  font-size: 0.8rem;
  opacity: 0.8;
}

.power-bar-container {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 30px;
}

.away-team .power-bar-container {
  flex-direction: row-reverse;
}

.power-bar {
  height: 100%;
  border-radius: 15px;
  position: relative;
  transition: all 0.5s ease;
  min-width: 10px;
  background: linear-gradient(45deg, currentColor, rgba(255, 255, 255, 0.2));
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(1.1);
  }
}

.power-sparks {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  display: flex;
  gap: 2px;
}

.away-team .power-sparks {
  right: auto;
  left: 8px;
}

.spark {
  font-size: 0.8rem;
  animation: sparkle 1s infinite alternate;
}

@keyframes sparkle {
  0% {
    opacity: 0.5;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.percentage-text {
  font-weight: bold;
  min-width: 40px;
  text-align: center;
  font-size: 0.9rem;
}

.vs-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 80px;
}

.vs-text {
  font-size: 1.2rem;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.battle-intensity {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.intensity-meter {
  width: 20px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.intensity-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 10px;
  transition: height 0.5s ease;
}

.intensity-label {
  font-size: 0.7rem;
  text-align: center;
  opacity: 0.9;
}

.fire-levels {
  position: relative;
  z-index: 1;
}

.level-indicator {
  text-align: center;
}

.level-label {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 8px;
  display: block;
}

.level-badges {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.level-badge {
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  font-size: 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.level-badge.active {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .firepower-container {
    padding: 15px;
  }

  .firepower-battle {
    flex-direction: column;
    gap: 15px;
  }

  .vs-section {
    order: -1;
    flex-direction: row;
    gap: 12px;
  }

  .team-firepower {
    width: 100%;
  }

  .team-info {
    justify-content: center;
  }

  .level-badges {
    gap: 8px;
  }

  .level-badge {
    font-size: 0.7rem;
    padding: 4px 8px;
  }
}
</style>
