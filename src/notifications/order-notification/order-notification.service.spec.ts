import { Test, TestingModule } from '@nestjs/testing';
import { OrderNotificationService } from './order-notification.service';

describe('OrderNotificationService', () => {
  let service: OrderNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderNotificationService],
    }).compile();

    service = module.get<OrderNotificationService>(OrderNotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
