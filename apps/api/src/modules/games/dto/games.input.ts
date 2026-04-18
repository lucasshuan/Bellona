import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsUrl } from 'class-validator';

@InputType()
export class CreateGameInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  slug: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsUrl()
  @IsOptional()
  backgroundImageUrl?: string;

  @Field({ nullable: true })
  @IsUrl()
  @IsOptional()
  thumbnailImageUrl?: string;

  @Field({ nullable: true })
  @IsUrl()
  @IsOptional()
  steamUrl?: string;

  @Field()
  @IsString()
  authorId: string;
}

@InputType()
export class UpdateGameInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  slug?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsUrl()
  @IsOptional()
  backgroundImageUrl?: string;

  @Field({ nullable: true })
  @IsUrl()
  @IsOptional()
  thumbnailImageUrl?: string;

  @Field({ nullable: true })
  @IsUrl()
  @IsOptional()
  steamUrl?: string;
}
