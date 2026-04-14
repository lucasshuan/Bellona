import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class AddPlayerToGameInput {
  @Field()
  gameId: string;

  @Field()
  username: string;

  @Field({ nullable: true })
  userId?: string;
}
