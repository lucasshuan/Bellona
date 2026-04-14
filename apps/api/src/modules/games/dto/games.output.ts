import { ObjectType } from '@nestjs/graphql';
import { Game } from '../game.model';
import { Paginated } from '../../../common/pagination/pagination.type';

@ObjectType()
export class PaginatedGames extends Paginated(Game) {}
