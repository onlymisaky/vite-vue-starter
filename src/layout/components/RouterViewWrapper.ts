import type { RendererElement, RendererNode, VNode } from 'vue';
import { defineComponent, h } from 'vue';

type RouterViewSlot = VNode<RendererNode, RendererElement, { [key: string]: any }>;

export default (Component: RouterViewSlot) => defineComponent({
  name: 'RouterViewWrapper',
  setup() {
    return () => h('div', { class: 'h-full w-full' }, Component);
  },
});
