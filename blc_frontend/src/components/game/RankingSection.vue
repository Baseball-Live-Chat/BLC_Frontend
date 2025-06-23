<template>
  <div class="ranking-section">
    <h2 class="ranking-title">🏆 인기 순위</h2>
    <!-- <div class="ranking-list">
      <div v-for="ranking in rankings" :key="ranking.rank" class="ranking-item">
        <div class="ranking-number">{{ ranking.rank }}</div>
        <div class="team-name">{{ ranking.teams }}</div>
        <div class="match-count">실시간 {{ ranking.viewers }}명</div>
      </div>
    </div> -->
  </div>
</template>

<script setup>
defineProps({
  rankings: {
    type: Array,
    default: () => [],
  },
})
</script>

<style scoped>
.ranking-section {
  background: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.ranking-title {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #2c5aa0;
  border-bottom: 2px solid #2c5aa0;
  padding-bottom: 10px;
}

.ranking-list {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  padding: 10px 0;
}

.ranking-item {
  min-width: 150px;
  text-align: center;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.ranking-item:hover {
  border-color: #2c5aa0;
  transform: translateY(-2px);
}

.ranking-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c5aa0;
  margin-bottom: 5px;
}

.team-name {
  font-weight: bold;
  margin-bottom: 5px;
  font-size: 0.9rem;
}

.match-count {
  font-size: 0.8rem;
  color: #666;
}

@media (max-width: 768px) {
  .ranking-list {
    flex-direction: column;
  }

  .ranking-item {
    min-width: auto;
  }
}
</style>
