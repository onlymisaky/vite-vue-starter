<script lang="ts" setup>
import type { IViewTab } from '@/store/modules/view-tab';
import SrcollView from '@/components/SrcollView/ScrollView.vue';
import { useViewTabStore } from '@/store/modules/view-tab';
import { nextTick, ref, useTemplateRef, watch } from 'vue';

const viewTab = useViewTabStore();

const scrollViewRef = useTemplateRef<InstanceType<typeof SrcollView>>('scrollViewRef');
const tabsRef = useTemplateRef<HTMLDivElement[]>('tabs');

function scrollToActiveTab() {
  // 确保 active 在可视区域内
  nextTick(() => {
    if (scrollViewRef.value) {
      const { canScroll } = scrollViewRef.value.checkCanScroll();
      if (!canScroll) {
        return;
      }
      if ([0, 1].includes(viewTab.activeIndex)) {
        scrollViewRef.value.scrollTo(0);
      }
      else {
        scrollViewRef.value.scrollTo(tabsRef.value![viewTab.activeIndex - 1].offsetLeft);
      }
    }
  });
}

watch(() => viewTab.activeTab, (val) => {
  if (!val) {
    return;
  }

  scrollToActiveTab();
}, { deep: true, immediate: true });

function removeTab(tab: IViewTab, event: Event) {
  event.stopPropagation();
  viewTab.removeTab(tab.fullPath);
}

function handleContextMenu(event: MouseEvent, _tab: IViewTab, _index: number) {
  event.stopPropagation();
  event.preventDefault();
}

const dragIndex = ref<number>(-1);
const moving = ref(false);

function handleDragStart(event: DragEvent, _tab: IViewTab, _index: number) {
  event.stopPropagation();
  dragIndex.value = _index;
  (event.target as HTMLElement).classList.add('overflow-hidden');
}

function handleDragEnter(event: DragEvent, _tab: IViewTab, _index: number) {
  event.stopPropagation();
  if (moving.value) {
    return;
  }

  // const temp = viewTab.tabs[_index];
  // viewTab.tabs[_index] = viewTab.tabs[dragIndex.value];
  // viewTab.tabs[dragIndex.value] = temp;

  const draggedTab = viewTab.tabs.splice(dragIndex.value, 1)[0];
  viewTab.tabs.splice(_index, 0, draggedTab);

  dragIndex.value = _index;
}

function handleDragOver(event: DragEvent, _tab: IViewTab, _index: number) {
  event.preventDefault();
  (event.target as HTMLElement).classList.remove('overflow-hidden');
}

function handleDragEnd(event: DragEvent, _tab: IViewTab, _index: number) {
  event.stopPropagation();
  event.preventDefault();
  moving.value = false;
}

function handleTransitionStart(event: TransitionEvent, _tab: IViewTab, _index: number) {
  event.stopPropagation();
  moving.value = true;
}

function handleTransitionEnd(event: TransitionEvent, _tab: IViewTab, _index: number) {
  event.stopPropagation();
  moving.value = false;
}
</script>

<template>
  <div
    v-if="viewTab.tabs.length > 0"
    class="views-tab-wrapper"
  >
    <SrcollView
      ref="scrollViewRef"
      direction="horizontal"
      :resize-callback="scrollToActiveTab"
      class="flex-1"
    >
      <TransitionGroup
        name="drag"
        tag="div"
        class="views-tab"
      >
        <div
          v-for="(tab, index) in viewTab.tabs"
          :key="tab.fullPath"
          ref="tabs"
          :class="{ active: viewTab.activeTab?.fullPath === tab.fullPath }"
          class="views-tab-item group"
          draggable="true"
          @click="viewTab.setActive(tab)"
          @contextmenu="handleContextMenu($event, tab, index)"
          @dragstart="handleDragStart($event, tab, index)"
          @dragenter="handleDragEnter($event, tab, index)"
          @dragover="handleDragOver($event, tab, index)"
          @dragend="handleDragEnd($event, tab, index)"
          @transitionstart="handleTransitionStart($event, tab, index)"
          @transitionend="handleTransitionEnd($event, tab, index)"
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
      </TransitionGroup>
    </SrcollView>
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
.drag-move,
.drag-enter-active,
.drag-leave-active {
  overflow: hidden;
  transition: all 0.3s ease;
}

.drag-enter-from,
.drag-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.views-tab-wrapper {
  display: flex;
  background-color: var(--chrome-tab-bg-color);
  border-bottom: 1px solid var(--chrome-tab-border-color);

  .views-tab {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    height: 38px;
    width: max-content;
    padding-top: 4px;
    padding-left: 4px;
    box-sizing: content-box;

    .views-tab-item {
      height: 100%;
      padding-left: 4px;
      padding-right: 8px;
      display: flex;
      align-items: center;
      cursor: pointer;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;

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

      &:active:not(.active) {
        background-color: var(--chrome-tab-active-bg-color);

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
