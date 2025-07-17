<script setup lang="ts">
import { reactive, ref, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(false);
const loginFormRef = useTemplateRef('loginFormRef');

const loginForm = reactive({
  username: '',
  password: '',
  remember: false,
});

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度不能小于3位', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' },
  ],
};

async function handleLogin() {
  if (!loginFormRef.value)
    return;

  try {
    loading.value = true;
    await loginFormRef.value.validate();

    // TODO
    await new Promise(resolve => setTimeout(resolve, 1000));

    router.push('/');
  }
  catch (error) {
    console.error('登录失败:', error);
  }
  finally {
    loading.value = false;
  }
}
</script>

<template>
  <ElForm
    ref="loginFormRef"
    :model="loginForm"
    :rules="loginRules"
    class="space-y-6"
  >
    <ElFormItem prop="username">
      <ElInput
        v-model="loginForm.username"
        placeholder="用户名"
        prefix-icon="User"
        class="h-11"
      />
    </ElFormItem>

    <ElFormItem prop="password">
      <ElInput
        v-model="loginForm.password"
        type="password"
        placeholder="密码"
        prefix-icon="Lock"
        class="h-11"
        @keyup.enter="handleLogin"
      />
    </ElFormItem>

    <ElFormItem>
      <div class="flex items-center justify-between">
        <ElCheckbox v-model="loginForm.remember">
          记住我
        </ElCheckbox>
        <ElLink
          v-if="false"
          type="primary"
          class="text-sm hover:scale-105 transition-transform"
        >
          忘记密码？
        </ElLink>
      </div>
    </ElFormItem>

    <ElButton
      :loading="loading"
      type="primary"
      class="w-full h-11 text-base font-medium rounded-full hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
      @click="handleLogin"
    >
      登录
    </ElButton>
  </ElForm>
</template>

<style scoped>
:deep(.el-input__wrapper) {
  @apply shadow-sm bg-white/50 backdrop-blur-sm border-0 transition-all duration-300;
}

:deep(.el-input__wrapper:hover) {
  @apply shadow-md bg-white/70;
}

:deep(.el-form-item__error) {
  @apply mt-1;
}
</style>
