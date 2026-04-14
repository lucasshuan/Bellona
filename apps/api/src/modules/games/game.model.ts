import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { User } from '../auth/user.model';
import { Ranking } from '../rankings/ranking.model';

@ObjectType()
export class GameCounts {
  @Field(() => Int)
  rankings: number;

  @Field(() => Int)
  players: number;
}

@ObjectType()
export class Game {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  thumbnailImageUrl?: string;

  @Field({ nullable: true })
  backgroundImageUrl?: string;

  @Field({ nullable: true })
  steamUrl?: string;

  @Field()
  status: string;

  @Field()
  authorId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => User, { nullable: true })
  author?: User;

  @Field(() => [Ranking], { nullable: true })
  rankings?: Ranking[];

  @Field(() => GameCounts, { name: '_count', nullable: true })
  count?: GameCounts;
}
