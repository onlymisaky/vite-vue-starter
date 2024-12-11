import { defineStore } from 'pinia';
import { ref } from 'vue';

export default defineStore('layout', () => {
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
