export interface ApiResponse<T = any> {
  code: number; // 业务状态码
  message: string; // 响应消息
  data?: T; // 响应数据
  timestamp?: string; // 时间戳
  path?: string; // 请求路径
}

export interface PaginatedResponse<T = any> {
  code: number;
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
  };
  timestamp?: string;
  path?: string;
}
