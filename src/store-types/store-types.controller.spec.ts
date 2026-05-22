import { Test, TestingModule } from '@nestjs/testing';
import { StoreTypesController } from './store-types.controller';

describe('StoreTypesController', () => {
  let controller: StoreTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreTypesController],
    }).compile();

    controller = module.get<StoreTypesController>(StoreTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
