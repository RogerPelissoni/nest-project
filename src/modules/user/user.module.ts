import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UserScreen } from './user.screen';
import { ProfileService } from '../profile/profile.service';
import { ResourceService } from 'src/core/resource/resource.service';
import { CompanyService } from '../company/company.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UserController],
  providers: [UserService, UserScreen, ProfileService, ResourceService, CompanyService],
})
export class UserModule {}
