import { Injectable } from '@nestjs/common';
import { DatabaseProvider } from '../../database/database.provider';
import { CreateGameInput, UpdateGameInput } from './dto/games.input';
import { AddPlayerToGameInput } from './dto/players.input';
import { PaginationInput } from '../../common/pagination/pagination.input';
import { Prisma } from '@ares/db';

function mapRankingWithEvent<
  T extends {
    eventId: string;
    event: {
      gameId: string;
      id?: string;
      name: string;
      slug: string;
      description: string | null;
      startDate: Date | null;
      endDate: Date | null;
      approvedAt?: Date | null;
      createdAt: Date;
      updatedAt: Date;
    };
  },
>(ranking: T) {
  return {
    ...ranking,
    id: ranking.event.id ?? ranking.eventId,
    gameId: ranking.event.gameId,
    name: ranking.event.name,
    slug: ranking.event.slug,
    description: ranking.event.description,
    startDate: ranking.event.startDate,
    endDate: ranking.event.endDate,
    isApproved: !!ranking.event.approvedAt,
    createdAt: ranking.event.createdAt,
    updatedAt: ranking.event.updatedAt,
  };
}

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
      this.databaseProvider.game.findMany({
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
      this.databaseProvider.game.count({ where }),
    ]);

    return {
      nodes,
      totalCount,
      hasNextPage: skip + take < totalCount,
    };
  }

  async findBySlug(slug: string) {
    return this.databaseProvider.game.findFirst({
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
    return this.databaseProvider.user.findUnique({
      where: { id: authorId },
    });
  }

  async getRankings(gameId: string) {
    const rankings = await this.databaseProvider.ranking.findMany({
      where: {
        event: {
          gameId: gameId,
        },
      },
      include: {
        event: true,
      },
      orderBy: {
        event: {
          createdAt: 'desc',
        },
      },
    });

    return rankings.map(mapRankingWithEvent);
  }

  async create(data: CreateGameInput, authorId?: string) {
    return this.databaseProvider.game.create({
      data: {
        ...data,
        authorId,
      },
    });
  }

  async update(id: string, data: UpdateGameInput, userId?: string) {
    if (userId) {
      const game = await this.databaseProvider.game.findUnique({
        where: { id },
        select: { authorId: true },
      });
      // Apenas o autor ou admin pode editar.
      // Nota: o check de admin será feito pelo guard ou aqui.
      // Se tivermos o userId aqui, assumimos que é uma tentativa de edição "normal".
      if (game && game.authorId && game.authorId !== userId) {
        throw new Error('You do not have permission to edit this game');
      }
    }
    return this.databaseProvider.game.update({
      where: { id },
      data,
    });
  }

  async approve(id: string) {
    return this.databaseProvider.game.update({
      where: { id },
      data: {
        status: 'APPROVED',
      },
    });
  }

  async getPlayer(id: string) {
    return this.databaseProvider.player.findUnique({
      where: { id },
    });
  }

  async getPlayerUsernames(playerId: string) {
    return this.databaseProvider.playerUsername.findMany({
      where: { playerId },
    });
  }

  async addPlayerToGame(data: AddPlayerToGameInput) {
    const { gameId, username, userId } = data;
    return this.databaseProvider.$transaction(async (tx) => {
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
      this.databaseProvider.playerUsername.findMany({
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
      this.databaseProvider.playerUsername.count({ where }),
    ]);

    return {
      nodes,
      totalCount,
      hasNextPage: skip + take < totalCount,
    };
  }
}
