import { Test, TestingModule } from '@nestjs/testing';
import { NotificationMakerService } from './notification-maker.service';

describe('NotificationMakerService', () => {
  let service: NotificationMakerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationMakerService],
    }).compile();

    service = module.get<NotificationMakerService>(NotificationMakerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
