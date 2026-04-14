import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { DatabaseProvider } from '../../database/database.provider';
import { User } from '../../modules/auth/user.model';
import { Game } from '../../modules/games/game.model';

@Injectable({ scope: Scope.REQUEST })
export class DataLoaderService {
  constructor(private readonly databaseProvider: DatabaseProvider) {}

  public readonly userLoader = new DataLoader<string, User | null>(
    async (ids: string[]) => {
      const users = await this.databaseProvider.db.user.findMany({
        where: { id: { in: ids } },
      });
      const userMap = new Map(users.map((u) => [u.id, u]));
      return ids.map(
        (id) => userMap.get(id) || null,
      ) as unknown as (User | null)[];
    },
  );

  public readonly gameLoader = new DataLoader<string, Game | null>(
    async (ids: string[]) => {
      const games = await this.databaseProvider.db.game.findMany({
        where: { id: { in: ids } },
      });
      const gameMap = new Map(games.map((g) => [g.id, g]));
      return ids.map(
        (id) => gameMap.get(id) || null,
      ) as unknown as (Game | null)[];
    },
  );
}
