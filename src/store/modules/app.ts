import store from '@/store';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const appName = ref(import.meta.env.VITE_APP_TITLE);

  return { appName };
});

export function useAppStoreWithOut() {
  return useAppStore(store);
}
