/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_PREFIX: string
  readonly VITE_API_BASE_URL: string
}

export interface Env extends ImportMetaEnv { }

interface ImportMeta {
  readonly env: ImportMetaEnv
}
