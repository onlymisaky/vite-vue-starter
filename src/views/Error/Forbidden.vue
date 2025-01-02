<script setup lang="ts">
import { useRouter } from 'vue-router';
import ErrorPageWrapper from './components/ErrorPageWrapper.vue';

const router = useRouter();
</script>

<template>
  <ErrorPageWrapper
    title="403"
    description="抱歉，您没有访问权限"
    button-text="返回首页"
    @click="router.push('/')"
  >
    <template #illustration>
      <svg
        viewBox="0 0 500 400"
        class="w-[460px] h-[360px] mb-6"
      >
        <!-- 背景圆 -->
        <circle
          cx="250"
          cy="200"
          r="180"
          class="fill-blue-50"
        />

        <!-- 警卫/锁 -->
        <g transform="translate(150, 50)">
          <!-- 盾牌 -->
          <path
            d="M100 40 L180 40 L190 60 L190 260 L100 300 L10 260 L10 60 L20 40 Z"
            class="fill-gray-100 stroke-gray-300"
            stroke-width="4"
          />

          <!-- 锁 -->
          <g transform="translate(60, 120)">
            <rect
              x="0"
              y="30"
              width="80"
              height="60"
              rx="8"
              class="fill-purple-500"
            />
            <path
              d="M20 30 V20 a20 20 0 0 1 40 0 V30"
              class="stroke-purple-500"
              stroke-width="12"
              fill="none"
            />
          </g>

          <!-- 装饰元素 -->
          <g class="animate-float animation-delay-1000">
            <circle
              cx="30"
              cy="100"
              r="10"
              class="fill-pink-400"
            />
            <circle
              cx="170"
              cy="100"
              r="10"
              class="fill-indigo-400"
            />
          </g>
        </g>

        <!-- 装饰线条 -->
        <g class="animate-float animation-delay-2000">
          <path
            d="M80 50 l20 -20 l20 20"
            class="stroke-emerald-400"
            stroke-width="6"
            fill="none"
            stroke-linecap="round"
          />
          <path
            d="M380 50 l20 -20 l20 20"
            class="stroke-amber-400"
            stroke-width="6"
            fill="none"
            stroke-linecap="round"
          />
        </g>
      </svg>
    </template>
  </ErrorPageWrapper>
</template>

<style src="./components/animation.css" scoped />
