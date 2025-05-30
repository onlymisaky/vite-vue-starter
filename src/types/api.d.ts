declare global {

  interface ApiResponse<T = unknown> {
    success: boolean
    status: number
    message: string
    data: T
    timestamp: number
  }

  interface SortOptions {
    sortBy: string
    sortOrder: 'DESC' | 'ASC' | ''
  }

  interface QueryListDto<P extends object = object> {
    params?: P
    sort?: SortOptions
    pagination?: {
      page: number
      pageSize: number
    }
  }

  interface BaiscListItemVo {
    id: number
    createdAt: string
    updatedAt: string
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
