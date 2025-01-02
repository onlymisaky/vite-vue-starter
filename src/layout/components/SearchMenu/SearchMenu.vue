<script setup lang="ts">
import { useMenuStore } from '@/store/modules/menu';
import Fuse from 'fuse.js';
import { ref, watch } from 'vue';
import SearchMenuList from './SearchMenuList.vue';

const emits = defineEmits(['select']);

const menuStore = useMenuStore();
const keywords = ref('');
const result = ref<IMenuItem[]>([]);

let fues: Fuse<IMenuItem>;

watch(() => menuStore.flatMenus.map((item) => item.title), () => {
  fues = new Fuse<IMenuItem>(menuStore.flatMenus, {
    shouldSort: true,
    threshold: 0.4,
    minMatchCharLength: 1,
    keys: ['title'],
  });
}, { immediate: true, deep: true });

watch(() => keywords.value, (val) => {
  if (val && val.trim()) {
    result.value = fues.search(val.trim()).map((item) => item.item).sort((a) => {
      if (a.disabled || (!a.externalLink && !a.route) || !!a.items) {
        return 1;
      }
      return -1;
    });
  }
  else {
    result.value = [];
  }
});
</script>

<template>
  <div>
    <ElInput
      v-model="keywords"
      placeholder="请输入搜索关键词"
      clearable
      size="large"
      class="mb-[20px]"
    >
      <template #prefix>
        <ElIcon>
          <Search />
        </ElIcon>
      </template>
    </ElInput>

    <SearchMenuList
      v-if="result.length"
      :list="result"
      @select="(...args) => emits('select', ...args)"
    />

    <template v-else>
      <ElResult
        v-if="!keywords || keywords.trim() === ''"
        class="h-[295px]"
        sub-title="请输入搜索关键词"
      >
        <template #icon>
          <Search />
        </template>
      </ElResult>
      <ElEmpty v-else>
        <template #description>
          未找到搜索结果<span class="font-bold">{{ keywords }}</span>
        </template>
      </ElEmpty>
    </template>
  </div>
</template>
