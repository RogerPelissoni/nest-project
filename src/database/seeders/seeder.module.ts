import { Module } from '@nestjs/common';
import { UserSeeder } from './user.seeder';
import { UserService } from 'src/modules/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CompanySeeder } from './company.seeder';
import { CompanyService } from 'src/modules/company/company.service';
import { ProfileSeeder } from './profile.seeder';
import { ProfileService } from 'src/modules/profile/profile.service';
import { ResourceService } from 'src/core/resource/resource.service';
import { UserScreen } from 'src/modules/user/user.screen';

@Module({
  providers: [
    PrismaService,
    // User
    UserSeeder,
    UserService,
    UserScreen,
    // Company
    CompanySeeder,
    CompanyService,
    // Profile
    ProfileSeeder,
    ProfileService,
    ResourceService,
    //
  ],
  exports: [UserSeeder],
})
export class SeederModule {}
