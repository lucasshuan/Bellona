import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Player } from '../games/player.model';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  username: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  profileColor?: string;

  @Field({ nullable: true })
  country?: string;

  @Field()
  isAdmin: boolean;

  @Field()
  createdAt: Date;

  @Field(() => [Player], { nullable: true })
  players?: Player[];
}

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken: string;

  @Field(() => User)
  user: User;
}
