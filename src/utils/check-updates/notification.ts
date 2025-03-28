import type { VNode } from 'vue';
import type { CheckUpdatesNotifyActionType } from './check-updates';
import { ElNotification } from 'element-plus';
import { h } from 'vue';
import NotificationMsgContent from './NotificationMsgContent.vue';
import 'element-plus/theme-chalk/el-notification.css';

export function notification(changelog: string | VNode) {
  return new Promise<CheckUpdatesNotifyActionType>((resolve) => {
    const notificationHandle = ElNotification({
      title: '更新提示',
      customClass: '!w-auto',
      message: h(NotificationMsgContent, {
        changelog,
        onUpdateAction(action) {
          notificationHandle.close();
          resolve(action);
        },
      }),
      duration: 0,
      showClose: false,
    });
  });
}
