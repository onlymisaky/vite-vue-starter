<script setup lang="ts">
import type { PropType } from 'vue';
import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue';
import AppLink from '@/components/AppLink.vue';
import ScrollView from '@/components/ScrollView/ScrollView.vue';

const props = defineProps({
  list: {
    type: Array as PropType<IMenuItem[]>,
    required: true,
  },
});
const emits = defineEmits(['select']);

const activeIndex = ref(-1);
const scrollViewRef = useTemplateRef<InstanceType<typeof ScrollView>>('scrollViewRef');
const appLinkRefs = useTemplateRef<HTMLLIElement[]>('appLinkRefs');

function toggleResult(e: KeyboardEvent) {
  if (!['ArrowUp', 'ArrowDown'].includes(e.key)) {
    return;
  }

  const total = props.list.length;
  const isUp = e.key === 'ArrowUp';

  // 使用取模运算实现循环
  activeIndex.value = (activeIndex.value + (isUp ? -1 : 1) + total) % total;

  scrollViewRef.value?.scrollTo(activeIndex.value * 56);
}

function isDisabled(item: IMenuItem) {
  return item.disabled || (!item.externalLink && !item.route) || !!item.items;
}

function handleKeydown(e: KeyboardEvent) {
  if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
    toggleResult(e);
  }
  if (e.key === 'Enter' && props.list[activeIndex.value] && !isDisabled(props.list[activeIndex.value])) {
    if (appLinkRefs.value) {
      appLinkRefs.value[activeIndex.value]?.querySelector('[data-role="app-link"]')?.click();
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div class="h-[400px]">
    <ScrollView
      ref="scrollViewRef"
    >
      <ul class="w-full flex flex-col">
        <li
          v-for="(menuItem, index) in list"
          :key="menuItem.index"
          ref="appLinkRefs"
          class="item flex flex-1 h-[56px] rounded-[4px] mb-[8px] bg-[#e5e7eb] dark:bg-[#4c4c4c]"
          :class="[
            { active: activeIndex === index },
            isDisabled(menuItem) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
          ]"
          @mouseover="activeIndex = index"
          @mouseleave="activeIndex = -1"
        >
          <AppLink
            class="flex flex-1 items-center p-[20px]"
            :route="menuItem.route"
            :link="menuItem.externalLink"
            :disabled="isDisabled(menuItem)"
            @click="emits('select', $event, menuItem.index)"
          >
            <ElIcon
              :size="24"
              class="mr-[10px]"
            >
              <component :is="menuItem.icon || 'Menu'" />
            </ElIcon>
            <template v-if="menuItem.parents && menuItem.parents.length">
              <span
                v-for="parent in menuItem.parents"
                :key="parent.index"
                :class="{}"
                class="text-placeholder"
              >
                {{ parent.title }}&nbsp;&nbsp;>&nbsp;&nbsp;
              </span>
            </template>
            <span class="font-[500]">
              {{ menuItem.title }}
            </span>
          </AppLink>
        </li>
      </ul>
    </ScrollView>
  </div>
</template>

<style scoped>
.active {
  background: rgb(100, 108, 255) !important;
  color: rgb(255, 255, 255) !important;
}

.disabled {
  cursor: not-allowed !important;
}
</style>
