<template>
  <div class="header">
    <div class="container">
      <h1>⚾ 야구 경기 소통 플랫폼</h1>
      <p>실시간으로 경기를 보며 팬들과 소통하세요!</p>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #2c5aa0, #1e3a5f);
  padding: 20px 0;
  color: white;
  margin-bottom: 30px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

.header h1 {
  font-size: 2rem;
  margin-bottom: 10px;
}

.header p {
  opacity: 0.9;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 1.5rem;
  }
  
  .header p {
    font-size: 1rem;
  }
}
</style>