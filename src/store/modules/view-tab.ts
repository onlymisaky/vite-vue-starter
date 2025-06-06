import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import store from '@/store';
import { useMenuStore } from '@/store/modules/menu';

export interface IViewTab {
  name: string
  fullPath: string
  title: string
  icon?: string
}

export const useViewTabStore = defineStore('viewTab', () => {
  const route = useRoute();
  const router = useRouter();
  const menuStore = useMenuStore();

  const tabs = ref<IViewTab[]>([]);

  const activeTab = ref<IViewTab | undefined>();

  const activeIndex = computed(() => {
    return tabs.value.findIndex(t => t.fullPath === activeTab.value?.fullPath);
  });

  function setActive(tab: IViewTab) {
    activeTab.value = tab;
    // 如果当前路由不是当前标签页的路由，则跳转
    if (route.fullPath !== tab.fullPath) {
      router.push(tab.fullPath);
    }

    const menu = menuStore.flatMenus.find(m => m.index === tab.name);
    if (menu) {
      menuStore.setActiveMenu(menu);
    }
  }

  function addTab(tab: IViewTab, isActive = true) {
    if (isActive) {
      setActive(tab);
    }
    if (!tabs.value.some(t => t.fullPath === tab.fullPath)) {
      tabs.value.push(tab);
    }
  }

  function removeTab(fullPath: string) {
    const index = tabs.value.findIndex(t => t.fullPath === fullPath);
    if (index > -1) {
      tabs.value.splice(index, 1);
      if (activeTab.value?.fullPath === fullPath) {
        const len = tabs.value.length;
        if (len > 0) {
          setActive(tabs.value[Math.min(index, len - 1)]);
        }
        else {
          router.push('/');
        }
      }
    }
  }

  return {
    tabs,
    activeTab,
    activeIndex,
    addTab,
    removeTab,
    setActive,
  };
}, {
  persist: true,
});

export function useViewTabStoreWithOut() {
  return useViewTabStore(store);
}
