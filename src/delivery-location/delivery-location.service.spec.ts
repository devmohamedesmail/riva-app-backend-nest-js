import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryLocationService } from './delivery-location.service';

describe('DeliveryLocationService', () => {
  let service: DeliveryLocationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeliveryLocationService],
    }).compile();

    service = module.get<DeliveryLocationService>(DeliveryLocationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
