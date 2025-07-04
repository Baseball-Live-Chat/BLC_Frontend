// src/stores/chat.js
import { defineStore } from 'pinia'
import http, { socketURL } from '@/lib/http'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuthStore } from './auth'

export const useChatStore = defineStore('chat', {
  state: () => ({
    homeMessages: [],
    awayMessages: [],
    participants: 0,
    connected: false,
    currentGameId: null,
    currentGame: null,
    stompClient: null,
    selectedTeam: null,
    chatRooms: [],
    roomsLoading: false,
    roomsError: null,
    gameDetails: {},
    detailsLoading: false,
    detailsError: null,
    messagesLoading: false,
    messagesError: null,
    currentRoomId: null,
    countsByRoom: {},         // roomId별 { home, away } 카운트
    countsClient: null,       // counts 전용 STOMP 클라이언트
    reconnectCallbacks: [],   // WS 재연결 시 호출할 콜백 목록
    // 🆕 고정 채팅방 관련 상태
    isGeneralChat: false,
    generalMessages: [], // 고정 채팅방의 모든 메시지 (팀별 구분 없이)
  }),

  getters: {
    getHomeMessages: state => state.homeMessages,
    getAwayMessages: state => state.awayMessages,
    
    // 🆕 고정 채팅방과 경기별 채팅방 메시지를 구분해서 반환
    getAllMessages: state => {
      if (state.isGeneralChat) {
        // 고정 채팅방: generalMessages를 시간순으로 정렬
        return [...state.generalMessages].sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        )
      } else {
        // 경기별 채팅방: 기존 로직 (home/away 구분)
        const allMessages = [
          ...state.homeMessages.map(msg => ({ ...msg, team: 'home' })),
          ...state.awayMessages.map(msg => ({ ...msg, team: 'away' })),
        ]
        return allMessages.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        )
      }
    },
    
    getParticipants: state => state.participants,
    isConnected: state => state.connected,
    getSelectedTeam: state => state.selectedTeam,
    getCurrentGame: state => state.currentGame,
    roomsWithDetails: state =>
      state.chatRooms
        .map(room => ({
          ...room,
          game: room.gameId ? state.gameDetails[room.gameId] : null, // gameId가 null이면 game도 null
        }))
        .filter(item => room => room.gameId === null || item.game), // 고정 채팅방이거나 game 정보가 있는 경우만
  },

  actions: {
        // --- ① 초기 REST API로 counts 가져오기 ---
   async fetchCounts(roomIds) {
  try {
    // 배열을 반복 파라미터로 변환
    const qs = roomIds.map(id => `roomIds=${id}`).join('&')
    const res = await http.get(`/api/chats/rooms/counts?${qs}`)
    res.data.forEach(({ roomId, homeCount, awayCount }) => {
      this.countsByRoom[roomId] = { home: homeCount, away: awayCount }
    })
  } catch (e) {
    console.error('❌ 초기 counts 로드 실패', e)
  }
},

    // --- ② WebSocket으로 counts-delta 토픽 구독 (델타 전용) ---
    connectCountDeltaSubscriptions(roomIds) {
     // 이미 구독중이면 해제
     if (this.countsClient && this.countsClient.active) {
       this.countsClient.deactivate()
     }

     const socket = new SockJS(socketURL + '/chat-socket')
     const client = new Client({
      webSocketFactory: () => socket,
       reconnectDelay: 5000,
       debug: () => {}
     })

     client.onConnect = () => {
      roomIds.forEach(id => {
        client.subscribe(`/topic/game/${id}/counts-delta`, msg => {
          const { roomId, type } = JSON.parse(msg.body)
          // 없는 방이면 무시
          if (!this.countsByRoom[roomId]) return
          this.countsByRoom[roomId][type] += 1
        })
       })
       console.log('📡 counts 구독 완료', roomIds)
     }

     client.activate()
     this.countsClient = client
   },

    // --- ③ counts 구독 해제 ---
    disconnectCountDeltaSubscriptions() {
     if (this.countsClient && this.countsClient.active) {
       this.countsClient.deactivate()
       this.countsClient = null
     }
   },

   onReconnected(fn) {
      this.reconnectCallbacks.push(fn)
      // STOMP 클라이언트가 이미 있으면, disconnect 후 activate 시 callback 트리거
      if (this.countsClient) {
        const originalOnConnect = this.countsClient.onConnect
        this.countsClient.onConnect = async frame => {
          // 1) 기존 onConnect 동작
          if (originalOnConnect) originalOnConnect(frame)
          // 2) 재연결 콜백 실행
          for (const cb of this.reconnectCallbacks) {
            try { await cb() }
            catch (e) { console.error('🔄 재연결 콜백 오류', e) }
          }
        }
      }
    },

    /**
     * onReconnected 로 등록된 콜백을 모두 해제합니다.
     */
    offReconnected() {
      this.reconnectCallbacks = []
    },
    
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
        
        // 폴백 더미 데이터
        this.chatRooms = [
          {
            roomId: 1,
            gameId: null, // 고정 채팅방
            roomName: "⚾ 전체 야구 팬 채팅방",
            isActive: true,
            maxParticipants: 50000
          }
        ]
      } finally {
        this.roomsLoading = false
      }
    },

    // ✅ 2. 특정 경기 상세 조회 (기존과 동일)
    async fetchGameDetail(gameId) {
      try {
        console.log('🔍 경기 상세 조회 시도:', gameId)
        
        const res = await http.get(`/api/games/${gameId}`)
        this.gameDetails[gameId] = res.data
        
        console.log('✅ 경기 상세 조회 성공:', this.gameDetails[gameId])
      } catch (e) {
        console.error(`❌ 게임 상세 조회 실패: ${gameId}`, e)
        
        this.gameDetails[gameId] = {
          gameId: gameId,
          homeTeamName: "키움 히어로즈",
          awayTeamName: "두산 베어스",
          homeCode: "키움",
          awayCode: "두산",
          stadium: "잠실야구장",
          gameDateTime: new Date().toISOString()
        }
        throw e
      }
    },

    // ✅ 3. 활성 채팅방 + 경기 상세 정보 함께 조회
    async fetchActiveWithDetails() {
      this.detailsLoading = true
      this.detailsError = null
      
      try {
        await this.fetchChatRooms()
        
        // 🆕 gameId가 null이 아닌 방들만 경기 상세 조회
        const gameRooms = this.chatRooms.filter(room => room.gameId !== null)
        
        console.log('🔄 경기 상세 정보 병렬 조회 시작')
        await Promise.all(
          gameRooms.map(room => this.fetchGameDetail(room.gameId))
        )
        
        console.log('✅ 모든 경기 상세 조회 완료')
      } catch (e) {
        console.error('❌ 상세 정보 조회 실패:', e)
        this.detailsError = e.message
      } finally {
        this.detailsLoading = false
      }
    },

    // 🆕 4. 고정 채팅방 메시지 기록 조회
    async loadGeneralChatHistory(roomId) {
      this.messagesLoading = true
      this.messagesError = null
      
      try {
        console.log('📜 고정 채팅방 기록 조회:', roomId)
        
        const response = await http.get(`/api/chats/rooms/${roomId}`)
        const messages = response.data || []
        
        console.log('✅ 고정 채팅방 기록 로드 완료:', messages.length, '개 메시지')
        
        // 고정 채팅방 메시지 초기화
        this.generalMessages = []
        
        if (messages.length > 0) {
          messages.forEach(apiMessage => {
            const message = this.formatGeneralMessage(apiMessage)
            this.generalMessages.push(message)
          })
          
          console.log('📊 고정 채팅방 메시지 현황:', this.generalMessages.length, '개')
        } else {
          console.log('📭 고정 채팅방 기록이 없습니다')
        }
        
      } catch (error) {
        console.error('❌ 고정 채팅방 기록 로드 실패:', error)
        this.messagesError = error.response?.data?.message || error.message
        this.generalMessages = []
      } finally {
        this.messagesLoading = false
      }
    },

    // 🆕 5. 경기별 채팅방 메시지 기록 조회 (기존 로직 유지)
    async loadChatHistory(roomId) {
      this.messagesLoading = true
      this.messagesError = null
      
      try {
        console.log('📜 채팅 기록 조회:', roomId)
        
        const response = await http.get(`/api/chats/rooms/${roomId}`)
        const messages = response.data || []
        
        console.log('✅ 채팅 기록 로드 완료:', messages.length, '개 메시지')
        
        // 메시지 초기화 후 추가
        this.homeMessages = []
        this.awayMessages = []
        
        if (messages.length > 0) {
          messages.forEach(apiMessage => {
            const message = this.formatMessage(apiMessage)
            
            if (message.team === 'home') {
              this.homeMessages.push(message)
            } else if (message.team === 'away') {
              this.awayMessages.push(message)
            }
          })
          
          console.log('📊 최종 메시지 현황:', {
            home: this.homeMessages.length,
            away: this.awayMessages.length,
            total: this.homeMessages.length + this.awayMessages.length
          })
        }
        
      } catch (error) {
        console.error('❌ 채팅 기록 로드 실패:', error)
        this.messagesError = error.response?.data?.message || error.message
        
        this.homeMessages = []
        this.awayMessages = []
      } finally {
        this.messagesLoading = false
      }
    },

    // 🆕 6. 고정 채팅방 연결
    async connectToGeneralChat(roomId) {
      console.log('🎮 고정 채팅방 연결 시작:', roomId)
      
      this.currentRoomId = roomId
      this.currentGameId = 'general'
      this.currentGame = null
      this.isGeneralChat = true
      
      try {
        // 1단계: 기존 메시지 기록 로드
        await this.loadGeneralChatHistory(roomId)
        
        // 2단계: STOMP 연결
        await this.connectStomp()
        
        console.log('✅ 고정 채팅방 연결 완료')
        
      } catch (error) {
        console.error('❌ 고정 채팅방 연결 실패:', error)
      }
    },

    // 🆕 7. 게임 채팅방 연결 (기존 로직, 약간 수정)
    async connectToGame(gameId, gameData) {
      console.log('🎮 게임 연결 시작:', gameId, gameData?.homeTeamName, 'vs', gameData?.awayTeamName)
      
      this.currentGameId = gameId
      this.currentGame = gameData
      this.isGeneralChat = false
      
      // roomId 찾기
      const room = this.chatRooms.find(r => r.gameId == gameId)
      this.currentRoomId = room?.roomId || gameId
      
      try {
        // 1단계: 기존 메시지 기록 로드
        await this.loadChatHistory(this.currentRoomId)
        
        // 2단계: STOMP 연결
        await this.connectStomp()
        
        console.log('✅ 게임 연결 완료')
        
      } catch (error) {
        console.error('❌ 게임 연결 실패:', error)
      }
    },

    // 🆕 8. STOMP 클라이언트 연결 (SockJS 방식)
    async connectStomp() {
      try {
        // 기존 연결 해제
        if (this.stompClient && this.stompClient.connected) {
          this.stompClient.deactivate()
        }
        
        const fullSocketURL = socketURL + '/chat-socket'
        console.log('🔌 STOMP 연결 시도:', fullSocketURL)
        
        // SockJS 인스턴스 생성
        const socket = new SockJS(fullSocketURL)
        
        // STOMP 클라이언트 생성 (SockJS 사용)
        this.stompClient = new Client({
          webSocketFactory: () => socket,
          connectHeaders: {},
          disconnectHeaders: {},
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          reconnectDelay: 5000,
          debug: (str) => {
            console.log('🔧 STOMP Debug:', str)
          }
        })
        
        // 연결 성공
        this.stompClient.onConnect = (frame) => {
          console.log('✅ STOMP 연결 성공:', frame)
          this.connected = true
          
          // 구독할 토픽 결정
          let subscribeTopic
          if (this.isGeneralChat) {
            // 🆕 고정 채팅방: roomId 기반 토픽
            subscribeTopic = `/topic/room/${this.currentRoomId}`
          } else {
            // 경기별 채팅방: gameId 기반 토픽 (기존 방식)
            subscribeTopic = `/topic/game/${this.currentGameId}`
          }
          
          // 메시지 구독
          this.stompClient.subscribe(subscribeTopic, (message) => {
            console.log('📨 새 메시지 수신 (Raw):', message.body)
            try {
              const newMessage = JSON.parse(message.body)
              console.log('📨 파싱된 메시지:', newMessage)
              this.addMessage(newMessage)
            } catch (error) {
              console.error('❌ 메시지 파싱 실패:', error)
            }
          })
          
          console.log(`📡 구독 완료: ${subscribeTopic}`)
        }
        
        // 연결 실패
        this.stompClient.onStompError = (frame) => {
          console.error('❌ STOMP 에러:', frame.headers['message'])
          console.error('세부사항:', frame.body)
          this.connected = false
        }
        
        // 연결 해제
        this.stompClient.onDisconnect = () => {
          console.log('🔌 STOMP 연결 해제')
          this.connected = false
        }
        
        // 연결 활성화
        this.stompClient.activate()
        
      } catch (error) {
        console.error('❌ STOMP 연결 실패:', error)
        this.connected = false
      }
    },

    // 🆕 9. 메시지 전송 (고정 채팅방과 경기별 채팅방 구분)
    async sendMessage(content, teamId = null) {
      const targetTeamId = teamId || this.selectedTeam
      if (!targetTeamId || !content.trim()) {
        console.error('팀 선택 또는 메시지 내용이 없습니다')
        return
      }

      if (!this.stompClient || !this.connected) {
        console.error('STOMP 연결이 없습니다')
        return
      }

      // 🔐 Auth Store에서 사용자 정보 가져오기
      const authStore = useAuthStore()
      
      try {
        console.log('📤 STOMP 메시지 전송 시도:', { 
          content, 
          teamId: targetTeamId, 
          isGeneral: this.isGeneralChat,
          roomId: this.currentRoomId,
          gameId: this.currentGameId
        })
        
        // 🔄 teamId 변환 (경기별 채팅방에서 "home"/"away" → 1/2 변환)
        let numericTeamId = null  // ← 초기값과 함께 선언
        
        if (this.isGeneralChat) {
          // 고정 채팅방: teamId는 이미 숫자 (1-10)
          numericTeamId = parseInt(targetTeamId)
        } else {
          // 경기별 채팅방: "home"/"away" → 1/2 변환
          if (targetTeamId === 'home' || targetTeamId === 1) {
            numericTeamId = 1
          } else if (targetTeamId === 'away' || targetTeamId === 2) {
            numericTeamId = 2
          } else {
            console.error('알 수 없는 팀 ID:', targetTeamId)
            return
          }
        }
        
        // 유효성 검사
        if (!numericTeamId || isNaN(numericTeamId)) {
          console.error('유효하지 않은 팀 ID:', numericTeamId)
          return
        }
        
        // 🔄 사용자 인증 상태에 따라 메시지 요청 데이터 구성
        let messageRequest
        
        if (authStore.isAuthenticated && authStore.user) {
          // 로그인된 사용자 - 실제 userId 사용
          const userId = authStore.user.userId || authStore.user.id
          const nickname = authStore.user.nickname || authStore.user.username
          console.log('🔐 로그인된 사용자:', { userId, nickname })
          
          messageRequest = {
            userId: userId,
            teamId: numericTeamId,  // ← 숫자로 변환된 teamId 사용
            content: content.trim(),
            type: 'TEXT'
          }
        } else {
          // 익명 사용자 - userId: 0으로 전송
          console.log('👤 익명 사용자로 전송 (userId: 0)')
          
          messageRequest = {
            teamId: numericTeamId,  // ← 숫자로 변환된 teamId 사용
            content: content.trim(),
            type: 'TEXT'
          }
        }
        
        console.log('📋 실제 전송 데이터:', JSON.stringify(messageRequest))
        
        // 전송할 엔드포인트 결정
        let sendEndpoint
        if (this.isGeneralChat) {
          // 🆕 고정 채팅방: roomId 기반 엔드포인트
          sendEndpoint = `/app/chat.sendMessage/room/${this.currentRoomId}`
        } else {
          // 경기별 채팅방: gameId 기반 엔드포인트 (기존 방식)
          sendEndpoint = `/app/chat.sendMessage/${this.currentGameId}`
        }
        
        // STOMP로 메시지 전송
        this.stompClient.publish({
          destination: sendEndpoint,
          body: JSON.stringify(messageRequest)
        })
        
        console.log('✅ STOMP 메시지 전송 완료')
        
      } catch (error) {
        console.error('❌ 메시지 전송 실패:', error)
        
        // 실패 시 로컬에서라도 추가 (UX 개선)
        const authStore = useAuthStore()
        let localMessage
        
        if (authStore.isAuthenticated && authStore.user) {
          // 로그인된 사용자
          localMessage = {
            id: Date.now(),
            nickname: authStore.user.nickname || authStore.user.username || '나',
            content: content.trim(),
            timestamp: new Date(),
            // eslint-disable-next-line no-undef
            teamId: numericTeamId,
            type: 'TEXT',
            userId: authStore.user.userId || authStore.user.id
          }
        } else {
          // 익명 사용자 - userId: 0
          localMessage = {
            id: Date.now(),
            nickname: '익명',
            content: content.trim(),
            timestamp: new Date(),
            // eslint-disable-next-line no-undef
            teamId: numericTeamId,
            type: 'TEXT',
            userId: 0  // 익명 사용자는 0으로 설정
          }
        }
        this.addMessage(localMessage)
      }
    },

    // 🔄 10. 고정 채팅방 메시지 포맷 변환
    formatGeneralMessage(responseDto) {
      return {
        id: responseDto.messageId || Date.now(),
        nickname: responseDto.nickname || '익명',
        content: responseDto.content,
        timestamp: new Date(responseDto.createdAt || new Date()),
        teamId: responseDto.teamId, // 고정 채팅방에서는 teamId 그대로 사용 (1-10)
        messageType: responseDto.type,
        userId: responseDto.userId,
        profileImage: responseDto.profileImageUrl
      }
    },

    // 🔄 11. 경기별 채팅방 메시지 포맷 변환 (기존 로직)
    formatMessage(responseDto) {
      return {
        id: responseDto.messageId || Date.now(),
        nickname: responseDto.nickname || '익명',
        content: responseDto.content,
        timestamp: new Date(responseDto.createdAt || new Date()),
        team: this.getTeamByTeamId(responseDto.teamId), // Long teamId → "home"/"away" 변환
        teamId: responseDto.teamId,
        messageType: responseDto.type,
        userId: responseDto.userId,
        profileImage: responseDto.profileImageUrl
      }
    },

    // 🆕 TeamId를 team 문자열로 변환하는 헬퍼 함수 (경기별 채팅방용)
    getTeamByTeamId(teamId) {
      // teamId 1 = home, teamId 2 = away
      return teamId === 1 ? 'home' : 'away'
    },

    // ✅ 12. 메시지 추가 (고정 채팅방과 경기별 채팅방 구분)
    addMessage(message) {
      try {
        if (this.isGeneralChat) {
          // 고정 채팅방: generalMessages에 추가
          const formattedMessage = this.formatGeneralMessage(message)
          
          console.log('📝 고정 채팅방 메시지 추가:', formattedMessage)
          
          this.generalMessages = [...this.generalMessages, formattedMessage]
          if (this.generalMessages.length > 200) {
            this.generalMessages = this.generalMessages.slice(-200)
          }
          console.log('💬 고정 채팅방 메시지 추가됨. 총', this.generalMessages.length, '개')
          
        } else {
          // 경기별 채팅방: 기존 로직 (home/away 구분)
          const formattedMessage = this.formatMessage(message)
          
          console.log('📝 경기별 채팅방 메시지 추가:', formattedMessage)
          
          if (formattedMessage.team === 'home') {
            this.homeMessages = [...this.homeMessages, formattedMessage]
            if (this.homeMessages.length > 100) {
              this.homeMessages = this.homeMessages.slice(-100)
            }
            console.log('🏠 홈팀 메시지 추가됨. 총', this.homeMessages.length, '개')
          } else if (formattedMessage.team === 'away') {
            this.awayMessages = [...this.awayMessages, formattedMessage]
            if (this.awayMessages.length > 100) {
              this.awayMessages = this.awayMessages.slice(-100)
            }
            console.log('✈️ 원정팀 메시지 추가됨. 총', this.awayMessages.length, '개')
          }
        }
        
      } catch (error) {
        console.error('❌ 메시지 추가 실패:', error)
      }
    },

    // ✅ 13. 연결 해제
    disconnect() {
      console.log('🔌 채팅 연결 해제')
      
      if (this.stompClient && this.stompClient.connected) {
        this.stompClient.deactivate()
        this.stompClient = null
      }
      
      this.connected = false
      this.currentGameId = null
      this.currentGame = null
      this.currentRoomId = null
      this.homeMessages = []
      this.awayMessages = []
      this.generalMessages = []
      this.participants = 0
      this.selectedTeam = null
      this.isGeneralChat = false
    },

    // ✅ 14. 팀 선택
    setSelectedTeam(teamId) {
      this.selectedTeam = teamId
      console.log('🎯 선택된 팀:', teamId)
    },

    // ✅ 15. 참가자 수 설정
    setParticipants(count) {
      this.participants = count
    },
  },
})