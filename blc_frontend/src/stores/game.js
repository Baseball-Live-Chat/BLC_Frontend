// src/stores/game.js
import { defineStore } from 'pinia'
import http from '@/lib/http'

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
        // TODO: 실제 API 연결하면 주석 해제
        // const response = await http.get('/api/games')
        // this.games = response.data.games

        // 임시 데이터 (나중에 삭제)
        this.games = [
          // ... 기존 더미 데이터 유지
        ]
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async fetchGameDetail(gameId) {
      this.loading = true
      this.error = null
      try {
        console.log('🔍 경기 상세 조회 시도:', gameId)
        
        // ✅ 실제 API 호출
        const response = await http.get(`/api/games/${gameId}`)
        const apiGame = response.data
        
        console.log('✅ API 응답:', apiGame)
        
        // 🔄 API 응답을 프론트엔드 형식으로 변환 (실제 API 구조에 맞춤)
        this.currentGame = {
          // 백엔드 API 필드 → 프론트엔드 필드 매핑
          gameId: apiGame.gameId,
          id: apiGame.gameId, // 기존 코드 호환성
          
          // 팀 정보 (실제 API 응답 구조 사용)
          homeTeam: apiGame.homeCode, // "키움"
          awayTeam: apiGame.awayCode, // "두산"
          homeTeamName: apiGame.homeTeamName, // "키움 히어로즈"
          awayTeamName: apiGame.awayTeamName, // "두산 베어스"
          
          // 경기 정보
          gameDate: apiGame.gameDateTime, // gameDateTime으로 수정
          stadium: apiGame.stadium,
          
          // 팀 로고 및 색상 (실제 API 응답 구조 사용)
          homeTeamInfo: {
            name: apiGame.homeTeamName,
            code: apiGame.homeCode,
            logoUrl: apiGame.homeLogoUrl,
            color: apiGame.homeTeamColor
          },
          awayTeamInfo: {
            name: apiGame.awayTeamName,
            code: apiGame.awayCode,
            logoUrl: apiGame.awayLogoUrl,
            color: apiGame.awayTeamColor
          },
          
          // 임시값들 (나중에 실제 API에서 가져올 예정)
          homeScore: 0,
          awayScore: 0,
          status: 'SCHEDULED',
          inning: '경기전',
          startTime: new Date(apiGame.gameDateTime).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
          })
        }
        
        console.log('🎯 변환된 게임 데이터:', this.currentGame)
        
      } catch (error) {
        console.error('❌ 경기 상세 조회 실패:', error)
        this.error = error.response?.data?.message || error.message
        
        // 🚨 API 실패 시 임시로 더미 데이터 사용 (개발 중에만)
        console.log('⚠️ API 실패로 더미 데이터 사용')
        this.currentGame = this.games.find(game => game.id == gameId)
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