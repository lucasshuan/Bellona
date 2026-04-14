import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { User } from '@ares/db';
import type { Response } from 'express';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  async discordAuth() {}

  @Get('discord/callback')
  @UseGuards(AuthGuard('discord'))
  async discordAuthCallback(@Req() req: { user: User }, @Res() res: Response) {
    const frontendUrl = this.configService.getOrThrow<string>('CORS_ORIGIN');
    const { accessToken } = await this.authService.login(req.user);

    res.redirect(
      `${frontendUrl}/auth/callback?token=${encodeURIComponent(accessToken)}`,
    );
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMe(@Req() req: { user: User }) {
    return req.user;
  }
}
