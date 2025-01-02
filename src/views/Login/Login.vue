<script setup lang="ts">
import LoginForm from '@/views/Login/components/LoginForm.vue';
import LoginIllustration from '@/views/Login/components/LoginIllustration.vue';
import SocialLogin from '@/views/Login/components/SocialLogin.vue';
</script>

<template>
  <div
    class="relative flex justify-center items-center min-h-screen overflow-hidden bg-gradient-to-br from-blue-400 to-purple-600"
  >
    <!-- 背景动画效果 -->
    <div class="absolute inset-0">
      <div
        class="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"
      />
      <div
        class="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
      />
      <div
        class="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"
      />
    </div>

    <!-- 主要内容区域 -->
    <div class="relative flex items-center gap-8 max-w-6xl px-4">
      <!-- 使用提取出的插画组件 -->
      <LoginIllustration />

      <!-- 登录框 -->
      <div
        class="relative w-[420px] p-10 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl transform scale-[0.99] hover:scale-[1] transition-all duration-300"
      >
        <!-- Logo -->
        <div class="text-center mb-8 relative">
          <!-- 装饰性圆圈 -->
          <div class="absolute -top-6 -left-6 w-4 h-4 rounded-full bg-blue-400 animate-ping-slow" />
          <div
            class="absolute -top-4 -right-4 w-3 h-3 rounded-full bg-purple-400 animate-ping-slow animation-delay-1000"
          />

          <div class="flex justify-center mb-4 relative">
            <!-- Logo 容器 -->
            <div
              class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg relative"
            >
              <i class="i-carbon-user-avatar text-2xl text-white" />
              <!-- 装饰性光环 -->
              <div class="absolute inset-0 rounded-full border-2 border-white/30 scale-110 animate-pulse" />
            </div>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">
            欢迎登录
          </h2>
          <p class="text-gray-600 text-sm">
            请输入您的账号和密码
          </p>
        </div>

        <LoginForm />

        <SocialLogin />

        <!-- 装饰性元素 -->
        <div class="absolute -bottom-4 -right-4 transform rotate-45 opacity-50">
          <svg
            width="80"
            height="80"
            viewBox="0 0 100 100"
            fill="none"
          >
            <path
              d="M10 10 L90 10 L90 90"
              stroke="currentColor"
              stroke-width="4"
              class="text-purple-400"
            />
            <circle
              cx="90"
              cy="90"
              r="5"
              class="fill-current text-blue-400"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes blob {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  33% {
    transform: translate(30px, -50px) scale(1.1);
  }

  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

.animate-ping-slow {
  animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.animation-delay-1000 {
  animation-delay: 1s;
}

@keyframes ping {
  75%,
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-bounce-slow {
  animation: bounce 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-20px);
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}
</style>
