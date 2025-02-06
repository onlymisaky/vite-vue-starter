import store from '@/store';
import { defineStore } from 'pinia';
import { ref } from 'vue';

function useList() {
  const list = ref<string[]>([]);

  function addItem(item: string) {
    if (!list.value.includes(item)) {
      list.value.push(item);
    }
  }

  function removeItem(item: string) {
    const index = list.value.indexOf(item);
    if (index > -1) {
      list.value.splice(index, 1);
    }
  }

  return [list, addItem, removeItem] as const;
}

export const usePageCacheStore = defineStore('pageCache', () => {
  const cachePageSize = ref(10);

  const [cachedPages, addCachedPage, removeCachedPage] = useList();

  const [unCachedPages, addUnCachedPage, removeUnCachedPage] = useList();

  return {
    cachePageSize,
    cachedPages,
    addCachedPage,
    removeCachedPage,
    unCachedPages,
    addUnCachedPage,
    removeUnCachedPage,
  };
});

export function usePageCacheStoreWithOut() {
  return usePageCacheStore(store);
}
