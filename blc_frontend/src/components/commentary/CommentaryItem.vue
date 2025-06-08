<template>
  <div class="commentary-item">
    <div class="commentary-time">{{ commentary.time }}</div>
    <div class="commentary-text">{{ commentary.text }}</div>
  </div>
</template>

<script setup>
defineProps({
  commentary: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.commentary-item {
  margin-bottom: 15px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #2c5aa0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-out;
}

.commentary-time {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 5px;
  font-weight: bold;
}

.commentary-text {
  font-size: 0.9rem;
  line-height: 1.4;
  color: #333;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .commentary-item {
    padding: 10px;
    margin-bottom: 12px;
  }

  .commentary-text {
    font-size: 0.85rem;
  }
}
</style>
