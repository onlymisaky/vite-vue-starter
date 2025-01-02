<script setup lang="ts">
defineProps({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  buttonText: {
    type: String,
  },
});

const emits = defineEmits(['click']);
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full w-full bg-gradient-to-b overflow-hidden">
    <!--  插画 -->

    <slot name="illustration" />

    <!-- 文字内容 -->
    <div class="text-center">
      <h1 class="text-6xl font-bold mb-3">
        <slot name="title">
          {{ title }}
        </slot>
      </h1>
      <p class="text-xl mb-6">
        <slot name="description">
          {{ description }}
        </slot>
      </p>
      <ElButton
        v-if="buttonText || $slots.button"
        type="primary"
        class="rounded-full px-8"
        @click="emits('click')"
      >
        <slot name="button">
          {{ buttonText }}
        </slot>
      </ElButton>
    </div>
  </div>
</template>
