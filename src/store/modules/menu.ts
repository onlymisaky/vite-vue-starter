import type { RouteLocationNormalizedGeneric, RouteRecordRaw } from 'vue-router';
import { layoutRoute } from '@/routes/route-config';
import { hasPermission } from '@/utils/permission';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import useUserStore from './user';

function generateMenus(routes: RouteRecordRaw[], userPermission: string[]): IMenuItem[] {
  return routes.reduce((menus, route) => {
    const meta = route.meta;
    if (!meta) {
      return menus;
    }
    const { hideInMenu, permission: routePermission } = meta;
    if (hideInMenu) {
      return menus;
    }

    if (!hasPermission(routePermission, userPermission)) {
      return menus;
    }

    const menu: IMenuItem = {
      index: route.name as string,
      title: meta.title,
      icon: meta.icon,
      route: {
        name: route.name,
      },
    };
    if (route.children) {
      menu.items = [];
      if (route.children.length > 0) {
        menu.items = generateMenus(route.children, userPermission);
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

export default defineStore('menu', () => {
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

  return { isCollapse, toggleCollapse, menus, activeMenu, animationDuration, setActiveMenu };
}, {
  persist: {
    pick: ['isCollapse'],
  },
});
