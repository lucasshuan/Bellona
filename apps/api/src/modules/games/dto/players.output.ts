import { ObjectType } from '@nestjs/graphql';
import { PlayerUsername } from '../player.model';
import { Paginated } from '../../../common/pagination/pagination.type';

@ObjectType()
export class PaginatedPlayers extends Paginated(PlayerUsername) {}
