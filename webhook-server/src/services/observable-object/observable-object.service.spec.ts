import { Test, TestingModule } from '@nestjs/testing';
import { ObservableObjectService } from './observable-object.service';

describe('ObservableObjectService', () => {
  let service: ObservableObjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ObservableObjectService],
    }).compile();

    service = module.get<ObservableObjectService>(ObservableObjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
