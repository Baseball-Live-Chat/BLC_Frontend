<template>
  <div :class="['game-status', statusClass]">
    {{ statusText }}
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
})

const statusClass = computed(() => {
  switch (props.status) {
    case 'LIVE':
      return 'live'
    case 'SCHEDULED':
      return 'scheduled'
    case 'FINISHED':
      return 'finished'
    default:
      return 'unknown'
  }
})

const statusText = computed(() => {
  switch (props.status) {
    case 'LIVE':
      return 'LIVE'
    case 'SCHEDULED':
      return '예정'
    case 'FINISHED':
      return '종료'
    default:
      return props.status
  }
})
</script>

<style scoped>
.game-status {
  position: absolute;
  top: 10px;
  right: 10px;
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
}

.game-status.live {
  background: #28a745;
  animation: pulse 2s infinite;
}

.game-status.scheduled {
  background: #6c757d;
}

.game-status.finished {
  background: #dc3545;
}

.game-status.unknown {
  background: #ffc107;
  color: #333;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}
</style>
