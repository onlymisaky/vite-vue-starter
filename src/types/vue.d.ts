// import 'vue';

import type {
  ComponentPublicInstance,
  ComputedOptions,
  MethodOptions,
  VNode,
  VNodeArrayChildren,
} from 'vue';

export {};

declare module 'vue' {
  // copy from @vue/runtime-core/dist/runtime-core.d.ts
  export type RawChildren = string | number | boolean | VNode | VNodeArrayChildren | (() => any);

  // copy from @vue/runtime-core/dist/runtime-core.d.ts
  export interface RawSlots {
    [name: string]: unknown
    $stable?: boolean
  }

  // copy from @vue/runtime-core/dist/runtime-core.d.ts
  export interface ComponentPublicInstanceConstructor<
    T extends ComponentPublicInstance<Props, RawBindings, D, C, M> = ComponentPublicInstance<any>,
    Props = any,
    RawBindings = any,
    D = any,
    C extends ComputedOptions = ComputedOptions,
    M extends MethodOptions = MethodOptions,
  > {
    __isFragment?: never
    __isTeleport?: never
    __isSuspense?: never
    new (...args: any[]): T
  }

}
