import type { GetManualChunk } from 'rollup';
import * as path from 'node:path';
import legacy from '@vitejs/plugin-legacy';
import vue from '@vitejs/plugin-vue';
import { codeInspectorPlugin } from 'code-inspector-plugin';
import AutoImport from 'unplugin-auto-import/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { createLogger, defineConfig, loadEnv } from 'vite';
// import Inspect from 'vite-plugin-inspect';
import vueDevTools from 'vite-plugin-vue-devtools';
// import vueInspector from 'vite-plugin-vue-inspector';
import { dependencies } from './package.json';

function splitVendor(isBuild: boolean): GetManualChunk {
  if (!isBuild) {
    return function manualChunks(_id: string) { };
  }

  const skipModules = ['nprogress', 'vue'];
  const manualChunksMap = Object.keys(dependencies).reduce((acc, key) => {
    if (skipModules.includes(key))
      return acc;

    const pkgDirPrefix = path.join(__dirname, 'node_modules', `${key}/`);
    const value = `vendor-${key.replace('@', '').replace('/', '-')}`;

    return {
      ...acc,
      [pkgDirPrefix]: value,
    };
  }, {} as Record<string, string>);

  manualChunksMap[path.join(__dirname, 'node_modules', 'vue/')] = 'vendor-vue';
  manualChunksMap[path.join(__dirname, 'node_modules', '@vue/')] = 'vendor-vue';

  const vendorDir = path.join(__dirname, 'node_modules');

  return function manualChunks(id: string) {
    for (const pkgDirPrefix in manualChunksMap) {
      if (id.startsWith(pkgDirPrefix)) {
        return manualChunksMap[pkgDirPrefix];
      }
    }
    if (id.startsWith(vendorDir)) {
      return 'vendor';
    }
  };
}

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

  const manualChunks = splitVendor(config.command === 'build');

  return {
    base: env.BASE_URL,
    envDir,
    plugins: [
      vue(),
      vueDevTools(),
      // Inspect(),
      // vueInspector(),
      codeInspectorPlugin({ bundler: 'vite' }),
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
      rollupOptions: {
        output: {
          manualChunks,
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
