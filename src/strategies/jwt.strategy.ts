import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'MY_SECRET',
    });
  }

  validate(payload: any) {
    return {
      id: Number(payload.sub),
      email: payload.email,
      company_id: Number(payload.company_id),
      profile_id: Number(payload.profile_id),
    };
  }
}
