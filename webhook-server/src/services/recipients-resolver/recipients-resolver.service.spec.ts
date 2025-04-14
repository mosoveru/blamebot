import { Test, TestingModule } from '@nestjs/testing';
import { RecipientsResolverService } from './recipients-resolver.service';

describe('RecipientsResolverService', () => {
  let service: RecipientsResolverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecipientsResolverService],
    }).compile();

    service = module.get<RecipientsResolverService>(RecipientsResolverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
