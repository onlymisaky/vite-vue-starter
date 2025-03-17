import store from '@/store';
import { useMenuStore } from '@/store/modules/menu';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

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
        if (tabs.value.length > 0) {
          setActive(tabs.value[tabs.value.length - 1]);
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
