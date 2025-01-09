/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_PREFIX: string
}

export interface Env extends ImportMetaEnv {
  readonly API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
