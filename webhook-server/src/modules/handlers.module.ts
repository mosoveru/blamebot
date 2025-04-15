import { Module } from '@nestjs/common';
import { GitRemoteHandlersRepository } from '../repository/git-remote-handlers-repository/git-remote-handlers-repository';
import { RemoteGitServices } from '../constants/enums';
import { GitLabHandlers } from '../git-remote-handlers/gitlab';

@Module({
  providers: [
    {
      provide: GitRemoteHandlersRepository,
      useFactory: () => {
        const repository = new GitRemoteHandlersRepository();
        repository.registerHandlers(RemoteGitServices.GITLAB, GitLabHandlers);
        return repository;
      },
    },
  ],
  exports: [GitRemoteHandlersRepository],
})
export class HandlersModule {}
