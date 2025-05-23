<script setup lang="ts">
import type { TableConfig } from './types';
import { useResetableRef } from '@/hooks/useResetableState';
import Add from './toolbar/Add.vue';
import Refresh from './toolbar/Refresh.vue';
import Settings from './toolbar/Settings.vue';

defineEmits(['refresh', 'add']);

const [tableConfig, resetTableConfig] = useResetableRef<TableConfig>({
  size: 'default',
  showHeader: true,
  border: false,
  stripe: false,
  fit: true,
  highlightCurrentRow: false,
  tooltipEffect: 'dark',
  tableLayout: 'fixed',
});
</script>

<template>
  <div
    data-role="list-page"
    class="w-full h-full flex flex-col overflow-hidden"
  >
    <slot name="others" :table-config="tableConfig" />
    <div
      v-if="$slots.filter"
      data-role="list-page-filter-container"
      class="bg-white dark:bg-gray-800 rounded-lg p-[10px] shadow-md mb-[10px]"
    >
      <slot name="filter" />
    </div>
    <div
      data-role="list-page-table"
      class="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-lg p-[10px] shadow-md overflow-hidden"
    >
      <div
        data-role="list-page-table-toolbar"
        class="flex mb-[10px]"
      >
        <div class="flex flex-1">
          <Add @click="$emit('add')" />
        </div>
        <div class="flex ml-auto items-center gap-[10px]">
          <Refresh @click="$emit('refresh')" />
          <Settings
            v-model:table-config="tableConfig"
            @reset="resetTableConfig"
          />
        </div>
      </div>

      <div
        data-role="list-page-table-content"
        class="flex flex-1 h-full overflow-hidden"
      >
        <slot :table-config="tableConfig" />
      </div>
      <div
        v-if="$slots.pagination"
        data-role="list-page-pagination"
        class="flex justify-center mt-[10px]"
      >
        <slot name="pagination" />
      </div>
    </div>
  </div>
</template>
