/**
 * @link https://github.com/element-plus/element-plus/blob/dev/docs/.vitepress/vitepress/components/common/vp-theme-toggler.vue
 */
export function themeAnimation(
  pos: { x: number, y: number },
  isDark: boolean,
  animationOptions?: Pick<KeyframeAnimationOptions, 'duration' | 'easing'>,
) {
  return new Promise<void>((resolve) => {
    if (!document.startViewTransition) {
      resolve();
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      resolve();
      return;
    }

    const { x, y } = pos;

    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    );

    const transition = document.startViewTransition(async () => {
      resolve();
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];

      const animationOption = {
        duration: animationOptions?.duration || 400,
        easing: animationOptions?.easing || 'ease-in',
        pseudoElement: isDark
          ? '::view-transition-old(root)'
          : '::view-transition-new(root)',
      };

      document.documentElement.animate(
        {
          clipPath: isDark ? [...clipPath].reverse() : clipPath,
        },
        animationOption,
      );
    });
  });
}
