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

    <!-- ▶ 박진감 넘치는 채팅 게이지 -->
    <div class="chat-gauge-container">
      <div class="gauge-header">
        <div class="team-stats home-stats">
          <span class="team-label">{{ game.homeTeamName }}</span>
          <span class="message-count">{{ homeMessageCount }}</span>
        </div>
        <div class="vs-indicator">⚡ 응원도 현황 ⚡</div>
        <div class="team-stats away-stats">
          <span class="team-label">{{ game.awayTeamName }}</span>
          <span class="message-count">{{ awayMessageCount }}</span>
        </div>
      </div>
      
      <div class="chat-gauge">
        <!-- 홈팀 게이지 -->
        <div
          class="gauge-bar home-gauge"
          :style="{
            width: homePercent + '%',
            backgroundColor: homeColor,
            boxShadow: `0 0 20px ${homeColor}40`
          }"
        >
          <div class="gauge-glow"></div>
          <div class="gauge-sparkles" v-if="homeMessageCount > 0">
            <div class="sparkle" v-for="i in 3" :key="'home-' + i"></div>
          </div>
        </div>
        
        <!-- 원정팀 게이지 -->
        <div
          class="gauge-bar away-gauge"
          :style="{
            width: awayPercent + '%',
            backgroundColor: awayColor,
            boxShadow: `0 0 20px ${awayColor}40`
          }"
        >
          <div class="gauge-glow"></div>
          <div class="gauge-sparkles" v-if="awayMessageCount > 0">
            <div class="sparkle" v-for="i in 3" :key="'away-' + i"></div>
          </div>
        </div>
        
        <!-- 🔥 다이나믹한 경계선 효과 -->
        <div 
          class="dynamic-boundary"
          :style="{
            left: homePercent + '%',
            opacity: (homeMessageCount > 0 || awayMessageCount > 0) ? 1 : 0
          }"
        >
          <!-- 경계선 코어 -->
          <div class="boundary-core"></div>
          
          <!-- 전기 스파크 -->
          <div class="electric-sparks">
            <div class="spark spark-1"></div>
            <div class="spark spark-2"></div>
            <div class="spark spark-3"></div>
          </div>
          
          <!-- 펄스 링 -->
          <div class="pulse-rings">
            <div class="pulse-ring ring-1"></div>
            <div class="pulse-ring ring-2"></div>
            <div class="pulse-ring ring-3"></div>
          </div>
          
          <!-- 격돌 이펙트 -->
          <div class="clash-effect">
            <div class="clash-wave clash-wave-1"></div>
            <div class="clash-wave clash-wave-2"></div>
          </div>
        </div>
      </div>
      
      <!-- 하단 열기 표시 -->
      <div class="heat-indicator">
        <div class="heat-bar" :style="{ width: Math.min(100, (homeMessageCount + awayMessageCount) * 2) + '%' }">
          <div class="heat-wave"></div>
        </div>
        <span class="heat-text">🔥 총 응원 수: {{ homeMessageCount + awayMessageCount }}개</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import GameStatus from '../game/GameStatus.vue'
import { getTeamImageByCode } from '@/utils/teamImageByCode'
import { getTeamInfo } from '@/utils/teamUtils'

const props = defineProps({
  room: { type: Object, required: true },
  game: { type: Object, required: true },
  homeMessageCount: { type: Number, default: 0 },
  awayMessageCount: { type: Number, default: 0 },
})

const homeTeamInfo = computed(() => getTeamInfo(props.game.homeCode))
const awayTeamInfo = computed(() => getTeamInfo(props.game.awayCode))

const homeColor = computed(() => homeTeamInfo.value.color)
const awayColor = computed(() => awayTeamInfo.value.color)

const total = computed(() => {
  const sum = props.homeMessageCount + props.awayMessageCount
  return sum > 0 ? sum : 1
})

const homePercent = computed(() => {
  if (total.value === 1) return 50 // 메시지가 없으면 50:50
  return (props.homeMessageCount / total.value) * 100
})

const awayPercent = computed(() => {
  if (total.value === 1) return 50 // 메시지가 없으면 50:50
  return (props.awayMessageCount / total.value) * 100
})

const emit = defineEmits(['click'])

const computedStatus = computed(() => {
  const now = new Date()
  const gameDate = new Date(props.game.gameDateTime)
  return now >= gameDate ? 'LIVE' : 'SCHEDULED'
})

function formatDate(raw) {
  const d = new Date(raw)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
/* 기존 스타일들 */
.game-card {
  min-width: 300px;
  background: #fff;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
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

.game-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.game-date,
.game-stadium {
  display: block;
  font-size: 0.9rem;
  color: #666;
}

/* 🔥 박진감 넘치는 게이지 스타일 */
.chat-gauge-container {
  margin: 20px 0;
  padding: 15px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 1px solid #dee2e6;
  position: relative;
  overflow: hidden;
}

.gauge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.team-stats {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.team-label {
  font-size: 0.8rem;
  font-weight: bold;
  color: #666;
}

.message-count {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c5aa0;
  animation: countPulse 2s infinite;
}

.vs-indicator {
  font-size: 0.9rem;
  font-weight: bold;
  background: linear-gradient(45deg, #dc2626, #7c3aed, #1d4ed8);
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
}

/* 🔥 완전히 채워지는 게이지 */
.chat-gauge {
  position: relative;
  width: 100%;
  height: 24px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.gauge-bar {
  position: absolute;
  top: 0;
  height: 100%;
  border-radius: 12px;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  animation: gaugeGlow 2s ease-in-out infinite alternate;
}

.gauge-bar.home-gauge {
  left: 0;
  transform-origin: left center;
}

.gauge-bar.away-gauge {
  right: 0;
  transform-origin: right center;
}

.gauge-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255,255,255,0.3) 50%, 
    transparent 100%);
  animation: shimmer 2s infinite;
}

/* 🔥 다이나믹한 경계선 효과 */
.dynamic-boundary {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px; /* 6px → 16px로 크게 확장 */
  height: 120%; /* 100% → 120%로 더 크게 */
  z-index: 10;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.boundary-core {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 6px; /* 2px → 6px로 굵게 */
  height: 100%;
  background: linear-gradient(180deg, 
    #fff 0%, 
    #f1c40f 15%, 
    #e67e22 30%,
    #ff1493 50%, 
    #8a2be2 65%,
    #ff4500 80%,
    #ffd700 95%,
    #fff 100%
    );
  animation: coreIntensity 1.2s infinite;
  box-shadow: 
    0 0 15px rgba(255, 215, 0, 1),
    0 0 30px rgba(255, 69, 0, 0.8),
    0 0 45px rgba(255, 20, 147, 0.6),
    0 0 60px rgba(138, 43, 226, 0.4);
  border-radius: 3px;
}

/* 🌟 경계선 외곽 글로우 레이어 추가 */
.boundary-core::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(180deg, 
    transparent 0%,
    rgba(255, 215, 0, 0.3) 25%,
    rgba(255, 69, 0, 0.5) 50%,
    rgba(255, 20, 147, 0.3) 75%,
    transparent 100%);
  border-radius: 5px;
  animation: outerGlow 2s infinite alternate;
}

/* 🌟 경계선 내부 코어 레이어 추가 */
.boundary-core::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 2px;
  height: 80%;
  background: linear-gradient(180deg, 
    #fff 0%, 
    #ffd700 50%, 
    #fff 100%);
  animation: innerPulse 1s infinite;
  border-radius: 1px;
}

.pulse-rings {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px; /* 30px → 50px로 확장 */
  height: 50px; /* 30px → 50px로 확장 */
}

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px solid rgba(255, 215, 0, 0.6); /* 1px → 2px로 굵게 */
  border-radius: 50%;
  animation: pulseExpand 2s infinite;
}

.ring-1 { 
  animation-delay: 0s; 
  border-color: rgba(255, 215, 0, 0.9);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
}
.ring-2 { 
  animation-delay: 0.7s; 
  border-color: rgba(255, 69, 0, 0.7);
  box-shadow: 0 0 15px rgba(255, 69, 0, 0.4);
}
.ring-3 { 
  animation-delay: 1.4s; 
  border-color: rgba(255, 20, 147, 0.5);
  box-shadow: 0 0 15px rgba(255, 20, 147, 0.3);
}

.clash-effect {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px; /* 40px → 60px로 확장 */
  height: 100%;
}

.clash-wave {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 8px; /* 4px → 8px로 굵게 */
  height: 100%;
  background: linear-gradient(180deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.9) 50%, 
    transparent 100%);
  animation: clashWave 1.5s infinite;
  border-radius: 4px;
}

.clash-wave-1 { 
  animation-delay: 0s; 
  background: linear-gradient(180deg, 
    transparent 0%, 
    rgba(255, 215, 0, 0.95) 50%, 
    transparent 100%);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.7);
}
.clash-wave-2 { 
  animation-delay: 0.75s; 
  background: linear-gradient(180deg, 
    transparent 0%, 
    rgba(255, 69, 0, 0.8) 50%, 
    transparent 100%);
  box-shadow: 0 0 20px rgba(255, 69, 0, 0.5);
}

.heat-indicator {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.heat-bar {
  flex: 1;
  height: 6px;
  background: linear-gradient(90deg, #4ecdc4, #44a08d, #ff6b6b);
  border-radius: 3px;
  position: relative;
  overflow: hidden;
  transition: width 0.8s ease;
}

.heat-wave {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255,255,255,0.6) 50%, 
    transparent 100%);
  animation: heatWave 2s infinite;
}

.heat-text {
  font-size: 0.8rem;
  font-weight: bold;
  color: #666;
  white-space: nowrap;
}

/* 🔥 새로운 다이나믹 애니메이션 */
@keyframes coreIntensity {
  0%, 100% { 
    opacity: 0.9; 
    transform: translateX(-50%) scaleY(1) scaleX(1); 
  }
  50% { 
    opacity: 1; 
    transform: translateX(-50%) scaleY(1.3) scaleX(1.2); 
  }
}

@keyframes outerGlow {
  0% { 
    opacity: 0.3; 
    transform: scale(1); 
  }
  100% { 
    opacity: 0.7; 
    transform: scale(1.1); 
  }
}

@keyframes innerPulse {
  0%, 100% { 
    opacity: 0.8; 
    transform: translate(-50%, -50%) scaleY(1); 
  }
  50% { 
    opacity: 1; 
    transform: translate(-50%, -50%) scaleY(1.5); 
  }
}

@keyframes sparkDance {
  0%, 100% { 
    transform: translateY(0px) rotate(0deg); 
    opacity: 0.5; 
  }
  25% { 
    transform: translateY(-4px) rotate(90deg); 
    opacity: 1; 
  }
  50% { 
    transform: translateY(-8px) rotate(180deg); 
    opacity: 0.8; 
  }
  75% { 
    transform: translateY(-4px) rotate(270deg); 
    opacity: 1; 
  }
}

@keyframes pulseExpand {
  0% { 
    transform: scale(0.2); 
    opacity: 1; 
  }
  100% { 
    transform: scale(2.5); 
    opacity: 0; 
  }
}

@keyframes clashWave {
  0% { 
    transform: translateX(-50%) scaleX(0.8); 
    opacity: 0; 
  }
  50% { 
    transform: translateX(-50%) scaleX(2.5); 
    opacity: 1; 
  }
  100% { 
    transform: translateX(-50%) scaleX(0.8); 
    opacity: 0; 
  }
}

/* 기존 애니메이션들 */
@keyframes countPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes gaugeGlow {
  0% { filter: brightness(1) saturate(1); }
  100% { filter: brightness(1.2) saturate(1.3); }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes heatWave {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* 호버 효과 강화 */
.game-card:hover .gauge-bar {
  animation-duration: 1s;
}

.game-card:hover .boundary-core {
  animation-duration: 0.8s;
}

.game-card:hover .message-count {
  animation-duration: 1s;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .game-card {
    min-width: auto;
    margin-bottom: 15px;
  }
  
  .gauge-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .vs-indicator {
    order: -1;
    margin-bottom: 8px;
  }
  
  .team-stats {
    flex-direction: row;
    gap: 8px;
  }
  
  .heat-indicator {
    flex-direction: column;
    gap: 8px;
  }
}
</style>