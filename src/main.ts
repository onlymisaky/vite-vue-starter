import type { App } from 'vue';
import { createApp } from 'vue';
import Root from './App.vue';
import { setupRouter } from './routes';
import { setupStore } from './store';
import 'element-plus/theme-chalk/dark/css-vars.css';
import './styles/styles.scss';

function setup(app: App) {
  setupRouter(app);
  setupStore(app);
  app.mount('#app');
}

setup(createApp(Root));
