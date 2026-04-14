import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesResolver } from './games.resolver';
import { PlayersResolver } from './players.resolver';

@Module({
  providers: [GamesService, GamesResolver, PlayersResolver],
})
export class GamesModule {}
