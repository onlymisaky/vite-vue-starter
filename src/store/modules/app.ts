import { defineStore } from 'pinia';
import { ref } from 'vue';
import store from '@/store';

export const useAppStore = defineStore('app', () => {
  const appName = ref(import.meta.env.VITE_APP_TITLE);

  return { appName };
});

export function useAppStoreWithOut() {
  return useAppStore(store);
}
