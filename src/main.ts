import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { FileLogger } from './core/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new FileLogger(),
  });

  // Security
  app.use(helmet());
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove campos não definidos no DTO
      // forbidNonWhitelisted: true, // retorna erro se houver campos extras
      transform: true, // transforma payload em instância da classe DTO
      transformOptions: {
        enableImplicitConversion: true, // <--- Converte "5" -> 5 sem precisar de @Type
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Nest Project')
    .setDescription('The first project with NestJS')
    .setVersion('1.0')
    .addTag('nest')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'jwt', // este nome deve bater com @ApiBearerAuth('jwt')
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Habilita serialização JSON para BigInt
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };

  await app.listen(process.env.PORT ?? 8000);
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
