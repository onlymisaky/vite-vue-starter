import store from '@/store';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLayoutStore = defineStore('layout', () => {
  const showAside = ref(false);

  function toggleShowAside() {
    showAside.value = !showAside.value;
  }

  return { showAside, toggleShowAside };
}, {
  persist: {
    pick: ['showAside'],
  },
});

export function useLayoutStoreWithOut() {
  return useLayoutStore(store);
}
