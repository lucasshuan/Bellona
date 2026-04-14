import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

export function Paginated<T>(classRef: Type<T>) {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedType {
    @Field(() => [classRef])
    nodes: T[];

    @Field(() => Int)
    totalCount: number;

    @Field(() => Boolean)
    hasNextPage: boolean;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return PaginatedType as any;
}
