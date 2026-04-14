import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseProvider } from '../../database/database.provider';
import type { User } from '@ares/db';

export interface DiscordProfile {
  id: string;
  username: string;
  global_name?: string;
  email?: string;
  avatar?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private databaseProvider: DatabaseProvider,
    private jwtService: JwtService,
  ) {}

  async validateDiscordUser(profile: DiscordProfile) {
    const {
      id: providerAccountId,
      username,
      global_name,
      email,
      avatar,
    } = profile;
    const provider = 'discord';

    // 1. Check if account already exists
    const existingAccount = await this.databaseProvider.db.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      include: {
        user: true,
      },
    });

    if (existingAccount) {
      return existingAccount.user;
    }

    // 2. If not, create user and account
    const image = avatar
      ? `https://cdn.discordapp.com/avatars/${providerAccountId}/${avatar}.png`
      : null;

    const user = await this.databaseProvider.db.user.create({
      data: {
        name: global_name || username,
        username: username,
        email: email,
        image: image,
        accounts: {
          create: {
            type: 'oauth',
            provider: provider,
            providerAccountId: providerAccountId,
          },
        },
      },
    });

    return user;
  }

  login(user: User) {
    const payload = {
      sub: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }
}
