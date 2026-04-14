import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Player } from '../games/player.model';
import { Ranking } from './ranking.model';

@ObjectType()
export class RankingEntry {
  @Field(() => ID)
  id: string;

  @Field()
  rankingId: string;

  @Field()
  playerId: string;

  @Field(() => Int)
  currentElo: number;

  @Field(() => Int, { nullable: true })
  position?: number;

  @Field(() => Player, { nullable: true })
  player?: Player;

  @Field(() => Ranking, { nullable: true })
  ranking?: Ranking;
}
