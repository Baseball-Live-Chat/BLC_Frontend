import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = (process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080') + '/api'
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

export const useAttendanceStore = defineStore('attendance', {
  state: () => ({
    todayStatus: false,
    history: [],       // 과거 출석 내역: [{ attendanceDate, points }]
    inbox: []          // 수신함 항목: [{ attendanceId, attendanceDate, points, claimed }]
  }),

  actions: {
    /** 오늘 출석 상태 조회 */
    // async fetchTodayStatus() {
    //   try {
    //     const res = await axios.get('/api/attendance/today')
    //     this.todayStatus = res.data.attended
    //   } catch (err) {
    //     console.error('fetchTodayStatus error', err)
    //   }
    // },

    /** 추후 추가 기능 */
    // /** 출석하기 */
    // async attendToday() {
    //   try {
    //     await axios.post('/api/attendance')
    //     this.todayStatus = true
    //   } catch (err) {
    //     console.error('attendToday error', err)
    //     throw err
    //   }
    // },

    // /** 수신함 조회 */
    // async fetchInbox() {
    //   try {
    //     const res = await axios.get('/api/attendance/inbox')
    //     this.inbox = res.data.map(item => ({
    //       attendanceId: item.attendance_id,
    //       attendanceDate: item.attendance_date,
    //       points: item.points,
    //       claimed: item.claimed
    //     }))
    //   } catch (err) {
    //     console.error('fetchInbox error', err)
    //   }
    // },

    /** 출석 내역 조회 */
    async fetchHistory(year = null, month = null) {
      try {
        const authStore = useAuthStore()
        
        // 현재 연도/달 기본값 설정
        const currentDate = new Date()
        const targetYear = year || currentDate.getFullYear()
        const targetMonth = month || (currentDate.getMonth() + 1) // getMonth()는 0부터 시작하므로 +1
        
        const params = {
          year: targetYear,
          month: String(targetMonth).padStart(2, '0') // 01, 02 형태로 변환
        }
        
        const res = await apiClient.get('/attendance', { params })
        
        // 서버에서 attendance_date만 내려온다고 가정
        this.history = res.data.attendDates.map(date => ({
          attendanceDate: date
        }))
        
      } catch (err) {
        console.error('fetchHistory error', err)
        // 에러 처리 로직 추가 (필요시)
        throw err
      }
    },

    /** 특정 연도/달의 출석 내역 조회 */
    async fetchHistoryByMonth(year, month) {
      return await this.fetchHistory(year, month)
    },

    /** 현재 달의 출석 내역 조회 */
    async fetchCurrentMonthHistory() {
      return await this.fetchHistory()
    },

    

    // /** 개별 출석 포인트 수령 */
    // async claimAttendance(id) {
    //   try {
    //     await axios.post(`/api/attendance/claim/${id}`)
    //   } catch (err) {
    //     console.error('claimAttendance error', err)
    //     throw err
    //   }
    // },

    // /** 전체 출석 포인트 일괄 수령 */
    // async claimAll() {
    //   try {
    //     await axios.post('/api/attendance/claim-all')
    //   } catch (err) {
    //     console.error('claimAll error', err)
    //     throw err
    //   }
    // }
  }
})