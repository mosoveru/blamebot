import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { verify } from 'jsonwebtoken';

export const ServiceName = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const headers = req.headers;
  const gitServiceHeaders = new Map([
    ['x-gitlab-token', 'GITLAB'],
    ['x-gitea-secret', 'GITEA'],
  ]);
  for (const header of gitServiceHeaders.keys()) {
    const serviceSecret = headers[header];
    if (serviceSecret) {
      return verify(serviceSecret, process.env.PRIVATE_JWT_KEY);
    }
  }
  return null;
});
