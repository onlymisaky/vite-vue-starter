import type { App } from 'vue';
import { h } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { routes } from './route-config';
import { routerGuards } from './router-guards';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
