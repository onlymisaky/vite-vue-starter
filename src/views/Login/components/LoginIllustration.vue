<template>
  <div class="hidden lg:block w-[500px] animate-float">
    <svg
      viewBox="0 0 500 500"
      class="w-full h-full"
    >
      <g transform="translate(0 -20)">
        <!-- 笔记本电脑底座 -->
        <path
          d="M80 320 h340 l-20 30 h-300 l-20 -30"
          fill="#e2e8f0"
          class="animate-pulse"
        />

        <!-- 笔记本主体 -->
        <path
          d="M100 300 h300 v-180 h-300 v180"
          fill="#fff"
          stroke="#333"
          stroke-width="8"
        />

        <!-- 屏幕 -->
        <rect
          x="120"
          y="140"
          width="260"
          height="140"
          rx="4"
          fill="#f0f7ff"
        />

        <!-- 装饰元素 -->
        <g class="animate-bounce-slow">
          <!-- 圆形图标 -->
          <circle
            cx="250"
            cy="210"
            r="30"
            fill="#3b82f6"
            opacity="0.9"
          />
          <path
            d="M235 210 h30 m-15 -15 v30"
            stroke="#fff"
            stroke-width="3"
            stroke-linecap="round"
          />

          <!-- 漂浮元素 -->
          <g class="animate-float animation-delay-1000">
            <circle
              cx="150"
              cy="140"
              r="15"
              fill="#f472b6"
            />
            <circle
              cx="350"
              cy="140"
              r="15"
              fill="#818cf8"
            />
          </g>

          <!-- 装饰线条 -->
          <g class="animate-float animation-delay-2000">
            <path
              d="M180 100 l20 -20 l20 20"
              stroke="#34d399"
              stroke-width="6"
              fill="none"
              stroke-linecap="round"
            />
            <path
              d="M280 100 l20 -20 l20 20"
              stroke="#fbbf24"
              stroke-width="6"
              fill="none"
              stroke-linecap="round"
            />
          </g>
        </g>

        <!-- 键盘装饰 -->
        <g transform="translate(120, 260)">
          <rect
            width="220"
            height="2"
            rx="1"
            fill="#e2e8f0"
          />
          <rect
            y="10"
            width="180"
            height="2"
            rx="1"
            fill="#e2e8f0"
          />
          <rect
            y="20"
            width="140"
            height="2"
            rx="1"
            fill="#e2e8f0"
          />
        </g>
      </g>

      <!-- 悬浮装饰元素 -->
      <g class="animate-float animation-delay-4000">
        <circle
          cx="50"
          cy="450"
          r="20"
          fill="#60a5fa"
          opacity="0.5"
        />
        <circle
          cx="450"
          cy="50"
          r="20"
          fill="#f472b6"
          opacity="0.5"
        />
        <path
          d="M420 420 l30 30 m-30 0 l30 -30"
          stroke="#34d399"
          stroke-width="4"
          stroke-linecap="round"
        />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-bounce-slow {
  animation: bounce 3s ease-in-out infinite;
}

.animation-delay-1000 {
  animation-delay: 1s;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
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
