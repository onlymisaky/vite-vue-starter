import type { RouteLocationNormalizedGeneric, RouteRecordRaw } from 'vue-router';
import { layoutRoute } from '@/routes/route-config';
import store from '@/store';
import { hasPermission } from '@/utils/permission';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import useUserStore from './user';

function generateMenus(routes: RouteRecordRaw[], userPermission: string[], parents: IMenuItem[] = []): IMenuItem[] {
  return routes.reduce((menus, route) => {
    const meta = route.meta;
    if (!meta) {
      return menus;
    }
    const { hideInMenu, permission: routePermission } = meta;
    if (hideInMenu) {
      return menus;
    }

    const noPermission = !hasPermission(routePermission, userPermission);

    if (noPermission && meta.noPermissionMenuStatus !== 'disabled') {
      return menus;
    }

    const menu: IMenuItem = {
      index: route.name as string,
      title: meta.title,
      icon: meta.icon,
      route,
      parents,
      disabled: noPermission,
    };
    if (route.children) {
      menu.items = [];
      if (route.children.length > 0) {
        menu.items = generateMenus(route.children, userPermission, [...parents, menu]);
      }
    }
    menus.push(menu);
    return menus;
  }, [] as IMenuItem[]);
}

function filterEmptyMenus(menus: IMenuItem[]): IMenuItem[] {
  return menus.filter((menu) => {
    if (menu.items) {
      if (menu.items.length === 0) {
        return false;
      }
      menu.items = filterEmptyMenus(menu.items);
      return menu.items.length > 0;
    }
    return true;
  });
}

function flatMenu(menus: IMenuItem[]) {
  return menus.reduce((acc, menu) => {
    acc.push(menu);
    if (menu.items && menu.items.length > 0) {
      acc.push(...flatMenu(menu.items));
    }
    return acc;
  }, [] as IMenuItem[]);
}

export const useMenuStore = defineStore('menu', () => {
  const isCollapse = ref(false);

  function toggleCollapse() {
    isCollapse.value = !isCollapse.value;
  }

  const userStore = useUserStore();

  const menus = computed(() => {
    const menus = generateMenus(layoutRoute.children || [], userStore?.info?.permissions || []);
    return filterEmptyMenus(menus);
  });

  const activeMenu = ref('');

  function setActiveMenu(to: RouteLocationNormalizedGeneric) {
    const index = to.name as string;
    activeMenu.value = index;
  }

  const animationDuration = ref(200);

  const flatMenus = computed(() => {
    return flatMenu(menus.value);
  });

  return { isCollapse, toggleCollapse, menus, activeMenu, animationDuration, setActiveMenu, flatMenus };
}, {
  persist: {
    pick: ['isCollapse'],
  },
});

export function useMenuStoreWithOut() {
  return useMenuStore(store);
}
