import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryLocationController } from './delivery-location.controller';

describe('DeliveryLocationController', () => {
  let controller: DeliveryLocationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryLocationController],
    }).compile();

    controller = module.get<DeliveryLocationController>(DeliveryLocationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
