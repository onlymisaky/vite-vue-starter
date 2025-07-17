<script setup lang="ts">
import { nextTick, ref, useTemplateRef, watch } from 'vue';
import { isDark, toggleDark } from '@/hooks/useDark';
import { themeAnimation } from '@/utils/theme-animation';
import Dark from './Icons/Dark.vue';
import Light from './Icons/Light.vue';

const darkMode = ref(isDark.value);
const switchRef = useTemplateRef('switchRef');

watch(
  () => darkMode.value,
  () => {
    toggleDark();
  },
);

async function beforeChange() {
  const switchElement = switchRef.value?.$el;
  const rect = switchElement.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  await themeAnimation({ x, y }, isDark.value, { duration: 400 });
  await nextTick();
  return true;
}
</script>

<template>
  <ElSwitch
    ref="switchRef"
    v-model="darkMode"
    :before-change="beforeChange"
    :active-action-icon="Dark"
    :inactive-action-icon="Light"
  />
</template>
