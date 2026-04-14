import { Injectable } from '@nestjs/common';
import { DatabaseProvider } from '../../database/database.provider';

@Injectable()
export class UsersService {
  constructor(private databaseProvider: DatabaseProvider) {}

  async findByUsername(username: string) {
    return this.databaseProvider.db.user.findFirst({
      where: {
        username,
      },
    });
  }

  async search(query: string) {
    return this.databaseProvider.db.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { username: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
    });
  }
}
