import { Module } from '@nestjs/common';
import { CompanyService } from '../company/company.service';
import { ProfileService } from '../profile/profile.service';
import { ResourceService } from './resource.service';
import { ResourceController } from './resource.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ResourceController],
  providers: [CompanyService, ProfileService, ResourceService],
  exports: [CompanyService, ProfileService, ResourceService],
})
export class RepositoryModule {}
