<template>
  <div class="container">
    <div class="inbox-section">
      <h2 class="section-title">📥 수신함</h2>

      <!-- 로딩 상태 -->
      <div v-if="loadingFetch" class="loading">
        수신함을 불러오는 중...
      </div>
      
      <div v-else>
        <!-- 전체 수령 버튼 -->
        <div v-if="hasUnclaimed" class="inbox-actions">
          <div class="unclaimed-summary">
            <span class="unclaimed-count">{{ unclaimedCount }}개 미수령</span>
            <span class="unclaimed-points">총 {{ totalUnclaimedPoints }}P</span>
          </div>
          <button
            class="claim-all-button"
            @click="handleClaimAll"
            :disabled="claimAllLoading"
          >
            <span class="button-icon">🎁</span>
            {{ claimAllLoading ? '수령 중...' : '전체 수령' }}
          </button>
        </div>

        <!-- 항목 리스트 -->
        <div class="inbox-list-container">
          <div v-for="item in inboxItems" :key="item.attendanceId" class="inbox-item-card">
            <div class="item-left">
              <div class="item-icon">
                <span v-if="!item.claimed" class="gift-icon">🎁</span>
                <span v-else class="check-icon">✅</span>
              </div>
              <div class="item-info">
                <div class="item-date">{{ formatDate(item.attendanceDate) }}</div>
                <div class="item-description">출석 보상</div>
              </div>
            </div>
            
            <div class="item-right">
              <div class="item-points">+{{ item.points }}P</div>
              <div class="item-action">
                <button
                  v-if="!item.claimed"
                  class="claim-button"
                  @click="handleClaim(item.attendanceId)"
                  :disabled="claimLoadingIds.has(item.attendanceId)"
                >
                  {{ claimLoadingIds.has(item.attendanceId) ? '수령 중...' : '수령하기' }}
                </button>
                <span v-else class="claimed-label">수령 완료</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 빈 상태 -->
        <div v-if="!inboxItems.length" class="no-inbox">
          <div class="no-inbox-icon">📭</div>
          <h3>수신함이 비어있습니다</h3>
          <p>출석체크를 통해 포인트를 받아보세요!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAttendanceStore } from '@/stores/attendance'

const attendanceStore = useAttendanceStore()
const loadingFetch = ref(false)
const claimAllLoading = ref(false)
const claimLoadingIds = ref(new Set())

const inboxItems = computed(() => attendanceStore.inbox)
const hasUnclaimed = computed(() => inboxItems.value.some(item => !item.claimed))
const unclaimedCount = computed(() => inboxItems.value.filter(item => !item.claimed).length)
const totalUnclaimedPoints = computed(() => 
  inboxItems.value.filter(item => !item.claimed).reduce((sum, item) => sum + item.points, 0)
)

const fetchInbox = async () => {
  loadingFetch.value = true
  await attendanceStore.fetchInbox()
  loadingFetch.value = false
}

const handleClaim = async (id) => {
  claimLoadingIds.value.add(id)
  await attendanceStore.claimAttendance(id)
  await fetchInbox()
  claimLoadingIds.value.delete(id)
}

const handleClaimAll = async () => {
  claimAllLoading.value = true
  await attendanceStore.claimAll()
  await fetchInbox()
  claimAllLoading.value = false
}

onMounted(async () => {
  await fetchInbox()
})

const formatDate = dateStr => {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${('0'+(d.getMonth()+1)).slice(-2)}.${('0'+d.getDate()).slice(-2)}`
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.inbox-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #2c5aa0;
  border-bottom: 3px solid #2c5aa0;
  padding-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 🔄 로딩 상태 */
.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.loading::before {
  content: '';
  width: 20px;
  height: 20px;
  border: 2px solid #e3e3e3;
  border-top: 2px solid #2c5aa0;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 📊 전체 수령 액션 영역 */
.inbox-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
  border-radius: 12px;
  border: 1px solid #dbeafe;
}

.unclaimed-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.unclaimed-count {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.unclaimed-points {
  font-size: 1.1rem;
  color: #2c5aa0;
  font-weight: 700;
}

.claim-all-button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a5f 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(44, 90, 160, 0.2);
}

.claim-all-button:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.claim-all-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(44, 90, 160, 0.3);
}

.button-icon {
  font-size: 1.1rem;
}

/* 📋 수신함 리스트 */
.inbox-list-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inbox-item-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  transition: all 0.3s ease;
}

.inbox-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.item-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
  border: 1px solid #dbeafe;
}

.gift-icon {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-4px); }
  60% { transform: translateY(-2px); }
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-date {
  font-size: 1rem;
  color: #333;
  font-weight: 600;
}

.item-description {
  font-size: 0.9rem;
  color: #666;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.item-points {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2c5aa0;
  min-width: 80px;
  text-align: right;
}

.item-action {
  min-width: 100px;
  display: flex;
  justify-content: center;
}

.claim-button {
  padding: 8px 16px;
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a5f 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(44, 90, 160, 0.2);
}

.claim-button:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.claim-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(44, 90, 160, 0.3);
}

.claimed-label {
  font-size: 0.9rem;
  color: #10b981;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 📭 빈 상태 */
.no-inbox {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.no-inbox-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.7;
}

.no-inbox h3 {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  color: #333;
}

.no-inbox p {
  margin: 0;
  font-size: 0.9rem;
  color: #888;
}

/* 📱 모바일 반응형 */
@media (max-width: 768px) {
  .container { 
    padding: 15px; 
  }
  
  .inbox-section {
    padding: 15px;
  }
  
  .section-title { 
    font-size: 1.3rem; 
  }
  
  .inbox-actions {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .unclaimed-summary {
    align-items: center;
  }
  
  .claim-all-button { 
    width: 100%; 
    font-size: 1.1rem;
    justify-content: center;
  }
  
  .inbox-item-card {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }
  
  .item-left {
    width: 100%;
    justify-content: flex-start;
  }
  
  .item-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .item-points {
    min-width: auto;
    text-align: left;
  }
  
  .item-action {
    min-width: auto;
  }
  
  .claim-button { 
    font-size: 1rem;
    padding: 10px 20px;
  }
  
  .no-inbox {
    padding: 40px 15px;
  }
  
  .no-inbox-icon {
    font-size: 3rem;
  }
}</style>