import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 配置Swagger
  const config = new DocumentBuilder()
    .setTitle('成本管理平台 API')
    .setDescription('成本管理平台后端API文档')
    .setVersion('1.0')
    .addTag('projects', '项目管理')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 8100);
  console.log(`🚀 Application is running on: http://localhost:${process.env.PORT ?? 8100}`);
  console.log(`📚 Swagger documentation: http://localhost:${process.env.PORT ?? 8100}/api`);
}
bootstrap();
