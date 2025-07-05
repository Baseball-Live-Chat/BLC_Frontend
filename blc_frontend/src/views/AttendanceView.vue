<template>
  <div class="container">
    <div class="attendance-section">
      <h2 class="section-title">🗓️ 출석현황</h2>

      <!-- 달력 뷰 -->
      <div class="calendar-container">
        <div class="calendar-header">
          <button @click="prevMonth" class="nav-button">
            <span>‹</span>
          </button>
          <h3 class="month-title">
            {{ currentYear+"년" }} {{ monthNames[currentMonth] }} 
          </h3>
          <button @click="nextMonth" class="nav-button">
            <span>›</span>
          </button>
        </div>
        
        <div class="calendar-wrapper">
          <div class="calendar-grid">
            <div class="day-name" v-for="day in dayNames" :key="day">
              {{ day }}
            </div>
            <div
              v-for="cell in calendarCells"
              :key="cell.date || cell.day + cell"
              class="day-cell"
              :class="{
                today: cell.date && isToday(cell.date),
                attended: cell.date && attendedSet.has(cell.date),
                'other-month': !cell.date
              }"
            >
              <span class="date-label">{{ cell.day }}</span>
              <div v-if="cell.date && attendedSet.has(cell.date)" class="attendance-indicator">
                <div class="attendance-circle">
                  <div class="attendance-checkmark">✓</div>
                </div>
                <div class="attendance-glow"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 출석 통계 -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-info">
              <div class="stat-number">{{ totalAttendanceDays }}</div>
              <div class="stat-label">총 출석일</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🏆</div>
            <div class="stat-info">
              <div class="stat-number">{{ totalPoints }}</div>
              <div class="stat-label">총 포인트</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🔥</div>
            <div class="stat-info">
              <div class="stat-number">{{ currentStreak }}</div>
              <div class="stat-label">연속 출석</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 출석 내역 섹션 -->
      <div class="attendance-log-section">
        <h3 class="section-title-alt">📋 출석 내역</h3>
        <div class="log-container">
          <div v-if="loading" class="loading-state">
            <div class="loading-icon">⏳</div>
            <p>출석 내역을 불러오는 중...</p>
          </div>
          <div v-else-if="sortedCurrentMonthHistory.length" class="log-list">
            <div v-for="item in sortedCurrentMonthHistory" :key="item.attendanceDate" class="log-item">
              <div class="log-content">
                <div class="log-date">{{ formatDate(item.attendanceDate) }}</div>
                <div class="log-day">{{ getDayOfWeek(item.attendanceDate) }}</div>
              </div>
              <div class="log-points">
                <span class="points-badge">+1000P</span>
              </div>
            </div>
          </div>
          <div v-else class="no-history">
            <div class="no-history-icon">📅</div>
            <h4>{{ currentYear }}년 {{ monthNames[currentMonth] }} 출석 내역이 없습니다.</h4>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAttendanceStore } from '@/stores/attendance'

const attendanceStore = useAttendanceStore()
const loading = ref(false)

// 현재 달 출석 내역
const currentMonthHistory = computed(() => attendanceStore.history)

// 출석 내역을 최신 순으로 정렬
const sortedCurrentMonthHistory = computed(() => {
  return [...currentMonthHistory.value].sort((a, b) => 
    new Date(b.attendanceDate) - new Date(a.attendanceDate)
  )
})

// 달력 로직
const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())
const dayNames = ['일','월','화','수','목','금','토']
const monthNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

// 출석한 날짜들의 Set
const attendedSet = computed(() => new Set(currentMonthHistory.value.map(item => item.attendanceDate)))

// 통계 계산
const totalAttendanceDays = computed(() => currentMonthHistory.value.length)

const totalPoints = computed(() => 
  totalAttendanceDays.value * 1000 // 예시: 출석일마다 1000포인트 지급 
)

const currentStreak = computed(() => {
  if (currentMonthHistory.value.length === 0) return 0
  
  // 현재 달 기준으로 연속 출석일 계산
  const sortedHistory = [...currentMonthHistory.value].sort((a, b) => 
    new Date(b.attendanceDate) - new Date(a.attendanceDate)
  )
  
  if (sortedHistory.length === 0) return 0
  
  let streak = 0
  let expectedDate = new Date()
  
  // 오늘부터 역순으로 확인
  for (let i = 0; i < sortedHistory.length; i++) {
    const attendanceDate = new Date(sortedHistory[i].attendanceDate)
    const expectedDateStr = `${expectedDate.getFullYear()}-${String(expectedDate.getMonth()+1).padStart(2,'0')}-${String(expectedDate.getDate()).padStart(2,'0')}`
    const attendanceDateStr = sortedHistory[i].attendanceDate
    
    if (attendanceDateStr === expectedDateStr) {
      streak++
      expectedDate.setDate(expectedDate.getDate() - 1)
    } else {
      break
    }
  }
  
  return streak
})

// 달력 셀 생성
const calendarCells = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1).getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()
  const cells = []
  
  // 이전 달 빈 칸
  for (let i = 0; i < firstDay; i++) {
    cells.push({ date: null, day: '' })
  }
  
  // 현재 달 날짜들
  for (let d = 1; d <= totalDays; d++) {
    const yyyy = year
    const mm = String(month + 1).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`
    cells.push({ date: dateStr, day: d })
  }
  
  return cells
})

const isToday = dateStr => {
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
  return dateStr === todayStr
}

// 달력 네비게이션
const prevMonth = async () => {
  if (currentMonth.value === 0) {
    currentYear.value--
    currentMonth.value = 11
  } else {
    currentMonth.value--
  }
  await fetchMonthData()
}

const nextMonth = async () => {
  if (currentMonth.value === 11) {
    currentYear.value++
    currentMonth.value = 0
  } else {
    currentMonth.value++
  }
  await fetchMonthData()
}

// 해당 달의 데이터 가져오기
const fetchMonthData = async () => {
  loading.value = true
  try {
    await attendanceStore.fetchHistoryByMonth(currentYear.value, currentMonth.value + 1)
  } catch (error) {
    console.error('달별 출석 데이터 조회 실패:', error)
  } finally {
    loading.value = false
  }
}

// 컴포넌트 마운트 시 현재 달 데이터 로드
onMounted(async () => {
  await fetchMonthData()
})

// 날짜 포맷팅
const formatDate = dateStr => {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
}

const getDayOfWeek = dateStr => {
  const d = new Date(dateStr)
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return days[d.getDay()]
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.attendance-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 30px;
  color: #2c5aa0;
  border-bottom: 3px solid #2c5aa0;
  padding-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 달력 스타일 */
.calendar-container {
  margin-bottom: 30px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 8px;
}

.month-title {
  font-size: 1.4rem;
  color: #1e3a5f;
  margin: 0;
  font-weight: 600;
}

.nav-button {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.2rem;
  color: #2c5aa0;
}

.nav-button:hover {
  background: #f8fafc;
  border-color: #2c5aa0;
  transform: translateY(-1px);
}

.calendar-wrapper {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day-name {
  padding: 12px 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c5aa0;
  text-align: center;
  background: #f8fafc;
  border-radius: 8px;
}

.day-cell {
  padding: 12px 0;
  font-size: 0.9rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 50px;
}

.day-cell.today {
  background: #2c5aa0;
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(44, 90, 160, 0.3);
}

.day-cell.attended {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #166534;
  font-weight: 600;
  border: 2px solid #22c55e;
}

.day-cell.today.attended {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  border: 2px solid #15803d;
}

.other-month {
  opacity: 0.3;
  cursor: default;
}

/* 출석 표시 스타일 */
.attendance-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.attendance-circle {
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4);
}

.attendance-checkmark {
  color: white;
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
}

.attendance-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 30px;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: attendanceGlow 2s ease-in-out infinite;
}

@keyframes attendanceGlow {
  0%, 100% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

.day-cell.today .attendance-circle {
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
  border: 2px solid #0ea5e9;
}

.day-cell.today .attendance-checkmark {
  color: #0ea5e9;
}

.day-cell.today .attendance-glow {
  background: radial-gradient(circle, rgba(14, 165, 233, 0.3) 0%, transparent 70%);
}

/* 통계 섹션 */
.stats-section {
  margin-bottom: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  background: #f8fafc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e3a5f;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  color: #64748b;
}

/* 출석 내역 섹션 */
.attendance-log-section {
  margin-top: 40px;
}

.section-title-alt {
  font-size: 1.3rem;
  margin-bottom: 20px;
  color: #2c5aa0;
  border-left: 4px solid #2c5aa0;
  padding-left: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.log-container {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.log-list {
  max-height: 400px;
  overflow-y: auto;
}

.log-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.2s ease;
}

.log-item:hover {
  background: #f8fafc;
}

.log-item:last-child {
  border-bottom: none;
}

.log-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.log-date {
  color: #1e3a5f;
  font-weight: 600;
  font-size: 0.95rem;
}

.log-day {
  color: #64748b;
  font-size: 0.8rem;
}

.points-badge {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(34, 197, 94, 0.2);
}

.no-history {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.loading-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.7;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-history-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.7;
}

.no-history h4 {
  margin: 0 0 8px 0;
  color: #1e3a5f;
  font-size: 1.1rem;
}

.no-history p {
  margin: 0;
  font-size: 0.9rem;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .container {
    padding: 15px;
  }

  .attendance-section {
    padding: 20px;
  }

  .section-title {
    font-size: 1.3rem;
  }

  .calendar-header {
    padding: 0;
  }

  .month-title {
    font-size: 1.2rem;
  }

  .nav-button {
    width: 36px;
    height: 36px;
  }

  .calendar-wrapper {
    padding: 15px;
  }

  .day-cell {
    min-height: 40px;
    padding: 8px 0;
  }

  .attendance-circle {
    width: 16px;
    height: 16px;
  }

  .attendance-checkmark {
    font-size: 10px;
  }

  .attendance-glow {
    width: 24px;
    height: 24px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 16px;
  }

  .log-item {
    padding: 14px 16px;
  }

  .log-date {
    font-size: 0.9rem;
  }

  .points-badge {
    font-size: 0.8rem;
    padding: 4px 10px;
  }
}
</style>