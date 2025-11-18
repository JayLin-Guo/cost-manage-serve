import { ApiResponse, PaginatedResponse } from '../interfaces/api-response.interface';

export class ResponseUtil {
  /**
   * 成功响应
   */
  static success<T>(data?: T, message = '操作成功', code = 200): ApiResponse<T> {
    return {
      code,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 创建成功响应
   */
  static created<T>(data?: T, message = '创建成功'): ApiResponse<T> {
    return this.success(data, message, 201);
  }

  /**
   * 分页响应
   */
  static paginated<T>(
    items: T[],
    total: number,
    page: number,
    pageSize: number,
    message = '获取成功'
  ): PaginatedResponse<T> {
    return {
      code: 200,
      message,
      data: {
        items,
        total,
        page,
        pageSize,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 错误响应
   */
  static error(message = '操作失败', code = 500): ApiResponse<null> {
    return {
      code,
      message,
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
}
