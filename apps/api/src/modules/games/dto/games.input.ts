import { InputType, Field } from '@nestjs/graphql';

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
