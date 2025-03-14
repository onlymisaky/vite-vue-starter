import * as path from 'node:path';
import legacy from '@vitejs/plugin-legacy';
import vue from '@vitejs/plugin-vue';
import { codeInspectorPlugin } from 'code-inspector-plugin';
import AutoImport from 'unplugin-auto-import/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig, loadEnv } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';

const manualChunks: Record<string, string> = {
  // [path.join(__dirname, 'src', 'layout/')]: 'src-layout',
  // [path.join(__dirname, 'src', 'components/')]: 'src-components',
  // [path.join(__dirname, 'src', 'utils/')]: 'src-utils',
  // [path.join(__dirname, 'src', 'hooks/')]: 'src-hooks',
  [path.join(__dirname, 'node_modules', 'vue/')]: 'vendor-vue',
  [path.join(__dirname, 'node_modules', '@vue/')]: 'vendor-vue',
  [path.join(__dirname, 'node_modules', 'vue-router/')]: 'vendor-vue-router',
  [path.join(__dirname, 'node_modules', 'pinia/')]: 'vendor-pinia',
  [path.join(__dirname, 'node_modules', 'pinia-plugin-persistedstate/')]: 'vendor-pinia-plugin-persistedstate',
  [path.join(__dirname, 'node_modules', '@vueuse/')]: 'vendor-vue-use',
  [path.join(__dirname, 'node_modules', 'element-plus/')]: 'vendor-element-plus',
  [path.join(__dirname, 'node_modules', '@element-plus/icons-vue/')]: 'vendor-element-plus-icons',
  [path.join(__dirname, 'node_modules', 'axios/')]: 'vendor-axios',
  // [path.join(__dirname, 'node_modules', 'nprogress/')]: 'vendor-nprogress',
  [path.join(__dirname, 'node_modules', 'fuse.js/')]: 'vendor-fuse.js',
};

// https://vite.dev/config/
export default defineConfig((config) => {
  const envDir = path.resolve(process.cwd(), './environments');
  const env = loadEnv(config.mode, envDir, '') as unknown as ViteEnv;
  return {
    base: env.BASE_URL,
    envDir,
    plugins: [
      vue(),
      vueDevTools(),
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
          api: 'modern-compiler',
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
      chunkSizeWarningLimit: 200,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            for (const key in manualChunks) {
              if (id.startsWith(key)) {
                return manualChunks[key];
              }
            }
            if (id.includes('/node_modules/')) {
              return 'vendor';
            }
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
  };
});
