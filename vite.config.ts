import * as path from 'node:path';
import legacy from '@vitejs/plugin-legacy';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { createLogger, defineConfig, loadEnv } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';

import { createVendorGroups } from './scripts/vite-output-vendor';

// https://vite.dev/config/
export default defineConfig((config) => {
  const envDir = path.resolve(process.cwd(), './environments');
  const env = loadEnv(config.mode, envDir, '') as unknown as ViteEnv;

  const logger = createLogger();
  const loggerError = logger.error;
  logger.error = (msg, options) => {
    if (msg.includes('http proxy error:')) {
      return;
    }
    loggerError(msg, options);
  };

  const vendorGroups = createVendorGroups(config.command === 'build');
  // const manualChunks = splitVendor(config.command === 'build');

  return {
    base: env.BASE_URL,
    envDir,
    plugins: [
      vue(),
      vueDevTools(),
      legacy({
        targets: ['defaults', 'not IE 11'],
      }),
      /**
       * @link https://github.com/unplugin/unplugin-auto-import#readme
       * @description 按需自动导入模块，强烈建议只配置 **基础且必须** 的依赖上，比如 vue 、 ElementPlus
       */
      AutoImport({
        resolvers: [
          // 可以直接使用诸如 ElMessage.success
          ElementPlusResolver(),
        ],
        dts: path.resolve(process.cwd(), './src/types/auto-imports.d.ts'),
      }),
      /**
       * @link https://github.com/unplugin/unplugin-vue-components#readme
       * @description 按需自动导入并注册组件，强烈建议只用配置 **最底层且广泛使用且必须* 的组件库
       */
      Components({
        // globs: [],
        resolvers: [
          // 自动注册 ElementPlus 组件
          ElementPlusResolver(),
        ],
        // dts: path.resolve(process.cwd(), './src/types/components.d.ts'),
        dts: false,
      }),

    ],
    css: {
      preprocessorOptions: {
        scss: {
          // vite 7 仅支持现代 API
          // api: 'modern-compiler',
        },
      },
      // 如果想将所有的配置文件都放在 configs 目录下，postcss 可以这样配置
      // postcss: path.resolve(process.cwd(), './configs/postcss.config.js'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      chunkSizeWarningLimit: 240,
      rolldownOptions: {
        output: {
          // manualChunks,
          codeSplitting: {
            groups: vendorGroups,
          },
        },
      },
    },
    server: {
      host: true,
      proxy: {
        [env.VITE_API_PREFIX]: {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp(`^${env.VITE_API_PREFIX}`), ''),
        },
      },
    },
    customLogger: logger,
  };
});
