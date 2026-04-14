import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthResolver } from './auth.resolver';
import { DiscordStrategy } from './discord.strategy';
import { JwtStrategy } from './jwt.strategy';

import { PermissionsGuard } from './guards/permissions.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  providers: [
    AuthService,
    AuthResolver,
    DiscordStrategy,
    JwtStrategy,
    PermissionsGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService, PermissionsGuard],
})
export class AuthModule {}
