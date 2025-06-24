// src/stores/chat.js
import { defineStore } from 'pinia'
import http from '@/lib/http'

export const useChatStore = defineStore('chat', {
  state: () => ({
    homeMessages: [],
    awayMessages: [],
    participants: 0,
    connected: false,
    currentGameId: null,
    currentGame: null,
    socket: null,
    selectedTeam: null, // 'home' 또는 'away'
    messageInterval: null,
    chatRooms: [],
    roomsLoading: false,
    roomsError: null,
    gameDetails: {}, // { [gameId]: GameDetailInfo }
    detailsLoading: false,
    detailsError: null,
  }),

  getters: {
    getHomeMessages: state => state.homeMessages,
    getAwayMessages: state => state.awayMessages,
    getAllMessages: state => {
      // 시간순으로 정렬된 전체 메시지 (team 속성 포함)
      const allMessages = [
        ...state.homeMessages.map(msg => ({ ...msg, team: 'home' })),
        ...state.awayMessages.map(msg => ({ ...msg, team: 'away' })),
      ]
      return allMessages.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      )
    },
    getParticipants: state => state.participants,
    isConnected: state => state.connected,
    getSelectedTeam: state => state.selectedTeam,
    getCurrentGame: state => state.currentGame,
    // chatRooms와 gameDetails를 합쳐서 각 원소에 gameDetail 속성 붙인 배열
    roomsWithDetails: state =>
      state.chatRooms
        .map(room => ({
          ...room,
          game: state.gameDetails[room.gameId], // GameDetailInfo
        }))
        .filter(item => item.game), // 상세 없는 건 제외
  },

  actions: {
    // ✅ 1. 활성 채팅방 목록 조회
    async fetchChatRooms() {
      this.roomsLoading = true
      this.roomsError = null
      try {
        console.log('🔍 채팅방 목록 조회 시도')
        
        const res = await http.get('/api/chat-rooms')
        this.chatRooms = res.data
        
        console.log('✅ 채팅방 목록:', this.chatRooms)
      } catch (err) {
        console.error('❌ 채팅방 목록 조회 실패:', err)
        this.roomsError = err.response?.data?.message || err.message
        
        // 🚨 API 실패 시 임시 더미 데이터 (개발 중에만)
        console.log('⚠️ API 실패로 더미 채팅방 데이터 사용')
        this.chatRooms = [
          {
            roomId: 1,
            gameId: 1,
            roomName: "두산 vs LG 경기 채팅",
            isActive: true,
            maxParticipants: 10000
          },
          {
            roomId: 2,
            gameId: 2,
            roomName: "삼성 vs 기아 경기 채팅",
            isActive: true,
            maxParticipants: 10000
          }
        ]
      } finally {
        this.roomsLoading = false
      }
    },

    // ✅ 2. 특정 경기 상세 조회 (Game API 호출)
    async fetchGameDetail(gameId) {
      try {
        console.log('🔍 경기 상세 조회 시도:', gameId)
        
        const res = await http.get(`/api/games/${gameId}`)
        this.gameDetails[gameId] = res.data
        
        console.log('✅ 경기 상세 조회 성공:', this.gameDetails[gameId])
      } catch (e) {
        console.error(`❌ 게임 상세 조회 실패: ${gameId}`, e)
        
        // 🚨 API 실패 시 임시 더미 데이터
        this.gameDetails[gameId] = {
          gameId: gameId,
          homeTeam: { teamName: "홈팀", teamCode: "HOME" },
          awayTeam: { teamName: "원정팀", teamCode: "AWAY" },
          stadium: "미정",
          gameDate: new Date().toISOString()
        }
        throw e
      }
    },

    // ✅ 3. 활성 채팅방 + 경기 상세 정보 함께 조회
    async fetchActiveWithDetails() {
      this.detailsLoading = true
      this.detailsError = null
      
      try {
        // 1단계: 채팅방 목록 조회
        await this.fetchChatRooms()
        
        // 2단계: 각 채팅방의 경기 상세 정보를 병렬로 조회
        console.log('🔄 경기 상세 정보 병렬 조회 시작')
        await Promise.all(
          this.chatRooms.map(room => this.fetchGameDetail(room.gameId))
        )
        
        console.log('✅ 모든 경기 상세 조회 완료')
      } catch (e) {
        console.error('❌ 상세 정보 조회 실패:', e)
        this.detailsError = e.message
      } finally {
        this.detailsLoading = false
      }
    },

    // 🔄 기존 connectToGame 메소드는 일단 유지 (소켓 연결 전까지)
    connectToGame(gameId, gameData) {
      console.log('🎮 게임 연결:', gameId, gameData)
      
      this.currentGameId = gameId
      this.currentGame = gameData
      this.connected = true

      // TODO: 실제 WebSocket 연결 (2단계에서 구현)
      // this.socket = io(`/game-${gameId}`)
      // this.socket.on('newMessage', this.addMessage)
      // this.socket.on('participantCount', this.setParticipants)

      // 🧹 기존 메시지 초기화
      this.homeMessages = []
      this.awayMessages = []

      // ⚠️ 임시 데이터 로드 (2단계에서 삭제 예정)
      this.loadInitialMessages(gameId)
      this.participants = Math.floor(Math.random() * 1000) + 500

      // ⚠️ 임시 실시간 메시지 시뮬레이션 (2단계에서 삭제 예정)
      this.startMessageSimulation()
    },

    disconnect() {
      console.log('🔌 연결 해제')
      
      if (this.socket) {
        this.socket.disconnect()
        this.socket = null
      }
      this.connected = false
      this.currentGameId = null
      this.currentGame = null
      this.homeMessages = []
      this.awayMessages = []
      this.participants = 0
      this.selectedTeam = null

      // 시뮬레이션 중지
      if (this.messageInterval) {
        clearInterval(this.messageInterval)
        this.messageInterval = null
      }
    },

    setSelectedTeam(team) {
      this.selectedTeam = team
      console.log('선택된 팀:', team)
    },

    // ⚠️ 임시 메소드들 (2단계에서 삭제 예정)
    sendMessage(content, team = null) {
      const targetTeam = team || this.selectedTeam
      if (!targetTeam) {
        console.error('팀을 선택해주세요')
        return
      }

      console.log('메시지 전송:', { content, team: targetTeam })

      const message = {
        id: Date.now(),
        nickname: '👤나',
        content,
        timestamp: new Date(),
        gameId: this.currentGameId,
        team: targetTeam,
      }

      this.addMessage(message)

      // 자동 응답 시뮬레이션 (반대팀에서 응답)
      setTimeout(() => {
        this.simulateAutoResponse(targetTeam)
      }, 1000 + Math.random() * 3000)
    },

    addMessage(message) {
      const messageData = {
        id: message.id || Date.now(),
        nickname: message.nickname,
        content: message.content,
        timestamp: message.timestamp || new Date(),
      }

      console.log('메시지 추가:', { messageData, team: message.team })

      if (message.team === 'home') {
        this.homeMessages.push(messageData)
        if (this.homeMessages.length > 50) {
          this.homeMessages = this.homeMessages.slice(-50)
        }
      } else if (message.team === 'away') {
        this.awayMessages.push(messageData)
        if (this.awayMessages.length > 50) {
          this.awayMessages = this.awayMessages.slice(-50)
        }
      }
    },

    setParticipants(count) {
      this.participants = count
    },

    // ⚠️ 이하 임시 메소드들은 2단계에서 삭제 예정
    loadInitialMessages(gameId) {
      // 홈팀 초기 메시지들
      const homeInitialMessages = [
        {
          id: 1,
          nickname: '⭐홈팬123',
          content: '홈팀 화이팅! 오늘도 승리하자!',
          timestamp: new Date(Date.now() - 300000),
          team: 'home',
        },
        // ... 더 많은 더미 메시지들
      ]

      // 원정팀 초기 메시지들
      const awayInitialMessages = [
        {
          id: 2,
          nickname: '⚾원정팬456',
          content: '원정에서도 화이팅! 역전하자!',
          timestamp: new Date(Date.now() - 240000),
          team: 'away',
        },
        // ... 더 많은 더미 메시지들
      ]

      homeInitialMessages.forEach(msg => this.addMessage(msg))
      awayInitialMessages.forEach(msg => this.addMessage(msg))
    },

    startMessageSimulation() {
      // 3-8초마다 랜덤 메시지 생성
      this.messageInterval = setInterval(() => {
        if (!this.connected) return

        const teams = ['home', 'away']
        const randomTeam = teams[Math.floor(Math.random() * teams.length)]
        
        const messages = [
          '화이팅!', '좋은 플레이!', '홈런 나와라!', 
          '수비 집중!', '끝까지 응원!', '역전하자!'
        ]
        const randomMessage = messages[Math.floor(Math.random() * messages.length)]

        const message = {
          id: Date.now() + Math.random(),
          nickname: randomTeam === 'home' ? '🏠홈팬' : '✈️원정팬',
          content: randomMessage,
          timestamp: new Date(),
          team: randomTeam,
        }

        this.addMessage(message)
      }, 3000 + Math.random() * 5000)
    },

    simulateAutoResponse(originalTeam) {
      const oppositeTeam = originalTeam === 'home' ? 'away' : 'home'
      const responses = [
        '우리도 화이팅!', '좋은 경기!', '응원 열심히!', 
        '끝까지 최선을!', '파이팅!'
      ]
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      
      const responseMessage = {
        id: Date.now() + Math.random(),
        nickname: oppositeTeam === 'home' ? '🏠홈응원단' : '✈️원정응원단',
        content: randomResponse,
        timestamp: new Date(),
        team: oppositeTeam,
      }

      this.addMessage(responseMessage)
    },
  },
})
