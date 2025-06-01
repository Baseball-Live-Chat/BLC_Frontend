import { defineStore } from 'pinia'

export const useCommentaryStore = defineStore('commentary', {
  state: () => ({
    commentaries: [],
    loading: false,
    currentGameId: null
  }),
  
  getters: {
    getCommentaries: (state) => state.commentaries
  },
  
  actions: {
    async fetchCommentaries(gameId) {
      this.loading = true
      this.currentGameId = gameId
      
      try {
        // TODO: 실제 API 호출
        // const response = await commentaryService.getCommentaries(gameId)
        // this.commentaries = response.data
        
        // 임시 데이터
        this.commentaries = [
          {
            id: 1,
            time: '5회말 1아웃',
            text: '🔥 두산 4번 타자 홈런! 추가득점으로 4-3 리드를 가져갑니다!',
            timestamp: new Date(Date.now() - 60000)
          },
          {
            id: 2,
            time: '5회말 0아웃',
            text: '⚾ LG 투수 교체, 새로운 릴리버가 마운드에 올라갑니다.',
            timestamp: new Date(Date.now() - 120000)
          },
          {
            id: 3,
            time: '5회초 3아웃',
            text: '🥎 LG 공격 종료, 3-3 동점 상황에서 5회말 두산 공격으로 넘어갑니다.',
            timestamp: new Date(Date.now() - 180000)
          },
          {
            id: 4,
            time: '5회초 2아웃',
            text: '💨 두산 투수 삼진! 빠른 볼로 타자를 제압합니다.',
            timestamp: new Date(Date.now() - 240000)
          },
          {
            id: 5,
            time: '5회초 1아웃',
            text: '⚡ LG 타자 안타로 출루, 득점 기회를 만들어냅니다.',
            timestamp: new Date(Date.now() - 300000)
          }
        ]
        
        // 실시간 중계 시뮬레이션 시작
        this.startCommentarySimulation()
      } catch (error) {
        console.error('문자중계 로딩 실패:', error)
      } finally {
        this.loading = false
      }
    },
    
    addCommentary(commentary) {
      this.commentaries.unshift({
        id: commentary.id || Date.now(),
        time: commentary.time,
        text: commentary.text,
        timestamp: commentary.timestamp || new Date()
      })
      
      // 최대 20개까지만 유지
      if (this.commentaries.length > 20) {
        this.commentaries = this.commentaries.slice(0, 20)
      }
    },
    
    startCommentarySimulation() {
      this.commentaryInterval = setInterval(() => {
        if (Math.random() < 0.4) { // 40% 확률로 새 중계
          this.addRandomCommentary()
        }
      }, 8000) // 8초마다 체크
    },
    
    stopCommentarySimulation() {
      if (this.commentaryInterval) {
        clearInterval(this.commentaryInterval)
        this.commentaryInterval = null
      }
    },
    
    addRandomCommentary() {
      const times = ['6회초', '6회말', '7회초', '7회말', '8회초', '8회말']
      const commentaryTexts = [
        '⚾ 새로운 타자가 타석에 들어섭니다.',
        '💨 빠른 볼! 스트라이크입니다.',
        '🔥 강한 타구! 하지만 파울볼입니다.',
        '👏 멋진 수비! 아웃입니다.',
        '⚡ 안타! 주자가 출루합니다.',
        '🎯 완벽한 제구! 삼진입니다.',
        '🏃‍♂️ 도루 시도! 성공입니다.',
        '🛡️ 포수의 훌륭한 송구로 견제 아웃!',
        '⭐ 클린업 트리오가 타석에 들어섭니다.',
        '🎪 투수의 변화구가 타자를 농락합니다.',
        '💪 장타! 담장을 넘나 싶었지만 파울입니다.',
        '🎨 예술적인 수비! 관중들이 박수를 보냅니다.',
        '⚡ 번트 시도! 성공적으로 주자를 진루시킵니다.',
        '🔄 투수 교체! 새로운 승부가 시작됩니다.',
        '🎯 만루 상황! 긴장감이 최고조에 달합니다.'
      ]
      
      const randomTime = times[Math.floor(Math.random() * times.length)]
      const randomText = commentaryTexts[Math.floor(Math.random() * commentaryTexts.length)]
      
      this.addCommentary({
        id: Date.now() + Math.random(),
        time: randomTime,
        text: randomText,
        timestamp: new Date()
      })
    },
    
    clearCommentaries() {
      this.commentaries = []
      this.stopCommentarySimulation()
    }
  }
})