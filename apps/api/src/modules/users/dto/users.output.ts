import { ObjectType } from '@nestjs/graphql';
import { User } from '../../auth/user.model';
import { Paginated } from '../../../common/pagination/pagination.type';

@ObjectType()
export class PaginatedUsers extends Paginated(User) {}
