import type {
  ComponentPublicInstance,
  ComputedOptions,
  ExtractPublicPropTypes,
  MethodOptions,
  VNode,
  VNodeArrayChildren,
  VNodeProps,
} from 'vue';

export { };

declare global {
  // copy from @vue/runtime-core/dist/runtime-core.d.ts
  type RawChildren = string | number | boolean | VNode | VNodeArrayChildren | (() => any);

  // copy from @vue/runtime-core/dist/runtime-core.d.ts
  interface RawSlots {
    [name: string]: unknown
    $stable?: boolean
  }

  // copy from @vue/runtime-core/dist/runtime-core.d.ts
  interface ComponentPublicInstanceConstructor<
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
    new(...args: any[]): T
  }

  type OmitVNodeProps<T> = Omit<T, keyof VNodeProps>;

  type ExtractPublicPropTypesFromComponentInstance<T extends ComponentPublicInstance> = OmitVNodeProps<ExtractPublicPropTypes<T['$props']>>;
}
