import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';
import { NestApplicationOptions } from '@nestjs/common';
import { APP_PORT, CORS_ORIGIN } from './config';

async function bootstrap() {
  const appOptions: NestApplicationOptions = { cors: { origin: CORS_ORIGIN } };
  const app = await NestFactory.create(ApplicationModule, appOptions);

  await app.listen(APP_PORT || 3000);
}
bootstrap();
