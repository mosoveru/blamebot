import { Test, TestingModule } from '@nestjs/testing';
import { GitRemoteHandlersRepository } from './git-remote-handlers-repository';

describe('GitRemoteHandlersRepository', () => {
  let provider: GitRemoteHandlersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GitRemoteHandlersRepository],
    }).compile();

    provider = module.get<GitRemoteHandlersRepository>(GitRemoteHandlersRepository);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
