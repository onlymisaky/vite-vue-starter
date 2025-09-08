import type {
  AllowedComponentProps,
  Component,
  ComponentCustomProps,
  ComponentPublicInstance,
  ComputedOptions,
  ConcreteComponent,
  DefineComponent,
  ExtractPublicPropTypes,
  FunctionalComponent,
  MethodOptions,
  Plugin,
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

  // 另一种通过 Exclude 的方式将 ComponentPublicInstanceConstructor 提取出来
  type ComPubInsCtor<
    T extends ComponentPublicInstance<Props, RawBindings, D, C, M> = ComponentPublicInstance<any>,
    Props = any,
    RawBindings = any,
    D = any,
    C extends ComputedOptions = ComputedOptions,
    M extends MethodOptions = MethodOptions,
  >
    = Exclude<Component<T>, ConcreteComponent<T>>;

  // ComPubInsCtor 的简化版
  type ComPubInsCtorWithProps<PropsOrInstance = any>
    = Exclude<Component<PropsOrInstance>, ConcreteComponent<PropsOrInstance>>;

  type OmitVNodeProps<T> = Omit<T, keyof VNodeProps>;
  type OmitAllowedComponentProps<T> = Omit<T, keyof AllowedComponentProps>;
  type OmitComponentCustomProps<T> = Omit<T, keyof ComponentCustomProps>;
  type PureProps<T> = OmitVNodeProps<OmitAllowedComponentProps<OmitComponentCustomProps<T>>>;

  // 通过组件实例提取组件的 props 类型
  type ExtractPublicPropTypesFromComponentInstance<T extends { $props: any }> = PureProps<ExtractPublicPropTypes<T['$props']>>;

  type SFCWithInstall<T> = T & Plugin;

  type UnwrapSFCWithInstall<T> = T extends SFCWithInstall<infer C> ? C : T;

  // 提取组件的 props 类型
  type PropsOf<T>
    // ElementPlus 的组件会包裹一层 SFCWithInstall
    = T extends SFCWithInstall<infer SFC> ? PropsOf<SFC>
    // 函数式组件
      : T extends FunctionalComponent<infer P, any> ? P
      // 单文件组件
        : T extends ComPubInsCtorWithProps<infer SFC> ? (SFC extends { $props: infer P } ? PureProps<P> : never)
        // DefineComponent 定义的组件
          : T extends DefineComponent<infer P, any, any, any, any, any, any, any, any, any, any> ? P
          // 其它可以实体化的组件
            : T extends ConcreteComponent<infer P, any, any, any, any, any, any> ? P
            // 不知道通过什么方式实例化的组件
              : T extends new (...args: any[]) => any ? PureProps<InstanceType<T>['$props']>
              // 不知道是什么类型的组件
                : Record<string, any>;

  // 或许这种方式更简单
  type PropsOf2<T>
    = T extends SFCWithInstall<infer C> ? PropsOf2<C>
      : T extends FunctionalComponent<infer P, any> ? P
        : T extends new (...args: any[]) => any ? PureProps<InstanceType<T>['$props']>
          : Record<string, any>;

  type UnwrapSlots<S> = S extends SlotsType<infer M> ? M : S;

  // 提取组件的 slots 类型
  type SlotsOf<T>
    // ElementPlus 的组件会包裹一层 SFCWithInstall
    = T extends SFCWithInstall<infer C> ? SlotsOf<C>
    // 函数式组件：第三个泛型位是 slots
      : T extends FunctionalComponent<any, any, infer S> ? UnwrapSlots<S>
      // 其他可实例化组件（DefineComponent/ConcreteComponent）：从实例上取 $slots
        : T extends new (...args: any[]) => any ? InstanceType<T>['$slots']
          : never;

}
