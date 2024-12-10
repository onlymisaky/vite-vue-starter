export { };

declare global {
  interface IRouteMeta {
    /**
     * 路由标题，在菜单和标签页显示
     */
    title: string
    /**
     * 菜单图标
     */
    icon?: string
    /**
     * 权限标识，当为空时表示不做权限校验，当为 * 时表示任何登录用户都可以访问
     */
    permission?: string[] | string
    /**
     * 是否在菜单中隐藏
     */
    hideInMenu?: boolean
    /**
     * 是否在进度条中隐藏
     */
    hideProgress?: boolean
    /**
     * 路由切换动画
     */
    transition?: 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'fade-transition' | 'fade' | 'fade-slide' | 'fade-down' | 'fade-scale' | 'fade-up' | 'collapse-transition'
    /**
     * 菜单排序
     */
    order?: number
  }
}
