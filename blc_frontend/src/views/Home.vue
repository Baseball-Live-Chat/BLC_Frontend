<template>
  <div class="container">
    <!-- 인기 순위 섹션 -->
    <RankingSection :rankings="rankings" />

    <!-- 경기 카드 섹션 -->
    <div class="games-section">
      <h2 class="games-title">🔥 진행 중인 경기</h2>

      <div v-if="loading" class="loading">경기 정보를 불러오는 중...</div>

      <div v-else-if="error" class="error">
        {{ error }}
      </div>

      <div v-else class="games-list">
        <GameCard
          v-for="game in games"
          :key="game.id"
          :game="game"
          @click="goToGameDetail(game.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'
import RankingSection from '../components/game/RankingSection.vue'
import GameCard from '../components/game/GameCard.vue'

const router = useRouter()
const gameStore = useGameStore()

const games = computed(() => gameStore.getTodayGames)
const rankings = computed(() => gameStore.getRankings)
const loading = computed(() => gameStore.loading)
const error = computed(() => gameStore.error)

const goToGameDetail = gameId => {
  router.push(`/games/${gameId}`)
}

onMounted(async () => {
  await gameStore.fetchGames()
  await gameStore.fetchRankings()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.games-section {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.games-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #2c5aa0;
  border-bottom: 2px solid #2c5aa0;
  padding-bottom: 10px;
}

.games-list {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 10px 0;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.1rem;
}

.error {
  text-align: center;
  padding: 40px;
  color: #dc3545;
  font-size: 1.1rem;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 5px;
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }

  .games-list {
    flex-direction: column;
  }
}
</style>
