import { Test, TestingModule } from '@nestjs/testing';
import { StoreTypesService } from './store-types.service';

describe('StoreTypesService', () => {
  let service: StoreTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoreTypesService],
    }).compile();

    service = module.get<StoreTypesService>(StoreTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
