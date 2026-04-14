import { Injectable } from '@nestjs/common';
import { DatabaseProvider } from '../../database/database.provider';

@Injectable()
export class RankingsService {
  constructor(private databaseProvider: DatabaseProvider) {}

  async findAll() {
    return this.databaseProvider.db.ranking.findMany({
      include: {
        event: {
          include: {
            game: true,
          },
        },
      },
      orderBy: {
        event: {
          createdAt: 'desc',
        },
      },
    });
  }

  async findByGameAndSlug(gameId: string, slug: string) {
    return this.databaseProvider.db.ranking.findFirst({
      where: {
        event: {
          gameId: gameId,
          slug: slug,
        },
      },
      include: {
        event: {
          include: {
            game: true,
          },
        },
      },
    });
  }
}
