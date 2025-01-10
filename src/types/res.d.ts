export interface IRes<T = any> {
  success: boolean
  status: number
  message: string
  data: T
  timestamp: number
}
