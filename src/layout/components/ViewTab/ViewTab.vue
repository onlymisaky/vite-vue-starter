<script lang="ts" setup>
import type { IViewTab } from '@/store/modules/view-tab';
import { useViewTabStore } from '@/store/modules/view-tab';

const viewTab = useViewTabStore();

function removeTab(tab: IViewTab, event: Event) {
  event.stopPropagation();
  viewTab.removeTab(tab.fullPath);
}
</script>

<template>
  <div class="views-tab-wrapper">
    <ElScrollbar class="flex-1">
      <div class="views-tab">
        <div
          v-for="(tab, index) in viewTab.tabs"
          :key="tab.fullPath"
          :class="{ active: viewTab.activeTab?.fullPath === tab.fullPath }"
          class="views-tab-item group"
          draggable="true"
          @click="viewTab.setActive(tab)"
        >
          <span
            class="divider group-hover:invisible"
            :class="{ invisible: viewTab.activeTab?.fullPath === tab.fullPath || index === 0 }"
          />
          <ElIcon
            v-if="tab.icon"
            :size="16"
            class="mr-1"
          >
            <component :is="tab.icon" />
          </ElIcon>
          <span class="text-sm truncate max-w-[120px]">{{ tab.title }}</span>
          <ElIcon
            class="ml-2
          text-gray-500 dark:text-gray-400
          hover:text-gray-700 dark:hover:text-gray-200
          hover:bg-gray-200 dark:hover:bg-gray-700
          transition-colors duration-200 rounded-full p-1 box-content
          "
            @click="removeTab(tab, $event)"
          >
            <Close />
          </ElIcon>
        </div>
      </div>
    </ElScrollbar>
  </div>
</template>

<style>
:root {
  --chrome-tab-bg-color: #f0f0f0;
  --chrome-tab-border-color: #ccc;
  --chrome-tab-active-bg-color: #fff;
  --chrome-tab-active-shadow-color: rgba(0, 0, 0, 0.1);
  --chrome-tab-hover-bg-color: #e0e0e3;
}

html.dark {
  --chrome-tab-bg-color: #1a1a1a;
  --chrome-tab-border-color: #555;
  --chrome-tab-active-bg-color: #2d2d2d;
  --chrome-tab-active-shadow-color: rgba(0, 0, 0, 0.3);
  --chrome-tab-hover-bg-color: #3a3a3a;
}
</style>

<style scoped>
.views-tab-wrapper {
  display: flex;
  background-color: var(--chrome-tab-bg-color);

  /* #e5e7eb  */
  border-bottom: 1px solid var(--chrome-tab-border-color);

  .views-tab {
    flex: 1;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    height: 38px;
    padding-top: 4px;

    /* overflow-x: auto; */

    .views-tab-item {
      height: 100%;
      padding-left: 4px;
      padding-right: 8px;
      display: flex;
      align-items: center;
      cursor: pointer;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;

      /* transition: all 0.2s ease-in-out; */

      .divider {
        border-left: 1px solid var(--chrome-tab-border-color);
        height: 20px;
        margin-right: 10px;
        margin-left: -4px;
      }

      &.active {
        background-color: var(--chrome-tab-active-bg-color);
        box-shadow: 0 0 10px 0 var(--chrome-tab-active-shadow-color);
        position: relative;
        color: var(--el-menu-active-color);

        &::before,
        &::after {
          content: '';
          position: absolute;
          bottom: -1px;
          width: 10px;
          height: 10px;
          background-color: transparent;
          border-bottom: 1px solid var(--chrome-tab-active-bg-color);
        }

        &::before {
          left: -9px;
          border-bottom-right-radius: 10px;
          border-right: 1px solid var(--chrome-tab-active-bg-color);
          box-shadow: 4px 4px 0 4px var(--chrome-tab-active-bg-color);
        }

        &::after {
          right: -9px;
          border-bottom-left-radius: 10px;
          border-left: 1px solid var(--chrome-tab-active-bg-color);
          box-shadow: -4px 4px 0 4px var(--chrome-tab-active-bg-color);
        }

        &+.views-tab-item {
          .divider {
            visibility: hidden;
          }
        }
      }

      &:hover:not(.active) {
        background-color: var(--chrome-tab-hover-bg-color);

        &+.views-tab-item {
          .divider {
            visibility: hidden;
          }
        }
      }
    }
  }
}
</style>
