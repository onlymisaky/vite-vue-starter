import type { App } from 'vue';
import Layout from '@/layout/Layout.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Layout,
    },
    {
      path: '/:pathMatch(.*)*',
      component: Layout,
    },
  ],
});

export function setupRouter(app: App) {
  app.use(router);
}

export default router;
