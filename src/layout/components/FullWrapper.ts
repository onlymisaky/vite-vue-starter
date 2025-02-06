import type { Component, FunctionalComponent, RendererElement, RendererNode, VNode } from 'vue';
import type { RouteLocationNormalizedLoadedGeneric } from 'vue-router';
import { defineComponent, h } from 'vue';

export type RouterViewSlot = VNode<RendererNode, RendererElement, { [key: string]: any }>;

export default function FullWrapper(Component: RouterViewSlot, route: RouteLocationNormalizedLoadedGeneric) {
  const name = `view-${(Component?.type as Component)?.name || (Component?.type as FunctionalComponent)?.__name || route?.name as string}`;
  return defineComponent({
    name,
    setup(_, { slots }) {
      return () => h('div', { class: 'h-full w-full' }, slots.default?.() || Component);
    },
  });
}

/**
 * [问题: 动画]
 * 被 Transition 包裹的组件，可以正常加载，但是加了 mode="out-in" 后
 * 如果该组件存在多个根节点，则会导致组件无法正常渲染(白屏)
 * 所有想到用高阶组件，用一个根节点将组件包裹，这样就可以正常渲染了
  <RouterView v-slot="{ Component }">
    <Transition appear name="fade-slide" mode="out-in">
      <component :is="FullWrapper(Component)" />
    </Transition>
  </RouterView>
 * [问题: 缓存]
 * 但是如果还想使用 KeepAlive 对组件进行缓存，就比较困难了
 * 因为高阶组件每次都会返回一个新的组件，缓存永远也不会命中
 * 如果采用嵌套的形式，又会导致没有加载动画，因为 FullWrapper 始终是同一个组件，且没有变化
  <RouterView v-slot="{ Component }">
    <Transition appear name="fade-slide" mode="out-in">
      <FullWrapper>
        <KeepAlive>
          <component :is="Component" />
        </KeepAlive>
      </FullWrapper>
    </Transition>
  </RouterView>
 * 后面又想出下面这种形式
  <RouterView v-slot="{ Component }">
    <Transition appear name="fade-slide" mode="out-in">
      <KeepAlive>
        <component :is="h(FullWrapper(Component, $route), null, Component)" :key="$route.fullPath" />
      </KeepAlive>
    </Transition>
  </RouterView>
 * 但这样在切换的时候，又会导致控制报错: Uncaught TypeError: parentComponent.ctx.deactivate is not a function
 * [结论]
 * 最后折腾了半天，决定还是用规范去约束: 路由组件必须只能有一个根节点
 * [后记]
 * 后来发现，只要给 component 加个 key ,就能命中缓存，但是依旧会报错: Uncaught TypeError: parentComponent.ctx.deactivate is not a function
  <RouterView v-slot="{ Component }">
    <Transition appear name="fade-slide" mode="out-in">
      <KeepAlive>
        <component :is="FullWrapper(Component, $route)" :key="$route.fullPath" />
      </KeepAlive>
    </Transition>
  </RouterView>
 */
