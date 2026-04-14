import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { User } from '../auth/user.model';
import { Game } from './game.model';
import { RankingEntry } from '../rankings/ranking-entry.model';

@ObjectType()
export class Player {
  @Field(() => ID)
  id: string;

  @Field()
  gameId: string;

  @Field()
  userId: string;

  @Field(() => Int)
  currentElo: number;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => Game, { nullable: true })
  game?: Game;

  @Field(() => [RankingEntry], { nullable: true })
  rankingEntries?: RankingEntry[];

  @Field(() => [PlayerUsername], { nullable: true })
  usernames?: PlayerUsername[];
}

@ObjectType()
export class PlayerUsername {
  @Field(() => ID)
  id: string;

  @Field()
  username: string;
}
