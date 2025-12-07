import { Injectable } from '@nestjs/common';
import DTO from 'src/core/utils/dto.util';
import { ProfileService } from 'src/modules/profile/profile.service';

@Injectable()
export class ProfileSeeder {
  constructor(private readonly profileService: ProfileService) {}

  async run() {
    await this.profileService.create(
      DTO.normalize({
        id: 1,
        name: 'Administrador',
        ds_description: 'Possui acesso irrestrito',
        company_id: '1',
      }),
    );
  }
}
