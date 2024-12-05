declare global {
  interface RouteMeta {
    title: string
    icon?: string
    permission?: string[]
    hideInMenu?: boolean
    order?: number
  }
}
