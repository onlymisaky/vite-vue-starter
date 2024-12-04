import path from 'node:path';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import IconsResolver from 'unplugin-icons/resolver';
import Icons from 'unplugin-icons/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    /**
     * @link https://github.com/unplugin/unplugin-auto-import#readme
     * @description 按需自动导入模块，强烈建议只配置 **基础且必须** 的依赖上，比如 vue 、 ElementPlus
     */
    AutoImport({
      resolvers: [
        // 可以直接使用诸如 ElMessage.success
        ElementPlusResolver(),
        IconsResolver(),
      ],
      dts: path.resolve(process.cwd(), './types/auto-imports.d.ts'),
    }),
    /**
     * @link https://github.com/unplugin/unplugin-vue-components#readme
     * @description 按需自动导入并注册组件，强烈建议只用配置 **最底层且广泛使用且必须* 的组件库
     */
    Components({
      globs: [],
      resolvers: [
        // 自动注册图标，图标来源: https://icon-sets.iconify.design/ https://icones.js.org/
        IconsResolver({
          alias: {
            // ep(ElementPlus): https://icon-sets.iconify.design/ep/
            'ep': 'ep',
          },
          enabledCollections: ['ep'],
        }),
        // 自动注册 ElementPlus 组件
        ElementPlusResolver(),
      ],
      dts: path.resolve(process.cwd(), './types/components.d.ts'),
    }),
    Icons({
      // 自动安装图标依赖
      autoInstall: true,
      compiler: 'vue3',
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
});
