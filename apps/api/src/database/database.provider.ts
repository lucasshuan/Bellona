import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@ares/db';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class DatabaseProvider extends PrismaClient implements OnModuleInit {
  constructor(private configService: ConfigService) {
    const databaseUrl = configService.getOrThrow<string>('POSTGRES_URL');
    const adapter = new PrismaPg({ connectionString: databaseUrl });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  get db() {
    return this;
  }
}
