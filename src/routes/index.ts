import type { App } from 'vue';
import { h } from 'vue';
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router';
import { routes } from './route-config';
import { routerGuards } from './router-guards';

function createHistory(...args: Parameters<typeof createWebHistory>) {
  if (import.meta.env.VITE_ROUTER_TYPE === 'hash') {
    return createWebHashHistory(...args);
  }
  if (import.meta.env.VITE_ROUTER_TYPE === 'history') {
    return createWebHistory(...args);
  }
  return createWebHistory(...args);
}

const router = createRouter({
  history: createHistory(import.meta.env.BASE_URL),
  routes: [
    ...routes,
    {
      path: '/:pathMatch(.*)*',
      name: 'AllNotFound',
      component: {
        render() {
          return h('div', '404 Page');
        },
      },
    },
  ],
});

export function setupRouter(app: App) {
  routerGuards(router);
  app.use(router);
}

export default router;
