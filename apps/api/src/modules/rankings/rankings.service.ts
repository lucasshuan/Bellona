import { Injectable } from '@nestjs/common';
import { DatabaseProvider } from '../../database/database.provider';
import { CreateRankingInput, UpdateRankingInput } from './dto/rankings.input';
import { PaginationInput } from '../../common/pagination/pagination.input';

@Injectable()
export class RankingsService {
  constructor(private databaseProvider: DatabaseProvider) {}

  async findAll(pagination: PaginationInput) {
    const { skip, take } = pagination;

    const [nodes, totalCount] = await Promise.all([
      this.databaseProvider.db.ranking.findMany({
        skip,
        take,
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
      }),
      this.databaseProvider.db.ranking.count(),
    ]);

    return {
      nodes,
      totalCount,
      hasNextPage: skip + take < totalCount,
    };
  }

  async getGame(gameId: string) {
    return this.databaseProvider.db.game.findUnique({
      where: { id: gameId },
    });
  }

  async getEntries(rankingId: string) {
    return this.databaseProvider.db.rankingEntry.findMany({
      where: { rankingId },
      include: {
        player: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        currentElo: 'desc',
      },
    });
  }

  async findByGameAndSlug(gameSlug: string, eventSlug: string) {
    const game = await this.databaseProvider.db.game.findFirst({
      where: { slug: gameSlug },
    });
    if (!game) return null;

    return this.databaseProvider.db.ranking.findFirst({
      where: {
        event: {
          gameId: game.id,
          slug: eventSlug,
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

  async update(id: string, data: UpdateRankingInput, userId?: string) {
    if (userId) {
      const ranking = await this.databaseProvider.db.ranking.findUnique({
        where: { eventId: id },
        include: { event: { select: { authorId: true } } },
      });
      if (ranking?.event?.authorId && ranking.event.authorId !== userId) {
        throw new Error('You do not have permission to edit this ranking');
      }
    }

    const { name, slug, description, ...rankingData } = data;
    return this.databaseProvider.db.ranking.update({
      where: { eventId: id },
      data: {
        event: {
          update: {
            name,
            slug,
            description,
          },
        },
        ...rankingData,
      },
      include: { event: true },
    });
  }

  async create(data: CreateRankingInput) {
    const {
      gameId,
      name,
      slug,
      description,
      startDate,
      endDate,
      authorId,
      ...rankingData
    } = data;
    return this.databaseProvider.db.ranking.create({
      data: {
        event: {
          create: {
            gameId,
            type: 'RANKING',
            name,
            slug,
            description,
            startDate,
            endDate,
            authorId,
          },
        },
        ...rankingData,
      },
      include: { event: true },
    });
  }

  async addPlayer(rankingId: string, playerId: string, initialElo?: number) {
    let elo = initialElo;
    if (elo === undefined) {
      const ranking = await this.databaseProvider.db.ranking.findUnique({
        where: { eventId: rankingId },
      });
      elo = ranking?.initialElo ?? 1000;
    }

    return this.databaseProvider.db.rankingEntry.create({
      data: {
        rankingId,
        playerId,
        currentElo: elo,
      },
    });
  }

  async registerSelf(rankingId: string, userId: string) {
    // 1. Find or create player for this game
    const ranking = await this.databaseProvider.db.ranking.findUnique({
      where: { eventId: rankingId },
      include: { event: true },
    });
    if (!ranking) throw new Error('Ranking not found');

    let player = await this.databaseProvider.db.player.findUnique({
      where: { gameId_userId: { gameId: ranking.event.gameId, userId } },
    });

    if (!player) {
      player = await this.databaseProvider.db.player.create({
        data: {
          gameId: ranking.event.gameId,
          userId,
        },
      });
    }

    // 2. Add to ranking entries
    return this.databaseProvider.db.rankingEntry.create({
      data: {
        rankingId,
        playerId: player.id,
        currentElo: ranking.initialElo,
      },
    });
  }
}
