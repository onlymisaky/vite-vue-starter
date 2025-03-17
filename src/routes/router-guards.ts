import type { RouteComponent, Router } from 'vue-router';
import { useMenuStoreWithOut } from '@/store/modules/menu';
import { usePageCacheStoreWithOut } from '@/store/modules/page-cache';
import { useUserStoreWithOut } from '@/store/modules/user';
import { useViewTabStoreWithOut } from '@/store/modules/view-tab';
import { hasPermission } from '@/utils/permission';
import NProgress from 'nprogress';
import { isNavigationFailure } from 'vue-router';
import { FORBIDDEN_ROUTE_NAME, LOGIN_ROUTE_NAME } from './constant';

NProgress.configure({ showSpinner: false });

export function routerGuards(router: Router) {
  router.beforeEach((to, _from, next) => {
    const meta = to.meta;
    // 没有meta，也就意味着该路由没有配置权限信息，直接跳转
    if (!meta) {
      next();
      return;
    }
    const { permission, hideProgress } = meta;

    if (!hideProgress) {
      NProgress.start();
    }

    // 无需鉴权的路由，直接跳转
    if (!permission || (Array.isArray(permission) && permission.length === 0)) {
      next();
      return;
    }

    const userStore = useUserStoreWithOut();

    // 用户未登录，跳转到登录页
    if (!userStore.logged) {
      next({ name: LOGIN_ROUTE_NAME });
      return;
    }

    // 验证权限
    if (hasPermission(permission, userStore.permissions)) {
      next();
      return;
    }

    // 没有权限，跳转到403页面
    next({ name: FORBIDDEN_ROUTE_NAME });
  });

  router.afterEach((to, _from, failure) => {
    NProgress.done();
    if (isNavigationFailure(failure)) {
      return;
    }

    const menuStore = useMenuStoreWithOut();

    const menu = menuStore.flatMenus.find(menu => menu.index === to.name);
    if (menu) {
      const route = menu.route;
      if (route && !route.component && Array.isArray(route.children) && route.children.length > 0) {
        const items = menu.items || [];
        const child = items.find(item => !item.disabled);
        if (child) {
          router.push({ name: child.index });
          return;
        }
      }

      const pageCacheStore = usePageCacheStoreWithOut();

      // 如果路由配置中设置了 cache，则添加到缓存列表
      if (route?.meta?.cache) {
        const component = route.component as RouteComponent | (() => Promise<RouteComponent>);
        if (typeof component === 'function') {
          (component as () => Promise<RouteComponent>)().then((mod: any) => {
            const comp = mod.default || mod;
            const componentName = comp.name || comp.__name;
            if (componentName) {
              pageCacheStore.addCachedPage(componentName);
            }
          });
        }
        else if (component) {
          const componentName = component.name || component.__name;
          if (componentName) {
            pageCacheStore.addCachedPage(componentName);
          }
        }
      }

      menuStore.setActiveMenu(menu);
    }
    else {
      menuStore.activeMenu = '';
    }

    document.title = to.meta.title as string || document.title;

    const viewTab = useViewTabStoreWithOut();
    if (Object.keys(to.meta).length > 0 && !to.meta.hideInTab) {
      viewTab.addTab({
        name: to.name as string,
        fullPath: to.fullPath,
        title: to.meta.title as string,
        icon: to.meta.icon,
      });
    }
    else {
      viewTab.activeTab = undefined;
    }
  });

  router.onError((_error, _to) => {
    NProgress.done();
  });
}
