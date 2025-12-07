import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ResourceService } from './resource.service';

@Module({
  imports: [PrismaModule],
  providers: [ResourceService],
  exports: [ResourceService],
})
export class ResourceModule {}
