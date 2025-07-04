import { defineStore } from 'pinia'
import http, { socketURL } from '@/lib/http'  // ⭐ socketURL 추가 import
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuthStore } from './auth' // ← Auth Store import 추가

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
  }),

  getters: {
    getHomeMessages: state => state.homeMessages,
    getAwayMessages: state => state.awayMessages,
    getAllMessages: state => {
      const allMessages = [
        ...state.homeMessages.map(msg => ({ ...msg, team: 'home' })),
        ...state.awayMessages.map(msg => ({ ...msg, team: 'away' })),
      ]
      return allMessages.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)  // 시간순 정렬
      )
    },
    getParticipants: state => state.participants,
    isConnected: state => state.connected,
    getSelectedTeam: state => state.selectedTeam,
    getCurrentGame: state => state.currentGame,
    roomsWithDetails: state =>
      state.chatRooms
        .map(room => ({
          ...room,
          game: state.gameDetails[room.gameId],
        }))
        .filter(item => item.game),
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
            gameId: 1,
            roomName: "키움 vs 두산 경기 채팅",
            isActive: true,
            maxParticipants: 10000
          }
        ]
      } finally {
        this.roomsLoading = false
      }
    },

    // ✅ 2. 특정 경기 상세 조회
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

    // 🆕 4. 채팅방 메시지 기록 조회 (강화)
    async loadChatHistory(roomId) {
      this.messagesLoading = true
      this.messagesError = null
      
      try {
        console.log('📜 채팅 기록 조회:', roomId)
        
        const response = await http.get(`/api/chats/rooms/${roomId}`)
        const messages = response.data || []
        
        console.log('✅ 채팅 기록 로드 완료:', messages.length, '개 메시지')
        console.log('📋 메시지 상세:', messages)
        
        // 메시지 초기화 후 추가
        this.homeMessages = []
        this.awayMessages = []
        
        if (messages.length > 0) {
          messages.forEach(apiMessage => {
            console.log('🔄 메시지 변환 중:', apiMessage)
            const message = this.formatMessage(apiMessage)
            console.log('✅ 변환된 메시지:', message)
            
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
        } else {
          console.log('📭 채팅 기록이 없습니다')
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

    // 🆕 5. 게임 채팅방 연결 (기존 메시지 + STOMP 연결)
    async connectToGame(gameId, gameData) {
      console.log('🎮 게임 연결 시작:', gameId, gameData?.homeTeamName, 'vs', gameData?.awayTeamName)
      
      this.currentGameId = gameId
      this.currentGame = gameData
      
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

    // 🆕 6. STOMP 클라이언트 연결 (SockJS 방식 - 완전 수정)
    async connectStomp() {
      try {
        // 기존 연결 해제
        if (this.stompClient && this.stompClient.connected) {
          this.stompClient.deactivate()
        }
        
        const fullSocketURL = socketURL + '/chat-socket'  // ⭐ socketURL 사용
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
          
          // 게임별 메시지 구독
          this.stompClient.subscribe(`/topic/game/${this.currentGameId}`, (message) => {
            console.log('📨 새 메시지 수신 (Raw):', message.body)
            try {
              const newMessage = JSON.parse(message.body)
              console.log('📨 파싱된 메시지:', newMessage)
              this.addMessage(newMessage)
            } catch (error) {
              console.error('❌ 메시지 파싱 실패:', error)
            }
          })
          
          console.log(`📡 구독 완료: /topic/game/${this.currentGameId}`)
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

    // 🆕 7. 메시지 전송 (실제 사용자 ID 사용)
    async sendMessage(content, team = null) {
      const targetTeam = team || this.selectedTeam
      if (!targetTeam || !content.trim()) {
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
          team: targetTeam, 
          gameId: this.currentGameId,
          isAuthenticated: authStore.isAuthenticated,
          user: authStore.user
        })
        
        // 🔄 사용자 인증 상태에 따라 메시지 요청 데이터 구성
        let messageRequest
        
        if (authStore.isAuthenticated && authStore.user) {
          // 로그인된 사용자 - 실제 userId 사용
          const userId = authStore.user.userId || authStore.user.id
          const nickname = authStore.user.nickname || authStore.user.username
          console.log('🔐 로그인된 사용자:', { userId, nickname })
          
          messageRequest = {
            userId: userId,
            teamId: targetTeam === 'home' ? 1 : 2,
            content: content.trim(),
            type: 'TEXT'
          }
        } else {
          // 익명 사용자 - userId: 0으로 전송
          console.log('👤 익명 사용자로 전송 (userId: 0)')
          
          messageRequest = {
            teamId: targetTeam === 'home' ? 1 : 2,
            content: content.trim(),
            type: 'TEXT'
          }
        }
        
        console.log('📋 실제 전송 데이터:', JSON.stringify(messageRequest))
        
        // STOMP로 메시지 전송
        this.stompClient.publish({
          destination: `/app/chat.sendMessage/${this.currentGameId}`,
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
            team: targetTeam,
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
            team: targetTeam,
            type: 'TEXT',
            userId: 0  // 익명 사용자는 0으로 설정
          }
        }
        this.addMessage(localMessage)
      }
    },

    // 🔄 8. 메시지 포맷 변환 (백엔드 ChatMessageResponseDto → 프론트엔드)
    formatMessage(responseDto) {
      return {
        id: responseDto.messageId || Date.now(),
        nickname: responseDto.nickname || '익명',     // 백엔드에서 제공하는 nickname
        content: responseDto.content,                // String 그대로
        timestamp: new Date(responseDto.createdAt || new Date()),
        team: this.getTeamByTeamId(responseDto.teamId), // Long teamId → "home"/"away" 변환
        messageType: responseDto.type,               // MessageType enum
        userId: responseDto.userId,                  // 사용자 ID 보존
        profileImage: responseDto.profileImageUrl    // 프로필 이미지 (있다면)
      }
    },

    // 🆕 TeamId를 team 문자열로 변환하는 헬퍼 함수
    getTeamByTeamId(teamId) {
      // teamId 1 = home, teamId 2 = away
      return teamId === 1 ? 'home' : 'away'
    },

    // ✅ 9. 메시지 추가 (Vue 반응성 보장) - 수정
    addMessage(message) {
      try {
        const formattedMessage = this.formatMessage(message)
        
        console.log('📝 메시지 추가 시도:', formattedMessage)
        console.log('🎯 팀 정보:', formattedMessage.team)

        if (formattedMessage.team === 'home') {
          // ✅ Vue 반응성을 위해 새 배열로 교체
          this.homeMessages = [...this.homeMessages, formattedMessage]
          if (this.homeMessages.length > 100) {
            this.homeMessages = this.homeMessages.slice(-100)
          }
          console.log('🏠 홈팀 메시지 추가됨. 총', this.homeMessages.length, '개')
        } else if (formattedMessage.team === 'away') {
          // ✅ Vue 반응성을 위해 새 배열로 교체
          this.awayMessages = [...this.awayMessages, formattedMessage]
          if (this.awayMessages.length > 100) {
            this.awayMessages = this.awayMessages.slice(-100)
          }
          console.log('✈️ 원정팀 메시지 추가됨. 총', this.awayMessages.length, '개')
        } else {
          console.warn('⚠️ 알 수 없는 팀:', formattedMessage.team)
        }
        
        console.log('📊 현재 메시지 현황:', {
          home: this.homeMessages.length,
          away: this.awayMessages.length,
          total: this.getAllMessages.length
        })
        
      } catch (error) {
        console.error('❌ 메시지 추가 실패:', error)
      }
    },

    // ✅ 10. 연결 해제
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
      this.participants = 0
      this.selectedTeam = null
    },

    // ✅ 11. 팀 선택
    setSelectedTeam(team) {
      this.selectedTeam = team
      console.log('🎯 선택된 팀:', team)
    },

    // ✅ 12. 참가자 수 설정
    setParticipants(count) {
      this.participants = count
    },
  },
})