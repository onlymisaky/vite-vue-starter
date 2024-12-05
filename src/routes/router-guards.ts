import useMenuStore from '@/store/modules/menu';
import useUserStore from '@/store/modules/user';
import { hasPermission } from '@/utils/permission';
import NProgress from 'nprogress';
import { isNavigationFailure, type Router } from 'vue-router';
import { FORBIDDEN_ROUTE_NAME, LOGIN_ROUTE_NAME } from './constant';

NProgress.configure({ showSpinner: false });

export function routerGuards(router: Router) {
  router.beforeEach((to, _from, next) => {
    const meta = to.meta;
    if (!meta) {
      next();
      return;
    }
    const { permission, hideProgress } = meta;

    if (!hideProgress) {
      NProgress.start();
    }

    if (!permission || (Array.isArray(permission) && permission.length === 0)) {
      next();
      return;
    }

    const userStore = useUserStore();

    if (!userStore.logged) {
      next({ name: LOGIN_ROUTE_NAME });
      return;
    }

    if (hasPermission(permission, userStore.permissions)) {
      next();
    }

    next({ name: FORBIDDEN_ROUTE_NAME });
  });

  router.afterEach((to, _from, failure) => {
    NProgress.done();
    if (isNavigationFailure(failure)) {
      return;
    }

    NProgress.done();
    const menuStore = useMenuStore();

    menuStore.setActiveMenu(to);

    document.title = to.meta.title as string || document.title;
  });

  router.onError((_error, _to) => {
    NProgress.done();
  });
}
