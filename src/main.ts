import type { App } from 'vue';
import { createApp } from 'vue';
import Root from './App.vue';
import { setupRouter } from './routes';
import { setupIcon } from './setup/setup-icon';
import { setupStore } from './store';
import 'element-plus/theme-chalk/dark/css-vars.css';
import 'nprogress/nprogress.css';
import './styles/styles.scss';
import 'vue-click-to-component/client';

function setup(app: App) {
  setupRouter(app);
  setupStore(app);
  setupIcon(app);
  app.mount('#app');
}

setup(createApp(Root));
