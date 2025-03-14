/// <reference types="vite/client" />

type ViteEnvKeys<T> = {
  [K in keyof T as K extends `VITE_${string}` ? K : never]: T[K]
};

interface ImportMetaEnv extends ViteEnvKeys<ViteEnv> { }

interface ImportMeta {
  readonly env: ImportMetaEnv
}
