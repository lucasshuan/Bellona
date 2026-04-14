import { Injectable } from '@nestjs/common';
import { DatabaseProvider } from '../../database/database.provider';
import { CreateGameInput, UpdateGameInput } from './dto/games.input';
import { AddPlayerToGameInput } from './dto/players.input';
import { PaginationInput } from '../../common/pagination/pagination.input';
import { Prisma } from '@ares/db';

@Injectable()
export class GamesService {
  constructor(private databaseProvider: DatabaseProvider) {}

  async findAll(pagination: PaginationInput, search?: string) {
    const { skip, take } = pagination;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { slug: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : undefined;

    const [nodes, totalCount] = await Promise.all([
      this.databaseProvider.db.game.findMany({
        where,
        skip,
        take,
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
      }),
      this.databaseProvider.db.game.count({ where }),
    ]);

    return {
      nodes,
      totalCount,
      hasNextPage: skip + take < totalCount,
    };
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

  async getAuthor(authorId: string) {
    return this.databaseProvider.db.user.findUnique({
      where: { id: authorId },
    });
  }

  async getRankings(gameId: string) {
    return this.databaseProvider.db.ranking.findMany({
      where: {
        event: {
          gameId: gameId,
        },
      },
      orderBy: {
        event: {
          createdAt: 'desc',
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

  async getPlayer(id: string) {
    return this.databaseProvider.db.player.findUnique({
      where: { id },
    });
  }

  async getPlayerUsernames(playerId: string) {
    return this.databaseProvider.db.playerUsername.findMany({
      where: { playerId },
    });
  }

  async addPlayerToGame(data: AddPlayerToGameInput) {
    const { gameId, username, userId } = data;
    return this.databaseProvider.db.$transaction(async (tx) => {
      let playerId: string | null = null;
      let wasAddedToExisting = false;

      if (userId) {
        const existingPlayer = await tx.player.findFirst({
          where: { gameId, userId },
        });
        if (existingPlayer) {
          playerId = existingPlayer.id;
          wasAddedToExisting = true;
        }
      }

      if (!playerId) {
        const newPlayer = await tx.player.create({
          data: { gameId, userId },
        });
        playerId = newPlayer.id;
      }

      const newUsername = await tx.playerUsername.create({
        data: { playerId, username },
      });

      if (!wasAddedToExisting) {
        return tx.player.update({
          where: { id: playerId },
          data: { primaryUsernameId: newUsername.id },
        });
      }

      return tx.player.findUnique({ where: { id: playerId } });
    });
  }

  async searchPlayers(
    gameId: string,
    query: string,
    pagination: PaginationInput,
  ) {
    const { skip, take } = pagination;
    const where = {
      username: { contains: query, mode: Prisma.QueryMode.insensitive },
      player: { gameId },
    };

    const [nodes, totalCount] = await Promise.all([
      this.databaseProvider.db.playerUsername.findMany({
        where,
        skip,
        take,
        include: {
          player: {
            include: {
              user: true,
            },
          },
        },
      }),
      this.databaseProvider.db.playerUsername.count({ where }),
    ]);

    return {
      nodes,
      totalCount,
      hasNextPage: skip + take < totalCount,
    };
  }
}
