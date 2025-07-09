import type { DefineComponent, Slot } from 'vue';
import { defineComponent, shallowRef } from 'vue';

// https://github.com/antfu/vue-reuse-template
// ->
// https://vueuse.org/core/createReusableTemplate

type Arr2SlotMap<Keys extends string[]> = {
  [K in Keys[number]]: Slot
};

type SlotMapWithDefault<Keys extends string[]> = { default: Slot } & Arr2SlotMap<Keys>;

export type DefineTemplateComponent<
  Bindings extends object,
  Slots extends Record<string, Slot | undefined>,
> = DefineComponent & {
  new (): { $slots: { default: (_: Bindings & { $slots: Slots }) => any } }
};

export type ReuseTemplateComponent<
  Bindings extends object,
  Slots extends Record<string, Slot | undefined>,
> = DefineComponent<Bindings> & {
  new (): { $slots: Slots }
};

export function useReusableTemplate<
  Bindings extends object,
  SlotNames extends string[],
>() {
  // 用于存储 DefineTemplate 的 slots.default
  const render = shallowRef();

  const DefineTemplate = defineComponent({
    setup(_props, { slots }) {
      return () => {
        // 拦截 DefineTemplate 的 render
        // 将默认插槽的渲染函数存储到已经定义的 render 中
        render.value = slots.default;
      };
    },
  }) as DefineTemplateComponent<Bindings, SlotMapWithDefault<SlotNames>>;

  const ReusableTemplate = defineComponent({
    setup(_, { attrs, slots }) {
      return () => {
        if (typeof render.value !== 'function') {
          throw new TypeError('useReusableTemplate: render is not a function');
        }
        return render.value?.({
          ...attrs,
          /**
           * 记录 ReusableTemplate 的插槽
           * <DefineTemplate v-slot={ $slots }><component :is="$slots.default" /></DefineTemplate>
           * <ReusableTemplate><div>xxx</div></ReusableTemplate>
           * <ReusableTemplate><p>yyy</p></ReusableTemplate>
           */
          $slots: slots,
        });
      };
    },
  }) as unknown as ReuseTemplateComponent<Bindings, SlotMapWithDefault<SlotNames>>;

  return [DefineTemplate, ReusableTemplate] as const;
}
