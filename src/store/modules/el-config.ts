import type { ConfigProviderProps as ConfigProviderProps2 } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import store from '@/store';

/**
 * 如果直接使用 ConfigProviderProps 会导致构建报错
 * 导出的变量“useElConfigStore”具有或正在使用外部模块“"node_modules/element-plus/es/index"”中的名称“TranslatePair”，但不能为其命名。
 * 就很突然很莫名奇妙的出现了这个错误
 * 我不想找原因了，很烦，脖子疼
 */
interface TranslatePair {
  [key: string]: string | string[] | TranslatePair
}

interface Language {
  name: string
  el: TranslatePair
}

type ConfigProviderProps = Omit<ConfigProviderProps2, 'locale'> & {
  locale: Language
};

const defaultConfig: Partial<ConfigProviderProps> = {
  // 如果想重置 el-plus 的默认配置，可以在这里覆盖
  locale: zhCn,
};

function createDefaultConfig() {
  return { ...defaultConfig };
}

export const useElConfigStore = defineStore('elConfig', () => {
  const elConfig = ref<Partial<ConfigProviderProps>>(createDefaultConfig());

  function setElConfig(config: Partial<ConfigProviderProps>) {
    elConfig.value = { ...elConfig.value, ...config };
  };

  function setConfigItem<K extends keyof ConfigProviderProps>(key: K, value: ConfigProviderProps[K]) {
    elConfig.value[key] = value;
  }

  function resetElConfig() {
    elConfig.value = createDefaultConfig();
  }

  return { elConfig, setElConfig, setConfigItem, resetElConfig };
}, {
  persist: true,
});

export function useElConfigStoreWithOut() {
  return useElConfigStore(store);
}
