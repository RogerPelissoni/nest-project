import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CoreController } from 'src/core/core.controller';
import { Prisma } from 'prisma/generated/client';
import DTO from 'src/core/utils/dto.util';

@Controller('profile')
export class ProfileController extends CoreController<ProfileService> {
  constructor(private readonly profileService: ProfileService) {
    super(profileService);
  }

  @Post()
  create(@Body() dto: CreateProfileDto) {
    return this.profileService.create(
      DTO.normalize<Prisma.ProfileCreateInput>(dto),
    );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProfileDto) {
    return this.profileService.update(Number(id), dto);
  }
}
