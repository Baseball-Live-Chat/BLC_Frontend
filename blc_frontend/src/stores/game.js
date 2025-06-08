import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
  state: () => ({
    games: [],
    currentGame: null,
    rankings: [],
    loading: false,
    error: null,
  }),

  getters: {
    getTodayGames: state => state.games,
    getCurrentGame: state => state.currentGame,
    getRankings: state => state.rankings,
  },

  actions: {
    async fetchGames() {
      this.loading = true
      this.error = null
      try {
        // TODO: 실제 API 호출
        // const response = await gameService.getGames()
        // this.games = response.data

        // 임시 데이터
        this.games = [
          {
            id: 1,
            homeTeam: '두산',
            awayTeam: 'LG',
            homeTeamName: '두산 베어스',
            awayTeamName: 'LG 트윈스',
            homeScore: 4,
            awayScore: 3,
            status: 'LIVE',
            inning: '5회말',
            stadium: '잠실야구장',
            startTime: '19:00',
            homeCheerCount: 856,
            awayCheerCount: 743,
            participants: 1247,
            recentMessages: [
              { id: 1, nickname: '⭐야구팬', content: '두산 화이팅!' },
              { id: 2, nickname: '🔥LG팬', content: '역전하자!' },
              { id: 3, nickname: '⚾베이스볼', content: '좋은 경기네요' },
            ],
          },
          {
            id: 2,
            homeTeam: '삼성',
            awayTeam: '기아',
            homeTeamName: '삼성 라이온즈',
            awayTeamName: '기아 타이거즈',
            homeScore: 7,
            awayScore: 2,
            status: 'LIVE',
            inning: '6회초',
            stadium: '대구삼성라이온즈파크',
            startTime: '18:30',
            homeCheerCount: 1203,
            awayCheerCount: 567,
            participants: 1156,
            recentMessages: [
              { id: 1, nickname: '🦁삼성팬', content: '대승이다!' },
              { id: 2, nickname: '🐅기아팬', content: '아직 안 끝났어' },
              { id: 3, nickname: '⚾관전러', content: '삼성 타선 대폭발' },
            ],
          },
          {
            id: 3,
            homeTeam: '롯데',
            awayTeam: 'NC',
            homeTeamName: '롯데 자이언츠',
            awayTeamName: 'NC 다이노스',
            homeScore: 1,
            awayScore: 1,
            status: 'LIVE',
            inning: '4회말',
            stadium: '사직야구장',
            startTime: '18:30',
            homeCheerCount: 634,
            awayCheerCount: 512,
            participants: 892,
            recentMessages: [
              { id: 1, nickname: '🦐롯데팬', content: '팽팽한 경기' },
              { id: 2, nickname: '🐋NC팬', content: '동점 유지하자' },
              { id: 3, nickname: '⚾야구매니아', content: '투수전이네' },
            ],
          },
          {
            id: 4,
            homeTeam: '한화',
            awayTeam: 'KT',
            homeTeamName: '한화 이글스',
            awayTeamName: 'KT 위즈',
            homeScore: 0,
            awayScore: 2,
            status: 'LIVE',
            inning: '3회초',
            stadium: '수원KT위즈파크',
            startTime: '18:30',
            homeCheerCount: 423,
            awayCheerCount: 687,
            participants: 743,
            recentMessages: [
              { id: 1, nickname: '🦅한화팬', content: '아직 초반이야' },
              { id: 2, nickname: '📱KT팬', content: '홈경기 화이팅' },
              { id: 3, nickname: '⚾팬', content: 'KT 선제점!' },
            ],
          },
          {
            id: 5,
            homeTeam: 'SSG',
            awayTeam: '키움',
            homeTeamName: 'SSG 랜더스',
            awayTeamName: '키움 히어로즈',
            homeScore: 3,
            awayScore: 5,
            status: 'LIVE',
            inning: '7회말',
            stadium: '고척스카이돔',
            startTime: '18:30',
            homeCheerCount: 445,
            awayCheerCount: 789,
            participants: 689,
            recentMessages: [
              { id: 1, nickname: '🛡️SSG팬', content: '추격해보자' },
              { id: 2, nickname: '🐻키움팬', content: '홈경기 승리!' },
              { id: 3, nickname: '⚾관전자', content: '키움 리드 유지' },
            ],
          },
        ]
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async fetchGameDetail(gameId) {
      this.loading = true
      try {
        // TODO: 실제 API 호출
        // const response = await gameService.getGameDetail(gameId)
        // this.currentGame = response.data

        // 임시 데이터
        this.currentGame = this.games.find(game => game.id == gameId)
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async fetchRankings() {
      try {
        // TODO: 실제 API 호출
        // const response = await gameService.getRankings()
        // this.rankings = response.data

        // 임시 데이터
        this.rankings = [
          { rank: 1, teams: '두산 vs LG', viewers: 1247 },
          { rank: 2, teams: '삼성 vs 기아', viewers: 1156 },
          { rank: 3, teams: '롯데 vs NC', viewers: 892 },
          { rank: 4, teams: '한화 vs KT', viewers: 743 },
          { rank: 5, teams: 'SSG vs 키움', viewers: 689 },
        ]
      } catch (error) {
        this.error = error.message
      }
    },

    async cheerForTeam(gameId, team) {
      try {
        // TODO: 실제 API 호출
        // await gameService.cheer(gameId, team)

        // 실시간 업데이트
        if (this.currentGame && this.currentGame.id == gameId) {
          if (team === 'home') {
            this.currentGame.homeCheerCount++
          } else {
            this.currentGame.awayCheerCount++
          }
        }

        // 메인 게임 리스트도 업데이트
        const gameIndex = this.games.findIndex(game => game.id == gameId)
        if (gameIndex !== -1) {
          if (team === 'home') {
            this.games[gameIndex].homeCheerCount++
          } else {
            this.games[gameIndex].awayCheerCount++
          }
        }
      } catch (error) {
        console.error('응원 실패:', error)
      }
    },
  },
})
