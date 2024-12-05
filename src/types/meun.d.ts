export { };

declare global {
  interface IMenuItem {
    index: string
    title: string
    route?: RouteLocationRaw
    externalLink?: string
    icon?: string
    disabled?: boolean
    items?: IMenuItem[]
  }
}
