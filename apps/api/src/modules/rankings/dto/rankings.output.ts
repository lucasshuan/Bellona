import { ObjectType } from '@nestjs/graphql';
import { Ranking } from '../ranking.model';
import { Paginated } from '../../../common/pagination/pagination.type';

@ObjectType()
export class PaginatedRankings extends Paginated(Ranking) {}
