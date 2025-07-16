<script setup lang="ts">
import type { Emits, Props, Slots, TableColumnPropsWithRender } from './types.d';
import { computed, useAttrs, useTemplateRef } from 'vue';
import { useProxyExpose } from '@/hooks/useProxyExpose';

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

const proxyExposed = useProxyExpose(tableRef);

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

    <template
      v-for="(column, index) in columns"
      :key="column.prop"
    >
      <!-- TODO -->
      <!--
      <ConfigTable :data="data" :columns="column">
        现在
        <template #column-xxx="{ column }">
          <ElTableColumn v-bind="column">
            <template #header>{{ column.label }}</template>
            <template #default="{row}">
              {{ row.xxx }}
            </template>
          </ElTableColumn>
        </template>

        期望
        <template #column-xxx="{ column }">
          <template #header>{{ column.label }}</template>
          <template #default="{row}">
            {{ row.xxx }}
          </template>
        </template>
      </ConfigTable>
      -->

      <slot
        :name="`column-${column.prop}`"
        v-bind="{ row: columns[index], column, $index: index }"
      >
        <ElTableColumn v-bind="column">
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
