import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GitWebhookServiceType } from '../types';
import { EventHeaders, RemoteGitServices } from '../constants/enums';

export const ServiceType = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const headers = req.headers;
  const body = req.body;
  const gitServiceHeaders = new Map([
    [EventHeaders.GITLAB, RemoteGitServices.GITLAB],
    [EventHeaders.GITEA, RemoteGitServices.GITEA],
  ]);
  for (const gitServiceEvent of gitServiceHeaders.keys()) {
    if (headers[gitServiceEvent]) {
      return {
        service: gitServiceHeaders.get(gitServiceEvent),
        eventType: headers[gitServiceEvent] as string,
        eventPayload: body,
      } satisfies GitWebhookServiceType<any>;
    }
  }
  return null;
});
