import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { PermissionGuard } from './common/guard/permission.guard';
import { ContextInterceptor } from './common/interceptors/context-interceptor';
import { validate } from './config/env.validation';
import { SeederModule } from './database/seeders/seeder.module';
import { HealthController } from './health/health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/jwt/jwt.guard';
import { CompanyModule } from './modules/company/company.module';
import { PersonModule } from './modules/person/person.module';
import { ProfileModule } from './modules/profile/profile.module';
import { RetrieveModule } from './modules/retrieve/retrieve.module';
import { UserModule } from './modules/user/user.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    AuthModule,
    RetrieveModule,
    SeederModule,
    // App Modules
    UserModule,
    CompanyModule,
    ProfileModule,
    PersonModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ContextInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule {}
