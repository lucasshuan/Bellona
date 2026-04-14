import { Injectable } from '@nestjs/common';
import { DatabaseProvider } from '../../database/database.provider';

@Injectable()
export class AuditService {
  constructor(private databaseProvider: DatabaseProvider) {}

  async log(params: {
    userId?: string;
    action: string;
    description: string;
    entityType: string;
    entityId: string;
  }) {
    return this.databaseProvider.db.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        description: params.description,
        entityType: params.entityType,
        entityId: params.entityId,
      },
    });
  }
}
