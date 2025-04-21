import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUserService } from './service-user.service';

describe('ServiceUserService', () => {
  let service: ServiceUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceUserService],
    }).compile();

    service = module.get<ServiceUserService>(ServiceUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
