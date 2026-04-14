import { Injectable } from '@nestjs/common';
import { DatabaseProvider } from '../../database/database.provider';
import { CreateGameInput, UpdateGameInput } from './games.resolver';

@Injectable()
export class GamesService {
  constructor(private databaseProvider: DatabaseProvider) {}

  async findAll(search?: string) {
    return this.databaseProvider.db.game.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { slug: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: {
        _count: {
          select: {
            events: true,
            players: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findBySlug(slug: string) {
    return this.databaseProvider.db.game.findFirst({
      where: {
        slug: slug,
      },
      include: {
        _count: {
          select: {
            events: true,
            players: true,
          },
        },
      },
    });
  }

  async create(data: CreateGameInput) {
    return this.databaseProvider.db.game.create({
      data: {
        ...data,
      },
    });
  }

  async update(id: string, data: UpdateGameInput) {
    return this.databaseProvider.db.game.update({
      where: { id },
      data,
    });
  }

  async approve(id: string) {
    return this.databaseProvider.db.game.update({
      where: { id },
      data: {
        status: 'APPROVED',
      },
    });
  }
}
