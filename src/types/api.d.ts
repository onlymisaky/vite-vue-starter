declare global {

  interface ApiResponse<T = unknown> {
    success: boolean
    status: number
    message: string
    data: T
    timestamp: number
  }

  interface PaginatedData<T = unknown> {
    list: T[]
    pagination: {
      page: number
      pageSize: number
      totalPages: number
    }
    total: number
  }

  type PaginatedResponse<T = unknown> = ApiResponse<PaginatedData<T>>;

}

export { };
