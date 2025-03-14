declare interface ViteEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_PREFIX: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_ROUTER_TYPE: 'hash' | 'history'
  readonly BASE_URL: string
}
