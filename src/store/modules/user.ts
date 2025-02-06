import store from '@/store';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const info = ref<Partial<IUser>>({
    id: '123456789',
    username: 'admin',
    permissions: [
      'data:performance',
      'data:alert',
      'content:draft',
      'content:article:hot',
      'content:article:archive',
      'workflow:approval:urgent',
      'message:system',
      'message:personal',
      'statistics:sales',
      'resource:view',
      'personal:view',
      'system:config',
      'system:role:list',
      // 'system:user:detail',
      'system:user:permission',
    ],
  });

  const token = ref('123456789');

  const logged = computed(() => {
    return !!token.value.trim() && !!info.value.id;
  });

  const permissions = computed(() => {
    return (info.value?.permissions || []) as string[];
  });

  function logout() {
    token.value = '';
    info.value = {};
  }

  return { info, token, logged, permissions, logout };
});

export function useUserStoreWithOut() {
  return useUserStore(store);
}
