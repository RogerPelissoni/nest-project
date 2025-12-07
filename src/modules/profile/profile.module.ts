import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { ResourceModule } from 'src/core/resource/resource.module';

@Module({
  imports: [PrismaModule, AuthModule, ResourceModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
