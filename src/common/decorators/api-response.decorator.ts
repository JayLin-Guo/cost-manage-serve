import { SetMetadata } from '@nestjs/common';

export const RESPONSE_MESSAGE_KEY = 'response_message';
export const RESPONSE_FORMAT_KEY = 'response_format';

/**
 * 设置响应消息
 */
export const ResponseMessage = (message: string) => 
  SetMetadata(RESPONSE_MESSAGE_KEY, message);

/**
 * 设置响应格式类型
 */
export const ResponseFormat = (format: 'default' | 'paginated' | 'list') => 
  SetMetadata(RESPONSE_FORMAT_KEY, format);

/**
 * 列表响应装饰器
 */
export const ListResponse = (message = '获取列表成功') => (target: any, key: string, descriptor: PropertyDescriptor) => {
  SetMetadata(RESPONSE_MESSAGE_KEY, message)(target, key, descriptor);
  SetMetadata(RESPONSE_FORMAT_KEY, 'list')(target, key, descriptor);
};

/**
 * 分页响应装饰器
 */
export const PaginatedResponse = (message = '获取分页数据成功') => (target: any, key: string, descriptor: PropertyDescriptor) => {
  SetMetadata(RESPONSE_MESSAGE_KEY, message)(target, key, descriptor);
  SetMetadata(RESPONSE_FORMAT_KEY, 'paginated')(target, key, descriptor);
};
