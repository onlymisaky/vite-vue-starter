<script setup lang="ts">
import { ref } from 'vue';
import IconWithBg from '@/components/IconWithBg.vue';
import SearchResult from './SearchMenu.vue';

const searchDialogVisible = ref(false);
</script>

<template>
  <IconWithBg
    :size="24"
    tip="菜单搜索"
    @click="searchDialogVisible = true"
  >
    <Search />
  </IconWithBg>
  <ElDialog
    v-model="searchDialogVisible"
    :show-close="false"
    width="630px"
    top="5vh"
  >
    <SearchResult
      v-if="searchDialogVisible"
      @select="searchDialogVisible = false"
    />
    <template #footer>
      <div class="flex">
        <span>
          <span class="keyboard">Esc</span>
          关闭
        </span>
        <span class="ml-[20px]">
          <span class="keyboard">↑</span>
          <span class="keyboard">↓</span>
          切换
        </span>
        <span class="ml-[20px]">
          <span class="keyboard">Enter</span>
          选中
        </span>
      </div>
    </template>
  </ElDialog>
</template>

<style scoped>
.keyboard {
  @apply mr-[5px] p-[5px] rounded-[4px] bg-[#e5e7eb] dark:bg-[#4c4c4c];
}
</style>
