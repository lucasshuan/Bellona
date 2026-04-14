import {
  Args,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Mutation,
  InputType,
  Field,
  ID,
} from '@nestjs/graphql';
import { Game } from './game.model';
import { GamesService } from './games.service';
import { DatabaseProvider } from '../../database/database.provider';
import { User } from '../auth/user.model';
import { Ranking } from '../rankings/ranking.model';

@Resolver(() => Game)
export class GamesResolver {
  constructor(
    private gamesService: GamesService,
    private databaseProvider: DatabaseProvider,
  ) {}

  @Query(() => [Game], { name: 'games' })
  async getGames(@Args('search', { nullable: true }) search?: string) {
    return this.gamesService.findAll(search);
  }

  @Query(() => Game, { name: 'game', nullable: true })
  async getGameBySlug(@Args('slug') slug: string) {
    return this.gamesService.findBySlug(slug);
  }

  @ResolveField(() => User, { name: 'author', nullable: true })
  async getAuthor(@Parent() game: Game) {
    return this.databaseProvider.db.user.findUnique({
      where: { id: game.authorId },
    });
  }

  @ResolveField(() => [Ranking], { name: 'rankings' })
  async getRankings(@Parent() game: Game) {
    return this.databaseProvider.db.ranking.findMany({
      where: {
        event: {
          gameId: game.id,
        },
      },
      orderBy: {
        event: {
          createdAt: 'desc',
        },
      },
    });
  }

  @Mutation(() => Game)
  async createGame(@Args('input') input: CreateGameInput) {
    return this.gamesService.create(input);
  }

  @Mutation(() => Game)
  async updateGame(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateGameInput,
  ) {
    return this.gamesService.update(id, input);
  }

  @Mutation(() => Game)
  async approveGame(@Args('id', { type: () => ID }) id: string) {
    return this.gamesService.approve(id);
  }
}

@InputType()
export class CreateGameInput {
  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  backgroundImageUrl?: string;

  @Field({ nullable: true })
  thumbnailImageUrl?: string;

  @Field({ nullable: true })
  steamUrl?: string;

  @Field()
  authorId: string;
}

@InputType()
export class UpdateGameInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  backgroundImageUrl?: string;

  @Field({ nullable: true })
  thumbnailImageUrl?: string;

  @Field({ nullable: true })
  steamUrl?: string;
}
