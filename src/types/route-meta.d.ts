export { };

declare global {
  interface IRouteMeta {
    /**
     * 路由标题，在菜单和标签页显示
     */
    title: string
    /**
     * 是否在标签页中隐藏
     */
    hideInTab?: boolean
    /**
     * 是否缓存
     */
    cache?: boolean
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
     * 没有权限时菜单状态，默认隐藏
     * 为了防止乱配置，当 noPermissionMenuStatus !== 'disabled' 时，一律当做隐藏处理
     */
    noPermissionMenuStatus?: 'disabled' | 'hide'
    /**
     * 是否在进度条中隐藏
     */
    hideProgress?: boolean
    /**
     * TODO: 路由切换动画
     */
    transition?: 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'fade-transition' | 'fade' | 'fade-slide' | 'fade-down' | 'fade-scale' | 'fade-up' | 'collapse-transition'
  }
}
