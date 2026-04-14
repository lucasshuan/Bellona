import { Injectable } from '@nestjs/common';
import { DatabaseProvider } from '../../database/database.provider';
import { CreateRankingInput, UpdateRankingInput } from './rankings.resolver';

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

  async update(id: string, data: UpdateRankingInput) {
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
