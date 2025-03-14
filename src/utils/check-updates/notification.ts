import type { VNode } from 'vue';
import type { CheckUpdatesNotifyActionType } from './check-updates';
import { ElButton, ElNotification } from 'element-plus';
import { h, isVNode } from 'vue';
import 'element-plus/theme-chalk/el-notification.css';

export function notification(changelog: string | VNode) {
  return new Promise<CheckUpdatesNotifyActionType>((resolve) => {
    const notificationHandle = ElNotification({
      title: '更新提示',
      customClass: '!w-auto',
      message: h('div', { class: 'flex flex-col gap-2' }, [
        h('div', '有新的版本可用，是否更新？'),
        changelog && (isVNode(changelog) ? changelog : h('div', { class: 'text-sm', innerHTML: changelog })),
        h('div', { class: 'flex justify-end flex-row-reverse mt-[10px]' }, [
          h(ElButton, {
            type: 'primary',
            size: 'small',
            class: 'ml-[12px]',
            onClick: () => {
              notificationHandle.close();
              resolve('update');
            },
          }, '更新'),
          h(ElButton, {
            type: 'default',
            size: 'small',
            onClick: () => {
              notificationHandle.close();
              resolve('remind-later');
            },
          }, '稍后提醒'),
          h(ElButton, {
            type: 'default',
            size: 'small',
            onClick: () => {
              notificationHandle.close();
              resolve('skip-this-version');
            },
          }, '跳过'),
          h(ElButton, {
            type: 'default',
            size: 'small',
            onClick: () => {
              notificationHandle.close();
              resolve('never-notify');
            },
          }, '不再提示'),
        ]),
      ]),
      duration: 0,
      showClose: false,
    });
  });
}
