import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [],
    participants: 0,
    connected: false,
    currentGameId: null,
    socket: null
  }),
  
  getters: {
    getMessages: (state) => state.messages,
    getParticipants: (state) => state.participants,
    isConnected: (state) => state.connected
  },
  
  actions: {
    connectToGame(gameId) {
      this.currentGameId = gameId
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
      this.messages = []
      this.participants = 0
      
      // 시뮬레이션 중지
      if (this.messageInterval) {
        clearInterval(this.messageInterval)
        this.messageInterval = null
      }
    },
    
    sendMessage(content, nickname = '👤나') {
      const message = {
        id: Date.now(),
        nickname,
        content,
        timestamp: new Date(),
        gameId: this.currentGameId
      }
      
      this.addMessage(message)
      
      // TODO: 실제 WebSocket으로 메시지 전송
      // this.socket.emit('sendMessage', message)
      
      // 자동 응답 시뮬레이션
      this.simulateAutoResponse()
    },
    
    addMessage(message) {
      this.messages.push({
        id: message.id || Date.now(),
        nickname: message.nickname,
        content: message.content,
        timestamp: message.timestamp || new Date()
      })
      
      // 메시지 개수 제한 (최대 100개)
      if (this.messages.length > 100) {
        this.messages = this.messages.slice(-100)
      }
    },
    
    setParticipants(count) {
      this.participants = count
    },
    
    loadInitialMessages(gameId) {
      // 임시 초기 메시지들
      const initialMessages = [
        { id: 1, nickname: '⭐야구팬123', content: '와!! 홈런이다!! 두산 화이팅!', timestamp: new Date(Date.now() - 300000) },
        { id: 2, nickname: '🔥LG매니아', content: '아쉽네요... 그래도 아직 안 끝났어요!', timestamp: new Date(Date.now() - 240000) },
        { id: 3, nickname: '⚾베이스볼러버', content: '정말 박진감 넘치는 경기네요 👏', timestamp: new Date(Date.now() - 180000) },
        { id: 4, nickname: '🏟️잠실단골', content: '현장 분위기 정말 뜨겁습니다!', timestamp: new Date(Date.now() - 120000) },
        { id: 5, nickname: '⭐야구팬123', content: '투수 교체 타이밍이 관건이겠어요', timestamp: new Date(Date.now() - 60000) },
        { id: 6, nickname: '🔥LG매니아', content: '역전 기회 만들어보자!', timestamp: new Date(Date.now() - 30000) }
      ]
      
      this.messages = initialMessages
    },
    
    startMessageSimulation() {
      this.messageInterval = setInterval(() => {
        if (Math.random() < 0.3) { // 30% 확률로 새 메시지
          this.addRandomMessage()
        }
      }, 5000)
    },
    
    addRandomMessage() {
      const users = ['⭐야구매니아', '🔥팬클럽', '⚾관전러', '🏟️현장팬', '👏응원단장', '🎯야구통', '💙블루팬']
      const messages = [
        '좋은 플레이네요!',
        '화이팅!',
        '긴장되는 순간이에요',
        '대박 경기다!',
        '응원합니다 👏',
        '멋진 경기예요',
        '하트 뛴다 💓',
        '집중하세요!',
        '최고입니다!',
        '이런 경기가 진짜 야구지!',
        '투수 좋네요',
        '타자 집중!',
        '수비 완벽해요',
        '감독님 교체 타이밍!',
        '9회말까지 모르는 거죠!'
      ]
      
      const user = users[Math.floor(Math.random() * users.length)]
      const message = messages[Math.floor(Math.random() * messages.length)]
      
      this.addMessage({
        id: Date.now() + Math.random(),
        nickname: user,
        content: message,
        timestamp: new Date()
      })
    },
    
    simulateAutoResponse() {
      setTimeout(() => {
        const responses = [
          '좋은 의견이네요!',
          '동감합니다 👍',
          '정말 박진감 넘치는 경기예요!',
          '화이팅!',
          '맞아요, 그렇게 생각해요',
          '현장에서 보면 더 재밌을 것 같아요!',
          '다음 경기도 기대됩니다',
          '야구 최고!'
        ]
        const randomResponse = responses[Math.floor(Math.random() * responses.length)]
        this.addMessage({
          id: Date.now() + Math.random(),
          nickname: '⚾야구팬',
          content: randomResponse,
          timestamp: new Date()
        })
      }, 1000 + Math.random() * 3000)
    }
  }
})