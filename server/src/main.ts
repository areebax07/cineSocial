import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefix all routes with /api (matches Deliverable 2 endpoints like /api/auth/login)
  app.setGlobalPrefix('api');

  // Enable CORS so React frontend can connect later
  app.enableCors();

  // Automatically validate incoming request payloads
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Swagger API Documentation setup
  const config = new DocumentBuilder()
    .setTitle('CineSocial API')
    .setDescription('Backend REST API for CineSocial (CS-301L Deliverable 3)')
    .setVersion('1.0')
    .addBearerAuth() // Adds the "Authorize" button for JWT tokens later
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();