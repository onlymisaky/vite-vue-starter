<script setup lang="ts">
import type { PropType } from 'vue';
import AppLink from '@/components/AppLink.vue';
import { computed } from 'vue';

defineOptions({
  name: 'MenuItem',
});

const props = defineProps({
  menu: {
    type: Object as PropType<IMenuItem>,
    required: true,
  },
});

const isSubMenu = computed(() => {
  return Array.isArray(props.menu.items) && props.menu.items.length > 0;
});
</script>

<template>
  <ElSubMenu
    v-if="isSubMenu"
    :index="menu.index"
  >
    <template #title>
      <ElIcon :size="18">
        <component :is="menu.icon || 'Menu'" />
      </ElIcon>
      <span class="block overflow-hidden">{{ menu.title }}</span>
    </template>
    <MenuItem
      v-for="item in menu.items"
      :key="item.index"
      :menu="item"
    />
  </ElSubMenu>
  <AppLink
    v-else
    :disabled="menu.disabled"
    :route="menu.route"
    :link="menu.externalLink"
    :show-disabled-style="false"
  >
    <ElMenuItem
      :disabled="menu.disabled"
      :index="menu.index"
    >
      <ElIcon :size="18">
        <component :is="menu.icon || 'Menu'" />
      </ElIcon>
      <template #title>
        <span class="block overflow-hidden">{{ menu.title }}</span>
      </template>
    </ElMenuItem>
  </AppLink>
</template>
