import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PersonController } from './person.controller';
import { PersonScreen } from './person.screen';
import { PersonService } from './person.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PersonController],
  providers: [PersonService, PersonScreen],
})
export class PersonModule {}
