import { Test, TestingModule } from '@nestjs/testing';
import { NotificationComposerService } from './notification-composer.service';

describe('NotificationComposerService', () => {
  let service: NotificationComposerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationComposerService],
    }).compile();

    service = module.get<NotificationComposerService>(NotificationComposerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
