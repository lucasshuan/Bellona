import { Injectable } from '@nestjs/common';
import { DatabaseProvider } from '../../database/database.provider';
import { CreateRankingInput, UpdateRankingInput } from './dto/rankings.input';
import { PaginationInput } from '../../common/pagination/pagination.input';

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
export class RankingsService {
  constructor(private databaseProvider: DatabaseProvider) {}

  async findAll(pagination: PaginationInput) {
    const { skip, take } = pagination;

    const [nodes, totalCount] = await Promise.all([
      this.databaseProvider.ranking.findMany({
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
      this.databaseProvider.ranking.count(),
    ]);

    return {
      nodes: nodes.map(mapRankingWithEvent),
      totalCount,
      hasNextPage: skip + take < totalCount,
    };
  }

  async getGame(gameId: string) {
    return this.databaseProvider.game.findUnique({
      where: { id: gameId },
    });
  }

  async getEntries(rankingId: string) {
    return this.databaseProvider.rankingEntry.findMany({
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
    const game = await this.databaseProvider.game.findFirst({
      where: { slug: gameSlug },
    });
    if (!game) return null;

    const ranking = await this.databaseProvider.ranking.findFirst({
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

    return ranking ? mapRankingWithEvent(ranking) : null;
  }

  async update(id: string, data: UpdateRankingInput, userId?: string) {
    if (userId) {
      const ranking = await this.databaseProvider.ranking.findUnique({
        where: { eventId: id },
        include: { event: { select: { authorId: true } } },
      });
      if (ranking?.event?.authorId && ranking.event.authorId !== userId) {
        throw new Error('You do not have permission to edit this ranking');
      }
    }

    const { name, slug, description, ...rankingData } = data;
    const ranking = await this.databaseProvider.ranking.update({
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

    return mapRankingWithEvent(ranking);
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
    const ranking = await this.databaseProvider.ranking.create({
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

    return mapRankingWithEvent(ranking);
  }

  async addPlayer(rankingId: string, playerId: string, initialElo?: number) {
    let elo = initialElo;
    if (elo === undefined) {
      const ranking = await this.databaseProvider.ranking.findUnique({
        where: { eventId: rankingId },
      });
      elo = ranking?.initialElo ?? 1000;
    }

    return this.databaseProvider.rankingEntry.create({
      data: {
        rankingId,
        playerId,
        currentElo: elo,
      },
    });
  }

  async registerSelf(rankingId: string, userId: string) {
    // 1. Find or create player for this game
    const ranking = await this.databaseProvider.ranking.findUnique({
      where: { eventId: rankingId },
      include: { event: true },
    });
    if (!ranking) throw new Error('Ranking not found');

    let player = await this.databaseProvider.player.findUnique({
      where: { gameId_userId: { gameId: ranking.event.gameId, userId } },
    });

    if (!player) {
      player = await this.databaseProvider.player.create({
        data: {
          gameId: ranking.event.gameId,
          userId,
        },
      });
    }

    // 2. Add to ranking entries
    return this.databaseProvider.rankingEntry.create({
      data: {
        rankingId,
        playerId: player.id,
        currentElo: ranking.initialElo,
      },
    });
  }
}
