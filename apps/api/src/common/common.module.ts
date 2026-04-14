import { Global, Module } from '@nestjs/common';
import { DataLoaderService } from './dataloaders/dataloader.service';

@Global()
@Module({
  providers: [DataLoaderService],
  exports: [DataLoaderService],
})
export class CommonModule {}
