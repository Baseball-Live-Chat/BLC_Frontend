<template>
  <div class="betting-container">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading">베팅 정보를 불러오는 중...</div>

    <!-- 베팅 통계 표시 -->
    <div v-else class="betting-stats">
      <div class="stats-header">
        <h3>실시간 베팅 현황</h3>
        <div class="total-info">
          총 {{ formatNumber(bettingStats?.totalBetPoints || 0) }}P | 
          {{ bettingStats?.totalBetCount || 0 }}명 참여
        </div>
      </div>

      <!-- 베팅률 바 -->
      <div class="betting-bar-container">
        <div class="team-section home-section">
          <div class="team-info">
            <img :src="homeTeamInfo.image" :alt="homeTeamInfo.name" class="team-logo" />
            <div class="team-details">
              <div class="team-name">{{ bettingStats?.homeTeamName || game.homeTeam }}</div>
              <div class="bet-info">
                {{ formatNumber(bettingStats?.homeTeamBetPoints || 0) }}P 
                ({{ bettingStats?.homeTeamBetCount || 0 }}명)
              </div>
            </div>
          </div>
          <div class="odds">배당률: {{ formatOdds(bettingStats?.homeTeamOdds) }}</div>
        </div>

        <!-- 중앙 베팅률 바 -->
        <div class="betting-bar">
          <div 
            class="home-bar" 
            :style="{ 
              width: homePercentage + '%',
              backgroundColor: homeTeamInfo.color 
            }"
          >
            <span class="percentage">{{ homePercentage }}%</span>
          </div>
          <div 
            class="away-bar" 
            :style="{ 
              width: awayPercentage + '%',
              backgroundColor: awayTeamInfo.color 
            }"
          >
            <span class="percentage">{{ awayPercentage }}%</span>
          </div>
        </div>

        <div class="team-section away-section">
          <div class="odds">배당률: {{ formatOdds(bettingStats?.awayTeamOdds) }}</div>
          <div class="team-info away-info">
            <div class="team-details">
              <div class="team-name">{{ bettingStats?.awayTeamName || game.awayTeam }}</div>
              <div class="bet-info">
                {{ formatNumber(bettingStats?.awayTeamBetPoints || 0) }}P 
                ({{ bettingStats?.awayTeamBetCount || 0 }}명)
              </div>
            </div>
            <img :src="awayTeamInfo.image" :alt="awayTeamInfo.name" class="team-logo" />
          </div>
        </div>
      </div>
    </div>

    <!-- 베팅 입력 섹션 -->
    <div v-if="authStore.isAuthenticated" class="betting-input-section">
      <!-- 사용자 베팅 현황 -->
      <div v-if="userBetStatus" class="user-bet-status">
        <div class="status-info">
          <span>내 베팅: {{ formatNumber(userBetStatus.totalBetPoints) }}P</span>
          <span>추가 가능: {{ formatNumber(userBetStatus.remainingPoints) }}P</span>
        </div>
      </div>

      <!-- 팀 선택 버튼 -->
      <div class="team-selection">
        <button
          :class="['team-btn', { selected: selectedTeam === getHomeTeamId() }]"
          :style="{
            borderColor: homeTeamInfo.color,
            backgroundColor: selectedTeam === getHomeTeamId() ? homeTeamInfo.color : 'transparent',
            color: selectedTeam === getHomeTeamId() ? 'white' : homeTeamInfo.color
          }"
          @click="handleTeamSelect(getHomeTeamId())"
          :disabled="!canBet"
        >
          <img :src="homeTeamInfo.image" :alt="homeTeamInfo.name" class="btn-logo" />
          {{ game.homeTeam }} 승리
        </button>

        <button
          :class="['team-btn', { selected: selectedTeam === getAwayTeamId() }]"
          :style="{
            borderColor: awayTeamInfo.color,
            backgroundColor: selectedTeam === getAwayTeamId() ? awayTeamInfo.color : 'transparent',
            color: selectedTeam === getAwayTeamId() ? 'white' : awayTeamInfo.color
          }"
          @click="handleTeamSelect(getAwayTeamId())"
          :disabled="!canBet"
        >
          <img :src="awayTeamInfo.image" :alt="awayTeamInfo.name" class="btn-logo" />
          {{ game.awayTeam }} 승리
        </button>
      </div>

      <!-- 베팅 금액 입력 -->
      <div class="bet-amount-section">
        <input
          v-model="betAmount"
          type="number"
          placeholder="베팅할 포인트를 입력하세요"
          min="10"
          :max="userBetStatus?.remainingPoints || 0"
          class="bet-input"
          :disabled="!selectedTeam || !canBet"
          @input="handleAmountInput"
        />
        <div class="quick-amounts">
          <button
            v-for="amount in quickAmounts"
            :key="amount"
            class="quick-btn"
            @click="setBetAmount(amount)"
            :disabled="!selectedTeam || amount > (userBetStatus?.remainingPoints || 0)"
          >
            {{ formatNumber(amount) }}P
          </button>
        </div>
      </div>

      <!-- 베팅 제출 버튼 -->
      <button
        class="bet-submit-btn"
        @click="handleBet"
        :disabled="!canSubmitBet"
      >
        {{ isSubmitting ? '베팅 중...' : `${formatNumber(parseInt(betAmount) || 0)}P 베팅하기` }}
      </button>

      <!-- 베팅 안내 -->
      <div class="betting-info">
        <p>• 최소 베팅: 10P, 최대 누적 베팅: 10,000P</p>
        <p>• 한 경기에 여러 번 베팅 가능 (같은 팀만)</p>
        <p>• 경기 시작 후에는 베팅이 불가능합니다</p>
      </div>
    </div>

    <!-- 로그인 유도 -->
    <div v-else class="login-prompt">
      <p>🔐 베팅에 참여하려면 로그인이 필요합니다</p>
      <router-link to="/login" class="login-btn">
        로그인하기
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useBettingStore } from '../../stores/betting'

const props = defineProps({
  gameId: {
    type: [String, Number],
    required: true,
  },
  game: {
    type: Object,
    required: true,
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

// 스토어 접근
const authStore = useAuthStore()
const bettingStore = useBettingStore()

// 반응형 상태
const selectedTeam = ref(null)
const betAmount = ref('')
const isSubmitting = ref(false)
const loading = ref(true)

// 빠른 베팅 금액
const quickAmounts = [100, 500, 1000, 2000]

// 계산된 속성
const bettingStats = computed(() => bettingStore.getBettingStats(props.gameId))
const userBetStatus = computed(() => bettingStore.getUserBetStatus(props.gameId))

// 베팅률 계산
const homePercentage = computed(() => {
  if (!bettingStats.value || !bettingStats.value.totalBetPoints) return 50
  return Math.round((bettingStats.value.homeTeamBetPoints / bettingStats.value.totalBetPoints) * 100)
})

const awayPercentage = computed(() => 100 - homePercentage.value)

// 베팅 가능 여부
const canBet = computed(() => {
  return userBetStatus.value?.canBet !== false
})

const canSubmitBet = computed(() => {
  const amount = parseInt(betAmount.value)
  return selectedTeam.value && 
         amount >= 10 && 
         amount <= (userBetStatus.value?.remainingPoints || 0) &&
         !isSubmitting.value &&
         canBet.value
})

// 메서드
const formatNumber = (num) => {
  return new Intl.NumberFormat('ko-KR').format(num || 0)
}

const formatOdds = (odds) => {
  if (!odds || odds === 999) return '999.00'
  return odds.toFixed(2)
}

// 팀 ID 가져오기 (실제 API 구조에 맞게 수정 필요)
const getHomeTeamId = () => {
  // 백엔드 API에서 teamId를 제공하는 경우
  return props.game.homeTeamInfo?.teamId || 1
}

const getAwayTeamId = () => {
  // 백엔드 API에서 teamId를 제공하는 경우
  return props.game.awayTeamInfo?.teamId || 2
}

const handleTeamSelect = (teamId) => {
  if (userBetStatus.value?.predictedWinnerTeamId && 
      userBetStatus.value.predictedWinnerTeamId !== teamId) {
    alert('이미 다른 팀에 베팅하셨습니다. 같은 팀에만 추가 베팅이 가능합니다.')
    return
  }
  selectedTeam.value = teamId
}

const setBetAmount = (amount) => {
  betAmount.value = amount.toString()
}

const handleAmountInput = (event) => {
  const value = event.target.value
  // 숫자만 허용
  if (!/^\d*$/.test(value)) {
    betAmount.value = value.replace(/[^\d]/g, '')
  }
}

const handleBet = async () => {
  if (!canSubmitBet.value) return

  const amount = parseInt(betAmount.value)
  
  if (amount < 10) {
    alert('최소 10포인트 이상 베팅해야 합니다.')
    return
  }

  isSubmitting.value = true

  try {
    await bettingStore.placeBet(props.gameId, selectedTeam.value, amount)
    betAmount.value = ''
    alert('베팅이 완료되었습니다!')
  } catch (error) {
    console.error('베팅 실패:', error)
    alert(error.message || '베팅에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

// 라이프사이클
onMounted(async () => {
  console.log('🎯 BettingSection 마운트:', props.gameId)
  
  try {
    // 베팅 WebSocket 연결
    await bettingStore.connectToBettingRoom(props.gameId)
    
    // 베팅 통계 조회
    await bettingStore.fetchBettingStats(props.gameId)
    
    // 로그인된 사용자의 경우 베팅 현황 조회
    if (authStore.isAuthenticated) {
      await bettingStore.fetchUserBetStatus(props.gameId)
    }
  } catch (error) {
    console.error('베팅 정보 로드 실패:', error)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  console.log('🔌 BettingSection 언마운트')
  bettingStore.disconnectFromBettingRoom()
})

// 기존 베팅이 있는 경우 팀 자동 선택
watch(userBetStatus, (newStatus) => {
  if (newStatus?.predictedWinnerTeamId && !selectedTeam.value) {
    selectedTeam.value = newStatus.predictedWinnerTeamId
  }
}, { immediate: true })
</script>

<style scoped>
/* 베팅 섹션 메인 컨테이너 */
.betting-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.betting-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%),
              linear-gradient(-45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.1) 75%),
              linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.1) 75%);
  background-size: 20px 20px;
  opacity: 0.3;
  pointer-events: none;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
}

/* 베팅 통계 섹션 */
.betting-stats {
  position: relative;
  z-index: 1;
  margin-bottom: 24px;
}

.stats-header {
  text-align: center;
  margin-bottom: 20px;
}

.stats-header h3 {
  margin: 0 0 8px 0;
  font-size: 1.4rem;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.total-info {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* 베팅률 바 컨테이너 */
.betting-bar-container {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.team-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.away-section {
  align-items: flex-end;
  text-align: right;
}

.team-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.away-info {
  justify-content: flex-end;
  flex-direction: row-reverse;
}

.team-logo {
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

.bet-info {
  font-size: 0.8rem;
  opacity: 0.8;
}

.odds {
  font-size: 0.9rem;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 12px;
  text-align: center;
}

/* 베팅률 바 */
.betting-bar {
  flex: 2;
  height: 40px;
  display: flex;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.home-bar, .away-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.5s ease;
  min-width: 20%;
}

.percentage {
  font-weight: bold;
  font-size: 0.9rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  color: white;
}

/* 베팅 입력 섹션 */
.betting-input-section {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.user-bet-status {
  margin-bottom: 16px;
  text-align: center;
}

.status-info {
  display: flex;
  justify-content: center;
  gap: 20px;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 8px;
}

/* 팀 선택 버튼 */
.team-selection {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  justify-content: center;
}

.team-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 2px solid;
  border-radius: 25px;
  background: transparent;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: all 0.3s ease;
  min-width: 140px;
  justify-content: center;
}

.team-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.team-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.team-btn.selected {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.btn-logo {
  width: 24px;
  height: 24px;
  object-fit: contain;
  border-radius: 50%;
}

/* 베팅 금액 입력 */
.bet-amount-section {
  margin-bottom: 16px;
}

.bet-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  text-align: center;
  margin-bottom: 12px;
  box-sizing: border-box;
}

.bet-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.bet-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.15);
}

.bet-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 빠른 금액 버튼 */
.quick-amounts {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.quick-btn {
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.quick-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 베팅 제출 버튼 */
.bet-submit-btn {
  width: 100%;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.bet-submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
}

.bet-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 베팅 안내 */
.betting-info {
  font-size: 0.8rem;
  opacity: 0.8;
  line-height: 1.4;
}

.betting-info p {
  margin: 4px 0;
}

/* 로그인 유도 */
.login-prompt {
  position: relative;
  z-index: 1;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 30px 20px;
  backdrop-filter: blur(10px);
}

.login-prompt p {
  margin-bottom: 16px;
  font-size: 1.1rem;
}

.login-btn {
  display: inline-block;
  padding: 12px 24px;
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a5f 100%);
  color: white;
  text-decoration: none;
  border-radius: 25px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(44, 90, 160, 0.4);
  color: white;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .betting-container {
    padding: 16px;
  }

  .betting-bar-container {
    flex-direction: column;
    gap: 12px;
  }

  .team-section {
    width: 100%;
  }

  .away-section {
    align-items: flex-start;
    text-align: left;
  }

  .away-info {
    justify-content: flex-start;
    flex-direction: row;
  }

  .betting-bar {
    order: 2;
    margin: 12px 0;
  }

  .team-selection {
    flex-direction: column;
    gap: 8px;
  }

  .team-btn {
    min-width: auto;
    width: 100%;
  }

  .status-info {
    flex-direction: column;
    gap: 8px;
  }

  .quick-amounts {
    gap: 6px;
  }

  .quick-btn {
    flex: 1;
    min-width: 60px;
  }
}
</style>