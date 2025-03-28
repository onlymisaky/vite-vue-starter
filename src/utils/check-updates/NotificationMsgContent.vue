<script setup lang="ts">
import type { VNode } from 'vue';
import type { CheckUpdatesNotifyActionType } from './check-updates';
import { isVNode } from 'vue';

defineProps<{
  changelog?: string | VNode
}>();

const emits = defineEmits<{
  (e: 'updateAction', action: CheckUpdatesNotifyActionType): void
}>();

const buttons: Array<{
  type: 'primary' | 'default'
  class?: string
  action: CheckUpdatesNotifyActionType
  text: string
}> = [
  { type: 'primary', class: 'ml-[12px]', action: 'update', text: '更新' },
  { type: 'default', action: 'remind-later', text: '稍后提醒' },
  { type: 'default', action: 'skip-this-version', text: '跳过' },
  { type: 'default', action: 'never-notify', text: '不再提示' },
];
</script>

<template>
  <div class="flex flex-col gap-2">
    <div>有新的版本可用，是否更新？</div>
    <template v-if="changelog">
      <component
        :is="changelog"
        v-if="isVNode(changelog)"
      />
      <div
        v-else
        class="text-sm"
        v-html="changelog"
      />
    </template>
    <div class="flex justify-end flex-row-reverse mt-[10px]">
      <ElButton
        v-for="{ type, class: btnClass, action, text } in buttons"
        :key="action"
        :type="type"
        :class="btnClass"
        size="small"
        @click="() => emits('updateAction', action)"
      >
        {{ text }}
      </ElButton>
    </div>
  </div>
</template>
