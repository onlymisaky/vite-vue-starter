import type { App } from 'vue';
import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';

const store = createPinia();

store.use(createPersistedState({
  key(id) {
    return `pinia:persisted:${id}`;
  },
  storage: localStorage,
}));

export function setupStore(app: App) {
  app.use(store);
}

export default store;
