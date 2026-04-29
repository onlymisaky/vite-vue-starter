import type { VNode } from 'vue';
import { Fragment } from 'vue';

export function isRenderableVNode(node: VNode): boolean {
  if (node.type === Comment) {
    return false;
  }

  if (node.type === Text) {
    return String(node.children || '').trim().length > 0;
  }

  if (node.type === Fragment) {
    const children = Array.isArray(node.children) ? node.children as VNode[] : [];
    return children.some(child => isRenderableVNode(child));
  }

  return true;
}

export function hasRenderableSlotContent(nodes: VNode[] | undefined) {
  if (!nodes?.length) {
    return false;
  }

  return nodes.some(node => isRenderableVNode(node));
}
