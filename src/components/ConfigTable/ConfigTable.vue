<script setup lang="ts">
import type { Emits, Props, Slots, TableColumnPropsWithRender } from './types.d';
import { computed, useAttrs, useTemplateRef } from 'vue';
import { useProxyExpose } from '@/hooks/useProxyExposejs';

const fakeProps = defineProps<Props>();

defineEmits<Emits>();

defineSlots<Slots>();

const attrs = useAttrs();

const tableProps = computed(() => {
  return { ...attrs, data: fakeProps.data };
});

const tableSlots = ['append', 'empty'] as const;

const columns = computed(() => {
  return fakeProps.columns.map((item) => {
    const { render, slots = {}, ...rest } = item;

    const slotsMap: TableColumnPropsWithRender['slots'] = {};

    Object.keys(slots).forEach((key) => {
      const slotName = key as keyof TableColumnPropsWithRender['slots'];
      if (typeof slots[slotName] === 'function') {
        slotsMap[slotName] = slots[slotName];
      }
    });

    if (!slotsMap.default && render && typeof render === 'function') {
      slotsMap.default = render;
    }

    return {
      ...rest,
      slots: slotsMap as Required<TableColumnPropsWithRender['slots']>,
    };
  });
});

const tableRef = useTemplateRef('tableRef');

const proxyExposed = useProxyExpose(tableRef, { getName() {} });

// 我踏马真想知道这个傻逼宏是怎么实现的，连踏马jsdoc都能编译报错
defineExpose(proxyExposed);
</script>

<template>
  <ElTable v-bind="tableProps" ref="tableRef">
    <template
      v-for="slotName in tableSlots"
      :key="slotName"
      #[slotName]="slotProps"
    >
      <slot
        :name="slotName"
        v-bind="slotProps"
      />
    </template>

    <template #default>
      <slot
        v-for="(column, index) in columns"
        :name="`column-${column.prop}`"
        v-bind="{ row: columns[index], column, $index: index }"
      >
        <ElTableColumn v-bind="column" :key="column.prop">
          <template
            v-for="(slotFn, slotName) in column.slots"
            :key="slotName"
            #[slotName]="slotProps"
          >
            <component :is="slotFn(slotProps)" />
          </template>
        </ElTableColumn>
      </slot>
    </template>
  </ElTable>
</template>
