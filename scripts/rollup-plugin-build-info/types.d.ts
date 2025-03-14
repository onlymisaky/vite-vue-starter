export interface BundleInfo {
  fileName: string
  size: number
  type: string
  moduleIds?: string[]
  imports?: string[]
}

export interface BuildInfo {
  chunks: BundleInfo[]
  assets: BundleInfo[]
  totalSize: number
}
