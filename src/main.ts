import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

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

  const port = 8200; // 使用8200端口避免冲突
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
}

void bootstrap();
