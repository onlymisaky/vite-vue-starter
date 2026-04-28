import type { Component } from 'vue';

export interface ContextMenuContext<T = unknown> {
  event: MouseEvent
  target: HTMLElement | null
  data?: T
  source: 'component'
}

export interface MenuItem<T = unknown> {
  key: string
  label: string
  icon?: string | Component
  disabled?: boolean
  hidden?: boolean
  divided?: boolean
  danger?: boolean
  children?: MenuItem<T>[]
  onClick?: (context: ContextMenuContext<T>) => void | Promise<void>
  meta?: Record<string, unknown>
}

export interface ContextMenuSelectPayload<T = unknown> {
  key: string
  item: MenuItem<T>
  context: ContextMenuContext<T>
}
