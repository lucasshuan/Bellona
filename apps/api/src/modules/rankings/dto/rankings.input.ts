import { InputType, Field, Int, Float } from '@nestjs/graphql';

@InputType()
export class CreateRankingInput {
  @Field()
  gameId: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  initialElo: number;

  @Field()
  ratingSystem: string;

  @Field()
  allowDraw: boolean;

  @Field(() => Int)
  kFactor: number;

  @Field(() => Float)
  scoreRelevance: number;

  @Field(() => Int)
  inactivityDecay: number;

  @Field(() => Int)
  inactivityThresholdHours: number;

  @Field(() => Int)
  inactivityDecayFloor: number;

  @Field(() => Int)
  pointsPerWin: number;

  @Field(() => Int)
  pointsPerDraw: number;

  @Field(() => Int)
  pointsPerLoss: number;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field()
  authorId: string;
}

@InputType()
export class UpdateRankingInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int, { nullable: true })
  initialElo?: number;

  @Field({ nullable: true })
  ratingSystem?: string;

  @Field({ nullable: true })
  allowDraw?: boolean;

  @Field(() => Int, { nullable: true })
  kFactor?: number;

  @Field(() => Float, { nullable: true })
  scoreRelevance?: number;

  @Field(() => Int, { nullable: true })
  inactivityDecay?: number;

  @Field(() => Int, { nullable: true })
  inactivityThresholdHours?: number;

  @Field(() => Int, { nullable: true })
  inactivityDecayFloor?: number;

  @Field(() => Int, { nullable: true })
  pointsPerWin?: number;

  @Field(() => Int, { nullable: true })
  pointsPerDraw?: number;

  @Field(() => Int, { nullable: true })
  pointsPerLoss?: number;
}
