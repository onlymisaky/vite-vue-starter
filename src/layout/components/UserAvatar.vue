<script lang="ts" setup>
import { LOGIN_ROUTE_NAME } from '@/routes/constant';
import useUserStore from '@/store/modules/user';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

function handleCommand(command: 'personal' | 'logout') {
  if (command === 'personal') {
    router.push({ name: 'Personal' });
  }
  if (command === 'logout') {
    userStore.logout();
    router.push({ name: LOGIN_ROUTE_NAME });
  }
}
</script>

<template>
  <ElDropdown @command="handleCommand">
    <div class="flex items-center">
      <ElAvatar
        fit="cover"
        :src="userStore.info.avatar"
        :size="30"
      >
        <ElIcon :size="30">
          <User />
        </ElIcon>
      </ElAvatar>
      <span
        class="ml-2"
        style="color: var(--el-text-color-primary)"
      >{{ userStore.info.username }}</span>
    </div>
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem command="personal">
          个人中心
        </ElDropdownItem>
        <ElDropdownItem command="logout">
          退出登录
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>
