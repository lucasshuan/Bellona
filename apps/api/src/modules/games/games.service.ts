import { Injectable } from '@nestjs/common';
import { DatabaseProvider } from '../../database/database.provider';

@Injectable()
export class GamesService {
  constructor(private databaseProvider: DatabaseProvider) {}

  async findAll() {
    return this.databaseProvider.db.game.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findBySlug(slug: string) {
    return this.databaseProvider.db.game.findFirst({
      where: {
        slug: slug,
      },
    });
  }
}
