<script setup lang="ts">
import IconWithBg from '@/components/IconWithBg.vue';
import ScrollView from '@/components/ScrollView/ScrollView.vue';
import { useMenuStore } from '@/store/modules/menu';
import MenuItem from './MenuItem.vue';

const menuStore = useMenuStore();
</script>

<template>
  <div class="bg-[var(--app-menu-bg-color)] flex flex-col overflow-hidden">
    <ScrollView>
      <ElMenu
        :collapse="menuStore.isCollapse"
        :default-active="menuStore.activeMenu"
        class="border-none"
        :show-timeout="menuStore.animationDuration"
        :hide-timeout="menuStore.animationDuration"
        :router="false"
      >
        <MenuItem
          v-for="menu in menuStore.menus"
          :key="menu.index"
          :menu="menu"
        />
      </ElMenu>
    </ScrollView>
    <div class="flex items-center p-[20px] h-[40px] overflow-hidden">
      <span class="flex items-center">
        <IconWithBg
          :size="18"
          :tip="menuStore.isCollapse ? '展开' : '收起'"
          @click="menuStore.toggleCollapse"
        >
          <component :is="menuStore.isCollapse ? 'DArrowRight' : 'DArrowLeft'" />
        </IconWithBg>
      </span>
    </div>
  </div>
</template>
