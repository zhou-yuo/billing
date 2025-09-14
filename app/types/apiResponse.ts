/**
 * 通用的 API 响应接口
 * @template T - data 字段的具体类型
 */
export interface ApiResponse<T> {
  status: number
  msg: string
  data: T 
}