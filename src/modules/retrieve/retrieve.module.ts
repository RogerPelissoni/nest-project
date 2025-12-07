import { Module } from '@nestjs/common';
import { CompanyService } from '../company/company.service';
import { ProfileService } from '../profile/profile.service';
import { RetrieveService } from './retrieve.service';
import { RetrieveController } from './retrieve.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ResourceModule } from 'src/core/resource/resource.module';

@Module({
  imports: [PrismaModule, ResourceModule],
  controllers: [RetrieveController],
  providers: [CompanyService, ProfileService, RetrieveService],
  exports: [CompanyService, ProfileService, RetrieveService],
})
export class RetrieveModule {}
