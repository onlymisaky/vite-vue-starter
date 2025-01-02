import { useMenuStoreWithOut } from '@/store/modules/menu';
import useUserStore from '@/store/modules/user';
import { hasPermission } from '@/utils/permission';
import NProgress from 'nprogress';
import { isNavigationFailure, type Router } from 'vue-router';
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

    const userStore = useUserStore();

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

    menuStore.setActiveMenu(to);

    document.title = to.meta.title as string || document.title;
  });

  router.onError((_error, _to) => {
    NProgress.done();
  });
}
