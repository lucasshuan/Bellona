import { Injectable } from '@nestjs/common';
import { DatabaseProvider } from '../../database/database.provider';
import { CreateGameInput, UpdateGameInput } from './dto/games.input';
import { AddPlayerToGameInput } from './dto/players.input';
import { PaginationInput } from '../../common/pagination/pagination.input';
import { Prisma } from '@ares/db';
import { StorageService } from '../storage/storage.service';

function mapLeagueWithEvent<
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
>(league: T) {
  return {
    ...league,
    id: league.event.id ?? league.eventId,
    gameId: league.event.gameId,
    name: league.event.name,
    slug: league.event.slug,
    description: league.event.description,
    startDate: league.event.startDate,
    endDate: league.event.endDate,
    isApproved: !!league.event.approvedAt,
    createdAt: league.event.createdAt,
    updatedAt: league.event.updatedAt,
  };
}

@Injectable()
export class GamesService {
  constructor(
    private databaseProvider: DatabaseProvider,
    private storageService: StorageService,
  ) {}

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

  async getEloLeagues(gameId: string) {
    const leagues = await this.databaseProvider.eloLeague.findMany({
      where: { event: { gameId } },
      include: { event: true },
      orderBy: { event: { createdAt: 'desc' } },
    });

    return leagues.map(mapLeagueWithEvent);
  }

  async getStandardLeagues(gameId: string) {
    const leagues = await this.databaseProvider.standardLeague.findMany({
      where: { event: { gameId } },
      include: { event: true },
      orderBy: { event: { createdAt: 'desc' } },
    });

    return leagues.map(mapLeagueWithEvent);
  }

  async findEventMeta(gameSlug: string, eventSlug: string) {
    const game = await this.databaseProvider.game.findFirst({
      where: { slug: gameSlug },
    });
    if (!game) return null;

    const event = await this.databaseProvider.event.findFirst({
      where: { gameId: game.id, slug: eventSlug },
      select: { id: true, type: true },
    });

    return event ?? null;
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
    const current = await this.databaseProvider.game.findUnique({
      where: { id },
      select: {
        authorId: true,
        backgroundImageUrl: true,
        thumbnailImageUrl: true,
      },
    });

    if (userId) {
      // Apenas o autor ou admin pode editar.
      if (current && current.authorId && current.authorId !== userId) {
        throw new Error('You do not have permission to edit this game');
      }
    }

    // Delete old CDN images when they are replaced
    const deletions: Promise<void>[] = [];
    if (
      data.backgroundImageUrl !== undefined &&
      current?.backgroundImageUrl &&
      current.backgroundImageUrl !== data.backgroundImageUrl
    ) {
      deletions.push(
        this.storageService.deleteFile(current.backgroundImageUrl),
      );
    }
    if (
      data.thumbnailImageUrl !== undefined &&
      current?.thumbnailImageUrl &&
      current.thumbnailImageUrl !== data.thumbnailImageUrl
    ) {
      deletions.push(this.storageService.deleteFile(current.thumbnailImageUrl));
    }
    if (deletions.length > 0) {
      await Promise.all(deletions);
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
