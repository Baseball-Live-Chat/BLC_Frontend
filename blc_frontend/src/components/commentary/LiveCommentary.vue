<template>
  <div class="live-commentary">
    <h3 class="commentary-title">📝 실시간 문자중계</h3>
    
    <div class="commentary-feed" ref="commentaryFeed">
      <div v-if="loading" class="loading">
        문자중계를 불러오는 중...
      </div>
      
      <div v-else>
        <CommentaryItem
          v-for="commentary in commentaries"
          :key="commentary.id"
          :commentary="commentary"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, nextTick, watch } from 'vue'
import { useCommentaryStore } from '../../stores/commentary'
import CommentaryItem from './CommentaryItem.vue'

const props = defineProps({
  gameId: {
    type: [String, Number],
    required: true
  }
})

const commentaryStore = useCommentaryStore()
const commentaryFeed = ref(null)

const commentaries = computed(() => commentaryStore.getCommentaries)
const loading = computed(() => commentaryStore.loading)

// 새로운 중계가 추가될 때마다 스크롤을 맨 위로
watch(commentaries, async () => {
  await nextTick()
  if (commentaryFeed.value) {
    commentaryFeed.value.scrollTop = 0
  }
}, { deep: true })

onMounted(async () => {
  await commentaryStore.fetchCommentaries(props.gameId)
})

onUnmounted(() => {
  commentaryStore.stopCommentarySimulation()
})
</script>

<style scoped>
.live-commentary {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  height: 100%;
}

.commentary-title {
  font-size: 1.3rem;
  margin-bottom: 15px;
  color: #2c5aa0;
  border-bottom: 2px solid #2c5aa0;
  padding-bottom: 10px;
}

.commentary-feed {
  height: 400px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  padding: 15px;
  border-radius: 5px;
  background: #fafafa;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
}

/* 스크롤바 스타일링 */
.commentary-feed::-webkit-scrollbar {
  width: 6px;
}

.commentary-feed::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.commentary-feed::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.commentary-feed::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

@media (max-width: 768px) {
  .commentary-feed {
    height: 300px;
  }
}
</style>