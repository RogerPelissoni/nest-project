import { Module } from '@nestjs/common';
import { CompanyService } from '../company/company.service';
import { ProfileService } from '../profile/profile.service';
import { RetrieveService } from './retrieve.service';
import { RetrieveController } from './retrieve.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RetrieveController],
  providers: [CompanyService, ProfileService, RetrieveService],
  exports: [CompanyService, ProfileService, RetrieveService],
})
export class RetrieveModule {}
