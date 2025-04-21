import { Test, TestingModule } from '@nestjs/testing';
import { NotificationRecipientsService } from './notification-recipients.service';

describe('NotificationRecipientsService', () => {
  let service: NotificationRecipientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationRecipientsService],
    }).compile();

    service = module.get<NotificationRecipientsService>(NotificationRecipientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
