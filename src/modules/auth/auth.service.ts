import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthLoginDto } from './dto/auth-login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(dto: AuthLoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      this.logger.warn(`Failed login attempt for email: ${dto.email}`);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const valid = await argon2.verify(user.password, dto.password);

    if (!valid) {
      this.logger.warn(`Invalid password attempt for user ID: ${user.id}`);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    this.logger.log(`Successful login for user ID: ${user.id}`);
    return this.createToken(user);
  }

  createToken(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      profile_id: user.profile_id,
      company_id: user.company_id,
    };

    return {
      access_token: this.jwt.sign(payload),
    };
  }
}
