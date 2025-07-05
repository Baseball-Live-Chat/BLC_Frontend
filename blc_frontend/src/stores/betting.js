import { defineStore } from 'pinia'
import http, { socketURL } from '@/lib/http'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuthStore } from './auth'

export const useBettingStore = defineStore('betting', {
  state: () => ({
    // 베팅 통계 (gameId별로 저장)
    bettingStats: {},
    
    // 사용자 베팅 현황 (gameId별로 저장)  
    userBetStatus: {},
    
    // WebSocket 연결 관리
    stompClient: null,
    connected: false,
    currentGameId: null,
    
    // 로딩 및 에러 상태
    loading: false,
    error: null,
  }),

  getters: {
    // 특정 게임의 베팅 통계 조회
    getBettingStats: (state) => (gameId) => {
      return state.bettingStats[gameId] || null
    },

    // 특정 게임의 사용자 베팅 현황 조회
    getUserBetStatus: (state) => (gameId) => {
      return state.userBetStatus[gameId] || null
    },

    // WebSocket 연결 상태
    isConnected: (state) => state.connected,

    // 현재 연결된 게임 ID
    getCurrentGameId: (state) => state.currentGameId,
  },

  actions: {
    // 📊 베팅 통계 조회 (REST API)
    async fetchBettingStats(gameId) {
      try {
        console.log('🔍 베팅 통계 조회 시도:', gameId)
        
        const response = await http.get(`/api/betting/games/${gameId}/stats`)
        this.bettingStats[gameId] = response.data
        
        console.log('✅ 베팅 통계 조회 성공:', response.data)
        return response.data
        
      } catch (error) {
        console.error('❌ 베팅 통계 조회 실패:', error)
        this.error = error.response?.data?.message || error.message
        
        // 404는 아직 베팅이 없는 상태이므로 기본값 설정
        if (error.response?.status === 404) {
          this.bettingStats[gameId] = {
            gameId: gameId,
            homeTeamName: '',
            awayTeamName: '',
            homeTeamBetPoints: 0,
            awayTeamBetPoints: 0,
            homeTeamBetCount: 0,
            awayTeamBetCount: 0,
            homeTeamOdds: 999.0,
            awayTeamOdds: 999.0,
            totalBetPoints: 0,
            totalBetCount: 0,
            lastUpdated: new Date()
          }
        }
        
        throw error
      }
    },

    // 👤 사용자 베팅 현황 조회 (REST API)
    async fetchUserBetStatus(gameId) {
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated) {
        console.log('ℹ️ 로그인되지 않은 사용자')
        return null
      }

      try {
        console.log('🔍 사용자 베팅 현황 조회 시도:', gameId)
        
        const response = await http.get(`/api/betting/games/${gameId}/my-status`)
        this.userBetStatus[gameId] = response.data
        
        console.log('✅ 사용자 베팅 현황 조회 성공:', response.data)
        return response.data
        
      } catch (error) {
        console.error('❌ 사용자 베팅 현황 조회 실패:', error)
        
        // 404는 아직 베팅하지 않은 상태이므로 기본값 설정
        if (error.response?.status === 404) {
          this.userBetStatus[gameId] = {
            gameId: gameId,
            totalBetPoints: 0,
            remainingPoints: 10000,
            predictedWinnerTeamId: null,
            betCount: 0,
            canBet: true
          }
        } else {
          this.error = error.response?.data?.message || error.message
        }
        
        return null
      }
    },

    // 🎯 베팅하기 (REST API)
    async placeBet(gameId, predictedWinnerTeamId, betPoints) {
      const authStore = useAuthStore()
      
      if (!authStore.isAuthenticated) {
        throw new Error('로그인이 필요합니다')
      }

      this.loading = true
      this.error = null

      try {
        console.log('🎯 베팅 요청:', { gameId, predictedWinnerTeamId, betPoints })
        
        const requestData = {
          gameId: gameId,
          predictedWinnerTeamId: predictedWinnerTeamId,
          betPoints: betPoints
        }
        
        const response = await http.post('/api/betting', requestData)
        
        console.log('✅ 베팅 성공:', response.data)
        
        // 베팅 후 최신 정보 갱신
        await Promise.all([
          this.fetchBettingStats(gameId),
          this.fetchUserBetStatus(gameId)
        ])
        
        return response.data
        
      } catch (error) {
        console.error('❌ 베팅 실패:', error)
        const errorMessage = error.response?.data?.message || error.message
        this.error = errorMessage
        throw new Error(errorMessage)
      } finally {
        this.loading = false
      }
    },

    // 🔌 WebSocket 연결 (베팅 실시간 업데이트용)
    async connectToBettingRoom(gameId) {
      try {
        // 기존 연결이 있으면 해제
        if (this.stompClient && this.stompClient.connected) {
          this.stompClient.deactivate()
        }

        this.currentGameId = gameId
        
        const fullSocketURL = socketURL + '/chat-socket'
        console.log('🔌 베팅 WebSocket 연결 시도:', fullSocketURL)
        
        // SockJS 인스턴스 생성 (기존 채팅과 동일한 엔드포인트 사용)
        const socket = new SockJS(fullSocketURL)
        
        // STOMP 클라이언트 생성
        this.stompClient = new Client({
          webSocketFactory: () => socket,
          connectHeaders: {},
          disconnectHeaders: {},
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          reconnectDelay: 5000,
          debug: (str) => {
            console.log('🔧 베팅 STOMP Debug:', str)
          }
        })
        
        // 연결 성공 콜백
        this.stompClient.onConnect = (frame) => {
          console.log('✅ 베팅 STOMP 연결 성공:', frame)
          this.connected = true
          
          // 베팅 통계 실시간 업데이트 구독
          this.stompClient.subscribe(`/topic/betting/${gameId}`, (message) => {
            console.log('📊 베팅 통계 실시간 업데이트 수신:', message.body)
            try {
              const updatedStats = JSON.parse(message.body)
              this.bettingStats[gameId] = updatedStats
              console.log('🔄 베팅 통계 업데이트 완료:', updatedStats)
            } catch (error) {
              console.error('❌ 베팅 통계 파싱 실패:', error)
            }
          })
          
          console.log(`📡 베팅 구독 완료: /topic/betting/${gameId}`)
          
          // 연결 후 초기 베팅 통계 요청
          this.requestBettingStatsViaWebSocket(gameId)
        }
        
        // 연결 실패 콜백
        this.stompClient.onStompError = (frame) => {
          console.error('❌ 베팅 STOMP 에러:', frame.headers['message'])
          console.error('세부사항:', frame.body)
          this.connected = false
        }
        
        // 연결 해제 콜백
        this.stompClient.onDisconnect = () => {
          console.log('🔌 베팅 STOMP 연결 해제')
          this.connected = false
        }
        
        // 연결 활성화
        this.stompClient.activate()
        
      } catch (error) {
        console.error('❌ 베팅 WebSocket 연결 실패:', error)
        this.connected = false
        throw error
      }
    },

    // 📡 WebSocket으로 베팅 통계 요청
    requestBettingStatsViaWebSocket(gameId) {
      if (!this.stompClient || !this.connected) {
        console.warn('⚠️ STOMP 연결이 없어 WebSocket 요청 불가')
        return
      }

      try {
        console.log('📡 WebSocket으로 베팅 통계 요청:', gameId)
        
        // 백엔드 BettingWebSocketController의 @MessageMapping 경로에 맞춤
        this.stompClient.publish({
          destination: `/app/betting.getStats/${gameId}`,
          body: JSON.stringify({ gameId: gameId })
        })
        
        console.log('✅ WebSocket 베팅 통계 요청 전송 완료')
        
      } catch (error) {
        console.error('❌ WebSocket 베팅 통계 요청 실패:', error)
      }
    },

    // 🔌 WebSocket 연결 해제
    disconnectFromBettingRoom() {
      console.log('🔌 베팅 WebSocket 연결 해제')
      
      if (this.stompClient && this.stompClient.connected) {
        this.stompClient.deactivate()
        this.stompClient = null
      }
      
      this.connected = false
      this.currentGameId = null
    },

    // 🧹 특정 게임의 베팅 데이터 초기화
    clearGameBettingData(gameId) {
      if (this.bettingStats[gameId]) {
        delete this.bettingStats[gameId]
      }
      if (this.userBetStatus[gameId]) {
        delete this.userBetStatus[gameId]
      }
    },

    // 🧹 모든 베팅 데이터 초기화
    clearAllBettingData() {
      this.bettingStats = {}
      this.userBetStatus = {}
      this.error = null
      this.loading = false
    },

    // 🔄 에러 상태 초기화
    clearError() {
      this.error = null
    },

    // 📊 베팅 통계 수동 갱신 (새로고침 등에 사용)
    async refreshBettingData(gameId) {
      console.log('🔄 베팅 데이터 수동 갱신 시작:', gameId)
      
      try {
        const promises = [this.fetchBettingStats(gameId)]
        
        // 로그인된 사용자인 경우에만 사용자 베팅 현황도 갱신
        const authStore = useAuthStore()
        if (authStore.isAuthenticated) {
          promises.push(this.fetchUserBetStatus(gameId))
        }
        
        await Promise.all(promises)
        console.log('✅ 베팅 데이터 수동 갱신 완료')
        
      } catch (error) {
        console.error('❌ 베팅 데이터 수동 갱신 실패:', error)
        throw error
      }
    }
  }
})