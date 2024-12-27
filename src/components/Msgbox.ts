import type { ElMessageBoxOptions } from 'element-plus';
import type {
  AppContext,
  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-expect-error
  ComponentPublicInstanceConstructor,
  ExtractPropTypes,
  PublicProps,
  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-expect-error
  RawChildren,
  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-expect-error
  RawSlots,
  Ref,
} from 'vue';
import { h, ref } from 'vue';

export type MsgboxBeforeClose = Required<ElMessageBoxOptions>['beforeClose'];
export type MsgboxBeforeCloseParams = Parameters<MsgboxBeforeClose>;
export type MsgboxBeforeCloseParamsWithoutFirst = MsgboxBeforeCloseParams extends [infer _First, ...infer Rest] ? Rest : never;

export type MsgboxCbParams<T> = [Ref<T | null>, MsgboxBeforeCloseParams];
export type MsgboxCb<T> = (...args: MsgboxCbParams<T>) => Awaited<void>;

export type MsgboxCbParamsWithoutFirst<T> = [Ref<T | null>, MsgboxBeforeCloseParamsWithoutFirst];
export type MsgboxCbWithoutFirst<T> = (...args: MsgboxCbParamsWithoutFirst<T>) => Awaited<void>;

export interface MsgboxCbs<T> {
  close?: MsgboxCbWithoutFirst<T>
  confirm?: MsgboxCbWithoutFirst<T>
  cancel?: MsgboxCbWithoutFirst<T>
  callback?: MsgboxCb<T>
}

export type MsgboxOptions = Pick<ElMessageBoxOptions, 'center'
  | 'appendTo'
  | 'buttonSize'
  | 'cancelButtonClass'
  | 'cancelButtonLoadingIcon'
  | 'cancelButtonText'
  | 'closeOnClickModal'
  | 'closeOnHashChange'
  | 'closeOnPressEscape'
  | 'confirmButtonClass'
  | 'confirmButtonLoadingIcon'
  | 'confirmButtonText'
  | 'customClass'
  | 'customStyle'
  | 'distinguishCancelAndClose'
  | 'draggable'
  | 'lockScroll'
  | 'overflow'
  | 'roundButton'
  | 'showCancelButton'
  | 'showClose'
  | 'showConfirmButton'>;

const defaultMsgboxOptions: MsgboxOptions = {
  center: true,
  showClose: false,
  closeOnClickModal: false,
  draggable: true,
};

/**
 * TODO:
 *      1. 传参设计优化
 *      2. 支持传入 VNode
 *      3. 支持 devtools 调试 (想办法把组件塞入 app dom 树下)
 *      4. 支持弹窗状态更新(和上一点问题原因相同，还有热更新问题)
 */
export function Msgbox<Com extends ComponentPublicInstanceConstructor>(
  title: string,
  cbs: MsgboxCbs<InstanceType<typeof component>>,
  component: Com,
  props?: ExtractPropTypes<Com> & PublicProps | null,
  children?: RawChildren | RawSlots | null,
  msgboxOptions?: MsgboxOptions | null,
  appContext?: AppContext | null,
) {
  let close: () => void;
  const comRef = ref<InstanceType<typeof component>>(null as InstanceType<typeof component>);
  ElMessageBox({
    ...defaultMsgboxOptions,
    ...{ ...msgboxOptions },
    customStyle: {
      width: '600px',
      ...msgboxOptions?.customStyle,
      'vertical-align': 'top',
      'top': '5vh',
      'max-width': 'initial',
    },
    title,
    message() {
      const vnode = h(component, {
        ...props,
        ref: comRef,
      }, children);
      return vnode;
    },
    async beforeClose(action, instance, done) {
      if (typeof close !== 'function') {
        close = () => {
          done();
        };
      }

      if (!cbs) {
        done();
        return;
      }

      try {
        if (typeof cbs.callback === 'function') {
          await cbs.callback(comRef, [action, instance, done]);
          return;
        }
        if (cbs[action]) {
          await cbs[action](comRef, [instance, done]);
          return;
        }
        done();
      }
      catch (e) {
        instance.confirmButtonLoading = false;
        instance.cancelButtonLoading = false;
        instance.confirmButtonDisabled = false;
        console.error(e);
      }
    },
  }, appContext);
}
