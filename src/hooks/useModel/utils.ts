import type { DialogInstance, DialogProps } from 'element-plus';
import type { ComponentPublicInstance, DefineComponent, Ref, VNode } from 'vue';
import { h, isVNode, resolveComponent } from 'vue';

export type DialogSlots = DialogInstance['$slots'];
type RequiredDialogSlots = Required<DialogSlots>;

export type Comp = DefineComponent<any, any, any>;
type ComponentPublicKeys = keyof ComponentPublicInstance;
export type ComInstance<T extends Comp = Comp> = Omit<InstanceType<T>, ComponentPublicKeys>;

type ModalSlot = VNode | string | number | boolean | undefined | Record<string, any>;

type FnModalSlot<
  ContentInstance extends Comp = Comp,
  FooterInstance extends Comp = Comp,
  HeaderInstance extends Comp = Comp,
  SlotArgs extends any[] = any[],
> = (innerArgs: InnerArgs<ContentInstance, FooterInstance, HeaderInstance>, ...args: SlotArgs) => ModalSlot;

type ModalSlotType<
  ContentInstance extends Comp = Comp,
  FooterInstance extends Comp = Comp,
  HeaderInstance extends Comp = Comp,
  SlotArgs extends any[] = any[],
> = ModalSlot | FnModalSlot<ContentInstance, FooterInstance, HeaderInstance, SlotArgs>;

export type ContentSlotType<
  ContentInstance extends Comp = Comp,
  FooterInstance extends Comp = Comp,
  HeaderInstance extends Comp = Comp,
> = ModalSlotType<ContentInstance, FooterInstance, HeaderInstance, Parameters<RequiredDialogSlots['default']>>;
export type HeaderSlotType<
  ContentInstance extends Comp = Comp,
  FooterInstance extends Comp = Comp,
  HeaderInstance extends Comp = Comp,
> = ModalSlotType<ContentInstance, FooterInstance, HeaderInstance, Parameters<RequiredDialogSlots['header']>>;
export type FooterSlotType<
  ContentInstance extends Comp = Comp,
  FooterInstance extends Comp = Comp,
  HeaderInstance extends Comp = Comp,
> = ModalSlotType<ContentInstance, FooterInstance, HeaderInstance, Parameters<RequiredDialogSlots['footer']>>;

// TODO 支持传入自定义 Dialog 组件，对自定义 Dialog 组件做约束
type CustomDialog = typeof ElDialog;
export type ModalConfig<Dialog extends CustomDialog = CustomDialog> = Partial<Omit<DialogProps, 'modelValue'>> & {
  header?: HeaderSlotType
  footer?: FooterSlotType
  // TODO
  dialogCom?: Dialog
};

export interface InnerArgs<
  ContentInstance extends Comp = Comp,
  FooterInstance extends Comp = Comp,
  HeaderInstance extends Comp = Comp,
> {
  open: () => void
  close: () => void
  modalRef: Ref<DialogInstance | undefined>
  contentRef: Ref<ComInstance<ContentInstance> | undefined>
  headerRef: Ref<ComInstance<HeaderInstance> | undefined>
  footerRef: Ref<ComInstance<FooterInstance> | undefined>
}

export function createSlot<
  ContentInstance extends Comp = Comp,
  FooterInstance extends Comp = Comp,
  HeaderInstance extends Comp = Comp,
>(
  component: ModalSlotType<ContentInstance, FooterInstance, HeaderInstance>,
  ref: Ref,
  innerArgs: InnerArgs<ContentInstance, FooterInstance, HeaderInstance>,
  ...args: Parameters<RequiredDialogSlots['default' | 'footer' | 'header']>
) {
  if (['undefined', 'null'].includes(component as any)) {
    return null;
  }

  if (isVNode(component)) {
    return h(component, { ref });
  }

  // TODO 判断是否是 component
  if (typeof component === 'object') {
    try {
      return h(component, { ref });
    }
    catch (e) {
      console.error(e);
      return h('div', {
        ref,
        innerHTML: `${component}`,
      });
    }
  }

  if (typeof component === 'function') {
    const com = component(innerArgs, ...args);
    return createSlot(com, ref, innerArgs, ...args);
  }

  if (typeof component === 'string') {
    const com = resolveComponent(component);
    if (typeof com !== 'string') {
      return h(com, { ref });
    }
  }

  return h('div', {
    ref,
    innerHTML: `${component}`,
  });
}

export const defaultConfig: ModalConfig = {
  openDelay: 50,
  closeDelay: 50,
  closeOnClickModal: false,
  center: true,
  destroyOnClose: true,
};