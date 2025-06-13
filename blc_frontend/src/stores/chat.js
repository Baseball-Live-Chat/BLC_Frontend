// src/stores/chat.js
import { defineStore } from 'pinia'

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
  }),

  getters: {
    getHomeMessages: state => state.homeMessages,
    getAwayMessages: state => state.awayMessages,
    getAllMessages: state => {
      // 시간순으로 정렬된 전체 메시지
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
  },

  actions: {
    connectToGame(gameId, gameData) {
      this.currentGameId = gameId
      this.currentGame = gameData
      this.connected = true

      // TODO: 실제 WebSocket 연결
      // this.socket = io(`/game-${gameId}`)
      // this.socket.on('newMessage', this.addMessage)
      // this.socket.on('participantCount', this.setParticipants)

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
    },

    sendMessage(content, team = null) {
      const targetTeam = team || this.selectedTeam
      if (!targetTeam) {
        console.error('팀을 선택해주세요')
        return
      }

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

      // 자동 응답 시뮬레이션
      this.simulateAutoResponse(targetTeam)
    },

    addMessage(message) {
      const messageData = {
        id: message.id || Date.now(),
        nickname: message.nickname,
        content: message.content,
        timestamp: message.timestamp || new Date(),
      }

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
    },

    setParticipants(count) {
      this.participants = count
    },

    loadInitialMessages(gameId) {
      // 홈팀 초기 메시지들
      const homeInitialMessages = [
        {
          id: 1,
          nickname: '⭐홈팀팬123',
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
      ]

      homeInitialMessages.forEach(msg => this.addMessage(msg))
      awayInitialMessages.forEach(msg => this.addMessage(msg))
    },

    startMessageSimulation() {
      this.messageInterval = setInterval(() => {
        if (Math.random() < 0.3) {
          // 30% 확률로 새 메시지
          this.addRandomMessage()
        }
      }, 5000) // 5초마다 체크
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
      ]

      const awayMessages = [
        '원정팀도 화이팅!',
        '역전 기회다!',
        '끝까지 응원합니다!',
        '좋은 플레이!',
        '집중해서 응원!',
      ]

      const messages = randomTeam === 'home' ? homeMessages : awayMessages
      const randomMessage =
        messages[Math.floor(Math.random() * messages.length)]

      const nicknames =
        randomTeam === 'home'
          ? ['🏠홈팬', '⚾홈응원', '🔥홈매니아', '⭐홈관전']
          : ['✈️원정팬', '🚌원정응원', '💪원정매니아', '🎯원정관전']

      const randomNickname =
        nicknames[Math.floor(Math.random() * nicknames.length)]

      this.addMessage({
        id: Date.now() + Math.random(),
        nickname: randomNickname,
        content: randomMessage,
        timestamp: new Date(),
        team: randomTeam,
      })
    },

    simulateAutoResponse(targetTeam) {
      setTimeout(
        () => {
          const responses = {
            home: ['홈팀 응원 감사합니다!', '함께 응원해요!', '홈팀 파이팅!'],
            away: [
              '원정팀도 화이팅!',
              '끝까지 응원합시다!',
              '좋은 경기 만들어요!',
            ],
          }
          const teamResponses = responses[targetTeam]
          const randomResponse =
            teamResponses[Math.floor(Math.random() * teamResponses.length)]

          this.addMessage({
            id: Date.now() + Math.random(),
            nickname: targetTeam === 'home' ? '🏠홈팬' : '✈️원정팬',
            content: randomResponse,
            timestamp: new Date(),
            team: targetTeam,
          })
        },
        1000 + Math.random() * 2000
      ) // 1-3초 후 응답
    },
  },
})
