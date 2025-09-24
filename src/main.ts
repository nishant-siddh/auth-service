import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3000', 'https://mydomain.com'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown properties
      forbidNonWhitelisted: true,
      transform: true, // transform to DTO instances
    }),
  );

  app.use(helmet());

  setupSwagger(app);

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
