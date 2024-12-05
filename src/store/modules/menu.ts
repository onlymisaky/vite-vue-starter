import { menuData } from '@/layout/Aside/Menu/menuData';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export default defineStore('menu', () => {
  const isCollapse = ref(false);

  function toggleCollapse() {
    isCollapse.value = !isCollapse.value;
  }

  const menus = ref(menuData);

  const activeMenu = ref(menuData[0].index);

  const animationDuration = ref(200);

  return { isCollapse, toggleCollapse, menus, activeMenu, animationDuration };
}, {
  persist: {
    pick: ['isCollapse'],
  },
});
