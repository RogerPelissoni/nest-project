import { Injectable } from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';
import DTO from 'src/core/utils/dto.util';

@Injectable()
export class UserSeeder {
  constructor(private readonly userService: UserService) {}

  async run() {
    await this.userService.create(
      DTO.normalize({
        id: 1,
        name: 'Administrador',
        email: 'admin@admin.com',
        email_verified_at: new Date(),
        password: '123456',
        profile_id: null,
        company_id: 1,
        person_id: null,
      }),
    );
  }
}
