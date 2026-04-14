import {
  Parent,
  ResolveField,
  Resolver,
  Query,
  Args,
  ID,
  Mutation,
  InputType,
  Field,
} from '@nestjs/graphql';
import { Player, PlayerUsername } from './player.model';
import { User } from '../auth/user.model';
import { DatabaseProvider } from '../../database/database.provider';

@Resolver(() => Player)
export class PlayersResolver {
  constructor(private databaseProvider: DatabaseProvider) {}

  @Query(() => Player, { name: 'player', nullable: true })
  async getPlayer(@Args('id', { type: () => ID }) id: string) {
    return this.databaseProvider.db.player.findUnique({
      where: { id },
    });
  }

  @ResolveField(() => User, { name: 'user', nullable: true })
  async getUser(@Parent() player: Player) {
    if (!player.userId) return null;
    return this.databaseProvider.db.user.findUnique({
      where: { id: player.userId },
    });
  }

  @ResolveField(() => [PlayerUsername], { name: 'usernames' })
  async getUsernames(@Parent() player: Player) {
    return this.databaseProvider.db.playerUsername.findMany({
      where: { playerId: player.id },
    });
  }

  @Mutation(() => Player)
  async addPlayerToGame(@Args('input') input: AddPlayerToGameInput) {
    const { gameId, username, userId } = input;
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

  @Query(() => [PlayerUsername], { name: 'searchPlayers' })
  async searchPlayers(
    @Args('gameId', { type: () => ID }) gameId: string,
    @Args('query') query: string,
  ) {
    return this.databaseProvider.db.playerUsername.findMany({
      where: {
        username: { contains: query, mode: 'insensitive' },
        player: { gameId },
      },
      include: {
        player: {
          include: {
            user: true,
          },
        },
      },
      take: 10,
    });
  }
}

@InputType()
export class AddPlayerToGameInput {
  @Field()
  gameId: string;

  @Field()
  username: string;

  @Field({ nullable: true })
  userId?: string;
}
