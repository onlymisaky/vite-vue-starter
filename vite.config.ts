import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
    // 如果想将所有的配置文件都放在 configs 目录下，postcss 可以这样配置
    // postcss: path.resolve(process.cwd(), './configs/postcss.config.js'),
  },
});
