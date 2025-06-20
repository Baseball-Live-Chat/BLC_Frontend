// src/stores/chat.js - WebSocket 실시간 채팅 구현
import { defineStore } from 'pinia'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export const useChatStore = defineStore('chat', {
  state: () => ({
    // 실시간 메시지만 저장 (기존 메시지 없음)
    messages: [],
    connected: false,
    currentGameId: null,
    currentGame: null,
    stompClient: null,
    selectedTeam: null, // 'home' 또는 'away'
    participants: 0,
    connectionError: null,
  }),

  getters: {
    // 홈팀 메시지 필터링
    getHomeMessages: state => {
      if (!state.currentGame) return []
      return state.messages.filter(
        msg =>
          msg.teamId === state.currentGame.homeTeamId || msg.team === 'home'
      )
    },

    // 원정팀 메시지 필터링
    getAwayMessages: state => {
      if (!state.currentGame) return []
      return state.messages.filter(
        msg =>
          msg.teamId === state.currentGame.awayTeamId || msg.team === 'away'
      )
    },

    // 전체 메시지 (시간순 정렬)
    getAllMessages: state => {
      return [...state.messages].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      )
    },

    getParticipants: state => state.participants,
    isConnected: state => state.connected,
    getSelectedTeam: state => state.selectedTeam,
    getCurrentGame: state => state.currentGame,
    getConnectionError: state => state.connectionError,
  },

  actions: {
    // 게임 채팅방 연결
    connectToGame(gameId, gameData) {
      this.currentGameId = gameId
      this.currentGame = gameData
      this.connectionError = null

      // 기존 연결이 있으면 먼저 해제
      if (this.stompClient) {
        this.disconnect()
      }

      try {
        // SockJS + STOMP 클라이언트 생성
        const socket = new SockJS(
          `${process.env.VUE_APP_BACKEND_URL || 'http://localhost:8080'}/chat-socket`
        )

        this.stompClient = new Client({
          webSocketFactory: () => socket,

          onConnect: () => {
            this.connected = true
            this.connectionError = null
            console.log(`✅ 게임 ${gameId} 채팅방 연결 성공`)

            // 게임별 채팅방 구독
            this.stompClient.subscribe(`/topic/game/${gameId}`, message => {
              try {
                const chatMessage = JSON.parse(message.body)
                this.addMessage(chatMessage)
              } catch (error) {
                console.error('메시지 파싱 오류:', error)
              }
            })

            // 접속자 수 구독 (선택사항)
            this.stompClient.subscribe(
              `/topic/game/${gameId}/participants`,
              message => {
                try {
                  const count = JSON.parse(message.body)
                  this.setParticipants(count)
                } catch (error) {
                  console.error('참가자 수 파싱 오류:', error)
                }
              }
            )

            // 입장 알림 (선택사항)
            this.sendJoinMessage()
          },

          onStompError: frame => {
            console.error('STOMP 오류:', frame)
            this.connectionError = 'WebSocket 연결 오류가 발생했습니다.'
            this.connected = false
          },

          onWebSocketClose: () => {
            console.log('WebSocket 연결 종료')
            this.connected = false
          },

          // 자동 재연결 설정
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        })

        // 연결 시작
        this.stompClient.activate()
      } catch (error) {
        console.error('WebSocket 연결 실패:', error)
        this.connectionError = 'WebSocket 연결에 실패했습니다.'
        this.connected = false
      }
    },

    // 연결 해제
    disconnect() {
      if (this.stompClient) {
        this.stompClient.deactivate()
        this.stompClient = null
      }

      this.connected = false
      this.currentGameId = null
      this.currentGame = null
      this.messages = []
      this.participants = 0
      this.selectedTeam = null
      this.connectionError = null

      console.log('🔌 채팅방 연결 해제')
    },

    // 응원팀 선택
    setSelectedTeam(team) {
      this.selectedTeam = team
      console.log(`📢 ${team === 'home' ? '홈' : '원정'}팀 응원 선택`)
    },

    // 메시지 전송
    sendMessage(content, team = null) {
      if (!this.stompClient || !this.connected) {
        console.error('WebSocket이 연결되지 않았습니다.')
        return false
      }

      const targetTeam = team || this.selectedTeam
      if (!targetTeam) {
        console.error('팀을 선택해주세요')
        return false
      }

      try {
        const message = {
          userId: 1, // TODO: 실제 로그인 유저 ID로 변경
          content: content.trim(),
          type: 'TEXT',
        }

        // WebSocket으로 메시지 전송
        this.stompClient.publish({
          destination: `/app/chat.sendMessage/${this.currentGameId}`,
          body: JSON.stringify(message),
        })

        console.log(`📤 메시지 전송: ${content}`)
        return true
      } catch (error) {
        console.error('메시지 전송 실패:', error)
        return false
      }
    },

    // 입장 메시지 전송 (선택사항)
    sendJoinMessage() {
      if (!this.stompClient || !this.connected) return

      try {
        const joinData = {
          userId: 1, // TODO: 실제 로그인 유저 ID로 변경
          action: 'JOIN',
        }

        this.stompClient.publish({
          destination: `/app/chat.join/${this.currentGameId}`,
          body: JSON.stringify(joinData),
        })
      } catch (error) {
        console.error('입장 메시지 전송 실패:', error)
      }
    },

    // 새 메시지 추가
    addMessage(message) {
      try {
        const messageData = {
          id: message.id || Date.now(),
          userId: message.userId,
          nickname: message.nickname || '익명',
          teamId: message.teamId,
          content: message.content,
          type: message.type || 'TEXT',
          createdAt: message.createdAt
            ? new Date(message.createdAt)
            : new Date(),
          // 팀 구분을 위한 추가 필드
          team: this.getTeamFromTeamId(message.teamId),
        }

        this.messages.push(messageData)

        // 메모리 관리: 최대 100개 메시지만 유지
        if (this.messages.length > 100) {
          this.messages = this.messages.slice(-100)
        }

        console.log(
          `📨 새 메시지 추가: ${messageData.nickname}: ${messageData.content}`
        )
      } catch (error) {
        console.error('메시지 추가 오류:', error)
      }
    },

    // 접속자 수 설정
    setParticipants(count) {
      this.participants = count
    },

    // teamId를 기반으로 home/away 구분
    getTeamFromTeamId(teamId) {
      if (!this.currentGame) return 'home'

      if (teamId === this.currentGame.homeTeamId) {
        return 'home'
      } else if (teamId === this.currentGame.awayTeamId) {
        return 'away'
      }

      return 'home' // 기본값
    },

    // 연결 재시도
    reconnect() {
      if (this.currentGameId && this.currentGame) {
        console.log('🔄 WebSocket 재연결 시도...')
        this.connectToGame(this.currentGameId, this.currentGame)
      }
    },

    // 연결 상태 확인
    checkConnection() {
      return this.stompClient && this.connected
    },
  },
})
