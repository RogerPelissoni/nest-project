import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { FileLogger } from './core/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new FileLogger(),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove campos não definidos no DTO
      // forbidNonWhitelisted: true, // retorna erro se houver campos extras
      transform: true, // transforma payload em instância da classe DTO
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

  BigInt.prototype['toJSON'] = function () {
    return this.toString();
  };

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
