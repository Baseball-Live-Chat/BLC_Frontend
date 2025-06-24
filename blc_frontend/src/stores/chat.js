// src/stores/chat.js - STOMP 방식으로 수정
import { defineStore } from 'pinia'
import http from '@/lib/http'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'  // SockJS import 추가

export const useChatStore = defineStore('chat', {
  state: () => ({
    homeMessages: [],
    awayMessages: [],
    participants: 0,
    connected: false,
    currentGameId: null,
    currentGame: null,
    stompClient: null, // STOMP 클라이언트
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
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
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

    // 🆕 4. 채팅방 메시지 기록 조회
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
        
        messages.forEach(apiMessage => {
          const message = this.formatMessage(apiMessage)
          if (message.team === 'home') {
            this.homeMessages.push(message)
          } else if (message.team === 'away') {
            this.awayMessages.push(message)
          }
        })
        
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
        
        console.log('🔌 STOMP 연결 시도 (SockJS 방식):', 'http://localhost:8080/chat-socket')
        
        // SockJS 인스턴스 생성
        const socket = new SockJS('http://localhost:8080/chat-socket')
        
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
            console.log('📨 새 메시지 수신:', message.body)
            const newMessage = JSON.parse(message.body)
            this.addMessage(newMessage)
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

    // 🆕 7. 메시지 전송 (STOMP 사용)
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

      try {
        console.log('📤 STOMP 메시지 전송 시도:', { content, team: targetTeam, gameId: this.currentGameId })
        
        const messageRequest = {
          userId: 1, // TODO: 실제 사용자 ID
          messageContent: content.trim(),
          messageType: 'TEXT',
          team: targetTeam
        }
        
        // STOMP로 메시지 전송 (백엔드에서 자동으로 저장 + 브로드캐스트)
        this.stompClient.publish({
          destination: `/app/chat.sendMessage/${this.currentGameId}`,
          body: JSON.stringify(messageRequest)
        })
        
        console.log('✅ STOMP 메시지 전송 완료')
        
      } catch (error) {
        console.error('❌ 메시지 전송 실패:', error)
        
        // 실패 시 로컬에서라도 추가 (UX 개선)
        const localMessage = {
          id: Date.now(),
          nickname: '👤나',
          content: content.trim(),
          timestamp: new Date(),
          team: targetTeam,
          messageType: 'TEXT'
        }
        this.addMessage(localMessage)
      }
    },

    // 🔄 8. 메시지 포맷 변환 (백엔드 → 프론트엔드)
    formatMessage(apiMessage) {
      return {
        id: apiMessage.messageId || apiMessage.id || Date.now(),
        nickname: apiMessage.user?.nickname || apiMessage.nickname || '익명',
        content: apiMessage.messageContent || apiMessage.content,
        timestamp: new Date(apiMessage.createdAt || apiMessage.timestamp),
        team: apiMessage.team || 'home',
        messageType: apiMessage.messageType || 'TEXT',
        profileImage: apiMessage.user?.profileImageUrl
      }
    },

    // ✅ 9. 메시지 추가 (로컬 상태 업데이트)
    addMessage(message) {
      const formattedMessage = message.messageId ? this.formatMessage(message) : message
      
      console.log('📝 메시지 추가:', formattedMessage)

      if (formattedMessage.team === 'home') {
        this.homeMessages.push(formattedMessage)
        if (this.homeMessages.length > 100) {
          this.homeMessages = this.homeMessages.slice(-100)
        }
      } else if (formattedMessage.team === 'away') {
        this.awayMessages.push(formattedMessage)
        if (this.awayMessages.length > 100) {
          this.awayMessages = this.awayMessages.slice(-100)
        }
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