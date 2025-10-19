import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as rateLimit from 'express-rate-limit';

import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(cookieParser());
  // For testing: allow all origins by echoing the request origin.
  // Note: browsers won't accept a wildcard '*' when cookies/credentials are used,
  // so we set origin: true which reflects the incoming Origin header back —
  // effectively allowing any origin while still permitting credentials.
  app.enableCors({ origin: true, credentials: true });
  // express-rate-limit's types can be incompatible with certain TS configs; cast to any to call
  app.use((rateLimit as any)({ windowMs: 15 * 60 * 1000, max: 100 }));

  const config = new DocumentBuilder()
    .setTitle('Chat Real API')
    .setDescription('Authentication API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  await app.listen(port);
  console.log(`Server listening on http://localhost:${port}`);
}

bootstrap();
