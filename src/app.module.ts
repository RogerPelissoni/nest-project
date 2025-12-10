import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContextInterceptor } from './common/interceptors/context-interceptor';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/jwt/jwt.guard';
import { PermissionGuard } from './common/guard/permission.guard';
import { PrismaService } from './prisma/prisma.service';
// Core Modules
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { SeederModule } from './database/seeders/seeder.module';
import { RetrieveModule } from './modules/retrieve/retrieve.module';
// App Modules
import { UserModule } from './modules/user/user.module';
import { CompanyModule } from './modules/company/company.module';
import { ProfileModule } from './modules/profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    RetrieveModule,
    SeederModule,
    // App Modules
    UserModule,
    CompanyModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
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
