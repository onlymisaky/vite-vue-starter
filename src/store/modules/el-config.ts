import type { ConfigProviderProps } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import { defineStore } from 'pinia';
import { ref } from 'vue';

const defaultConfig: Partial<ConfigProviderProps> = {
  // 如果想重置 el-plus 的默认配置，可以在这里覆盖
  locale: zhCn,
};

function createDefaultConfig() {
  return { ...defaultConfig };
}

export default defineStore('elConfig', () => {
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
