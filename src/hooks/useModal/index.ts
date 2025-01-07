import type { DialogInstance } from 'element-plus';
import type { ComInstance, Comp, ContentSlotType, DialogSlots, InnerArgs, ModalConfig, OpenArgs } from './utils';
import { useResetableRef } from '@/hooks/useResetableState';
import { computed, h, ref } from 'vue';
import Dialog from './Dialog.vue';
import { createSlot, defaultConfig } from './utils';

/**
 * @description 使用 Modal 组件
 * @param content 弹窗内容，支持 VNode | () => VNode | htmlString 。
 * (其实也是支持直接传 Component | () => Component 的，但是这种场景可以用 MesssageBox 代替)
 * @param config 弹窗配置，继承自 ElementPlus 的 DialogProps ，但多了 header 和 footer 的配置，类型和 content 一致
 * @param _slotComponent 仅仅是为了给 js 用户提供 ref 类型推导
 * @param _slotComponent.content 弹窗内容使用的组件
 * @param _slotComponent.header 弹窗头部使用的组件
 * @param _slotComponent.footer 弹窗底部使用的组件
 */
export function useModal<
  ContentInstance extends Comp = Comp,
  FooterInstance extends Comp = Comp,
  HeaderInstance extends Comp = Comp,
>(
  content: ContentSlotType,
  config: ModalConfig = defaultConfig,
  // 仅仅是为了给 js 用户提供 ref 类型推导
  _slotComponent?: {
    content?: ContentInstance
    header?: HeaderInstance
    footer?: FooterInstance
  },
) {
  const visible = ref(false);
  const hasOpen = ref(false);

  const [openArgs, resetOpenArgs] = useResetableRef<OpenArgs<
    ContentInstance,
    FooterInstance,
    HeaderInstance
  >>({
    dialog: {},
    header: {},
    content: {},
    footer: {},
  });

  function open(arg?: Partial<OpenArgs<
    ContentInstance,
    FooterInstance,
    HeaderInstance
  >>) {
    resetOpenArgs();
    if (arg && typeof arg === 'object') {
      openArgs.value = {
        dialog: { ...arg.dialog },
        header: arg.header || {},
        content: arg.content || {},
        footer: arg.footer || {},
      };
    }
    hasOpen.value = true;
    visible.value = true;
  }

  function close() {
    visible.value = false;
  }

  const modalRef = ref<DialogInstance>();
  const contentRef = ref<ComInstance<ContentInstance>>();
  const headerRef = ref<ComInstance<HeaderInstance>>();
  const footerRef = ref<ComInstance<FooterInstance>>();

  const slots = computed<DialogSlots>(() => {
    const slots: DialogSlots = {};

    const innerArgs: InnerArgs<
      ContentInstance,
      FooterInstance,
      HeaderInstance
    > = {
      open,
      close,
      modalRef,
      contentRef,
      headerRef,
      footerRef,
    };

    // 规避 ts 报错
    slots.default = (...args) => createSlot(
      content,
      contentRef,
      openArgs.value?.content || {},
      innerArgs,
      ...args,
    );

    if (config.header) {
      slots.header = (...args) => createSlot(
        config.header,
        headerRef,
        openArgs.value?.header || {},
        innerArgs,
        ...args,
      );
    }

    if (config.footer) {
      slots.footer = (...args) => createSlot(
        config.footer,
        footerRef,
        openArgs.value?.footer || {},
        innerArgs,
        ...args,
      );
    }

    return slots;
  });

  const props = computed(() => {
    return {
      ...defaultConfig,
      ...config,
      ...openArgs.value.dialog,
      ref: modalRef,
      modelValue: visible.value,
      'onUpdate:modelValue': (value: boolean) => {
        visible.value = value;
      },
    };
  });

  const Modal = () => (hasOpen.value ? h(Dialog, props.value, slots.value) : null);

  return [
    open,
    close,
    Modal,
    {
      modalRef,
      contentRef,
      headerRef,
      footerRef,
    },
  ] as const;
}
