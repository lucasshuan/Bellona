import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-discord';
import { ConfigService } from '@nestjs/config';
import { AuthService, DiscordProfile } from './auth.service';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('DISCORD_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('DISCORD_CLIENT_SECRET'),
      callbackURL:
        configService.get<string>('DISCORD_CALLBACK_URL') ||
        'http://localhost:4000/auth/discord/callback',
      scope: ['identify', 'email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: DiscordProfile,
  ) {
    const user = await this.authService.validateDiscordUser(profile);
    return user;
  }
}
