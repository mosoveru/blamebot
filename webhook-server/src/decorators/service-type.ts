import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GitWebhookRequestPayload } from '../types';

export const ServiceType = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const headers = req.headers;
  const body = req.body;
  const gitServiceHeaders = new Map([
    ['x-gitlab-event', 'GITLAB'],
    ['x-gitea-event', 'GITEA'],
  ]);
  for (const gitServiceEvent of gitServiceHeaders.keys()) {
    if (headers[gitServiceEvent]) {
      return {
        service: gitServiceHeaders.get(gitServiceEvent),
        eventType: headers[gitServiceEvent] as string,
        eventPayload: body,
      } satisfies GitWebhookRequestPayload;
    }
  }
  return null;
});
