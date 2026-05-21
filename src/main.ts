import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express'

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setBaseViewsDir(join(process.cwd(), 'src/views'));
  app.setViewEngine('ejs');
  app.useGlobalPipes(new ValidationPipe())
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
