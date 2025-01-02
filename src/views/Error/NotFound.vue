<script setup lang="ts">
import { useRouter } from 'vue-router';
import ErrorPageWrapper from './components/ErrorPageWrapper.vue';

const router = useRouter();
</script>

<template>
  <ErrorPageWrapper
    title="404"
    description="抱歉，页面不存在"
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

        <!-- 迷路的文件夹 -->
        <g transform="translate(150, 80)">
          <!-- 文件夹 -->
          <path
            d="M20 40 L80 40 L100 20 L180 20 L180 220 L20 220 Z"
            class="fill-gray-100 stroke-gray-300"
            stroke-width="4"
          />

          <!-- 问号 -->
          <g transform="translate(70, 80)">
            <circle
              cx="30"
              cy="30"
              r="25"
              class="fill-purple-500"
            />
            <path
              d="M20 20 q10 -10 20 0 q10 10 0 20 q-10 10 -10 20 v10"
              stroke="#FFF"
              stroke-width="6"
              fill="none"
              stroke-linecap="round"
            />
            <circle
              cx="30"
              cy="85"
              r="3"
              fill="#FFF"
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
