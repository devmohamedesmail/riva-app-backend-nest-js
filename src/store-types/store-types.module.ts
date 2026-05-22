import { Module } from '@nestjs/common';
import { StoreTypesService } from './store-types.service';
import { StoreTypesController } from './store-types.controller';

@Module({
  providers: [StoreTypesService],
  controllers: [StoreTypesController]
})
export class StoreTypesModule {}
