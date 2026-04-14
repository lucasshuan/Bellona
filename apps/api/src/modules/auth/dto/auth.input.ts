import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  profileColor?: string;

  @Field({ nullable: true })
  country?: string;
}
