<script setup lang="ts">
import type { DialogProps, ElDialog } from 'element-plus';
import { computed, useAttrs, useTemplateRef } from 'vue';
import { useProxyExpose } from '@/hooks/useProxyExpose';
import { useVModel } from '@/hooks/useVModel';

type ElDialogType = InstanceType<typeof ElDialog>;

/**
 * https://github.com/vuejs/core/issues/8286
 * 真的垃圾，这么多年了，还是不支持复杂类型
 * 只能放弃编译时转换
 */
type Emits = /** @vue-ignore */ TransformToVueEmitTypes<ElDialogType>;

/**
 * @link {https://cn.vuejs.org/guide/typescript/composition-api.html#typing-component-props}
 * 本来可以直接 const props = defineProps<Partial<DialogProps>>();
 * 但是由于 ElDialog 的 props 部分属性默认值是 true (closeOnClickModal, modal 等等)
 * 而 defineProps 推导编译出的 props 运行时没有 default 选项 (所以默认值就是 false)
 * 这就导致需要使用 withDefaults 来设置默认值，和 ElDialog 保持一直
 * 但是这样很蠢、很被动、很麻烦
 * 所以采用了下面这种方式:
 *  通过 vue-ignore 标记，推导编译出的运行时结果是空对象，
 *  由于使用了 useVModel ， props 中必须要定义 modelValue ，所以将 modelValue 单独定义
 * 因此这里的 props 单纯是为了在使用组件时可以实现类型提示
 * 实际上除了 modelValue ，其它属性都是从 attrs 中获取的
 */
interface Props extends /* @vue-ignore */ Partial<Omit<DialogProps, 'modelValue'>> {
  modelValue: boolean
}

const props = defineProps<Props>();

/** 为了类型提示 */
defineEmits<Emits>();

const attrs = useAttrs();

const propsAndAttrs = computed(() => {
  return { ...attrs, ...props };
});

const visible = useVModel(props, 'modelValue');

const dialogRef = useTemplateRef('dialogRef');

const proxyExposed = useProxyExpose(dialogRef, {});

defineExpose(proxyExposed);
</script>

<template>
  <ElDialog
    v-bind="{ ...propsAndAttrs }"
    ref="dialogRef"
    v-model="visible"
  >
    <template
      v-for="(_slot, slotName) in $slots"
      :key="slotName"
      #[slotName]="slotProps"
    >
      <slot
        v-bind="slotProps"
        :name="slotName"
      />
    </template>
  </ElDialog>
</template>
