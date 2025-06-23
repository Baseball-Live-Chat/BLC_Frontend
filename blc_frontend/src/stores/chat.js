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
    gameDetails: {}, // ← 추가: { [gameId]: GameDetailInfo }
    detailsLoading: false, // (선택) 전체 gameDetails 로딩 플래그
    detailsError: null, // (선택) 상세 조회 에러
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
    // (4) chatRooms 와 gameDetails 를 합쳐서, 각 원소에 gameDetail 속성 붙인 배열
    roomsWithDetails: state =>
      state.chatRooms
        .map(room => ({
          ...room,
          game: state.gameDetails[room.gameId], // GameDetailInfo
        }))
        .filter(item => item.game), // 상세 없는 건 제외
  },

  actions: {
    async fetchChatRooms() {
      this.roomsLoading = true
      this.roomsError = null
      try {
        const res = await http.get('/api/chat-rooms')
        this.chatRooms = res.data
      } catch (err) {
        this.roomsError = err.response?.data?.message || err.message
      } finally {
        this.roomsLoading = false
      }
    },
    // (2) 특정 gameId 상세 조회
    async fetchGameDetail(gameId) {
      try {
        const res = await http.get(`/api/games/${gameId}`)
        this.gameDetails[gameId] = res.data
      } catch (e) {
        console.error(`게임 상세 조회 실패: ${gameId}`, e)
        throw e
      }
    },
    // (3) 활성 채팅방 전부 가져온 뒤, 거기에 딸린 게임 상세를 한 번에 조회
    async fetchActiveWithDetails() {
      this.detailsLoading = true
      this.detailsError = null
      await this.fetchChatRooms()
      try {
        // Promise.all 으로 병렬 조회
        await Promise.all(
          this.chatRooms.map(room => this.fetchGameDetail(room.gameId))
        )
      } catch (e) {
        this.detailsError = e.message
      } finally {
        this.detailsLoading = false
      }
    },
    connectToGame(gameId, gameData) {
      this.currentGameId = gameId
      this.currentGame = gameData
      this.connected = true

      // TODO: 실제 WebSocket 연결
      // this.socket = io(`/game-${gameId}`)
      // this.socket.on('newMessage', this.addMessage)
      // this.socket.on('participantCount', this.setParticipants)

      // 기존 메시지 초기화
      this.homeMessages = []
      this.awayMessages = []

      // 임시 데이터 로드
      this.loadInitialMessages(gameId)
      this.participants = Math.floor(Math.random() * 1000) + 500

      // 임시 실시간 메시지 시뮬레이션
      this.startMessageSimulation()
    },

    disconnect() {
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

      // TODO: 실제 WebSocket으로 메시지 전송
      // this.socket.emit('sendMessage', message)

      // 자동 응답 시뮬레이션 (반대팀에서 응답)
      setTimeout(
        () => {
          this.simulateAutoResponse(targetTeam)
        },
        1000 + Math.random() * 3000
      )
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
        // 메시지 개수 제한 (최대 50개)
        if (this.homeMessages.length > 50) {
          this.homeMessages = this.homeMessages.slice(-50)
        }
      } else if (message.team === 'away') {
        this.awayMessages.push(messageData)
        // 메시지 개수 제한 (최대 50개)
        if (this.awayMessages.length > 50) {
          this.awayMessages = this.awayMessages.slice(-50)
        }
      }

      console.log('현재 메시지 상태:', {
        home: this.homeMessages.length,
        away: this.awayMessages.length,
      })
    },

    setParticipants(count) {
      this.participants = count
    },

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
        {
          id: 3,
          nickname: '🔥홈팀매니아',
          content: '분위기 좋다! 이대로 쭉~',
          timestamp: new Date(Date.now() - 180000),
          team: 'home',
        },
        {
          id: 5,
          nickname: '🏠홈그라운드',
          content: '홈에서 이기자! 파이팅!',
          timestamp: new Date(Date.now() - 100000),
          team: 'home',
        },
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
        {
          id: 4,
          nickname: '🏟️원정응원단',
          content: '아직 안 끝났어요! 끝까지 응원!',
          timestamp: new Date(Date.now() - 120000),
          team: 'away',
        },
        {
          id: 6,
          nickname: '✈️원정전사',
          content: '멀리서 와서 응원한다! 화이팅!',
          timestamp: new Date(Date.now() - 60000),
          team: 'away',
        },
      ]

      homeInitialMessages.forEach(msg => this.addMessage(msg))
      awayInitialMessages.forEach(msg => this.addMessage(msg))
    },

    startMessageSimulation() {
      this.messageInterval = setInterval(() => {
        if (Math.random() < 0.4) {
          // 40% 확률로 새 메시지
          this.addRandomMessage()
        }
      }, 4000) // 4초마다 체크
    },

    addRandomMessage() {
      const teams = ['home', 'away']
      const randomTeam = teams[Math.floor(Math.random() * teams.length)]

      const homeMessages = [
        '홈팀 화이팅!',
        '좋은 경기네요!',
        '홈런 기대해봅니다!',
        '수비 잘하고 있어요!',
        '분위기 최고!',
        '오늘은 이긴다!',
        '홈에서 승리하자!',
      ]

      const awayMessages = [
        '원정팀도 화이팅!',
        '역전 기회다!',
        '끝까지 응원합니다!',
        '좋은 플레이!',
        '집중해서 응원!',
        '멀리서 왔는데 보람있게!',
        '원정승 가자!',
      ]

      const messages = randomTeam === 'home' ? homeMessages : awayMessages
      const randomMessage =
        messages[Math.floor(Math.random() * messages.length)]

      const homeNicknames = [
        '🏠홈팬A',
        '⭐홈그라운드',
        '🔥홈응원단',
        '💪홈파워',
        '🎉홈승리',
      ]

      const awayNicknames = [
        '✈️원정팬B',
        '🚌원정응원',
        '⚾원정전사',
        '🏟️원정단',
        '💙원정파워',
      ]

      const nicknames = randomTeam === 'home' ? homeNicknames : awayNicknames
      const randomNickname =
        nicknames[Math.floor(Math.random() * nicknames.length)]

      const newMessage = {
        id: Date.now() + Math.random(),
        nickname: randomNickname,
        content: randomMessage,
        timestamp: new Date(),
        team: randomTeam,
      }

      this.addMessage(newMessage)
    },

    simulateAutoResponse(originalTeam) {
      // 반대팀에서 응답
      const responseTeam = originalTeam === 'home' ? 'away' : 'home'

      const responses = [
        '우리도 화이팅!',
        '좋은 경기하자!',
        '열심히 응원할게요!',
        '파이팅!',
        '좋은 플레이 기대해요!',
      ]

      const responseNicknames =
        responseTeam === 'home'
          ? ['🏠응답팬', '⭐홈응답', '🔥홈팬응답']
          : ['✈️원정응답', '⚾응답팬', '🏟️원정응답']

      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)]
      const randomNickname =
        responseNicknames[Math.floor(Math.random() * responseNicknames.length)]

      const responseMessage = {
        id: Date.now() + Math.random(),
        nickname: randomNickname,
        content: randomResponse,
        timestamp: new Date(),
        team: responseTeam,
      }

      this.addMessage(responseMessage)
    },
  },
})
