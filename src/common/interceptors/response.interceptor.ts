import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';
import { RESPONSE_MESSAGE_KEY, RESPONSE_FORMAT_KEY } from '../decorators/api-response.decorator';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // 获取装饰器设置的消息和格式
    const customMessage = this.reflector.get<string>(RESPONSE_MESSAGE_KEY, context.getHandler());
    const responseFormat = this.reflector.get<string>(RESPONSE_FORMAT_KEY, context.getHandler());

    return next.handle().pipe(
      map((data) => {
        const message = customMessage || this.getSuccessMessage(response.statusCode);
        
        // 根据响应格式处理数据
        let processedData = data;
        if (responseFormat === 'list' && Array.isArray(data)) {
          processedData = {
            list: data,
            total: data.length,
          };
        }

        return {
          code: response.statusCode,
          message,
          data: processedData,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }

  private getSuccessMessage(statusCode: number): string {
    switch (statusCode) {
      case 200:
        return '操作成功';
      case 201:
        return '创建成功';
      case 204:
        return '删除成功';
      default:
        return '请求成功';
    }
  }
}
