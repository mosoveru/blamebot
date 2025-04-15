import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { RemoteGitServices, SecretTokenHeaders } from '../constants/enums';

export const ServiceName = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const headers = req.headers;
  const jwtKey = process.env.PRIVATE_JWT_KEY;
  if (!jwtKey) {
    throw new Error('PRIVATE_JWT_KEY key is not defined in .env file');
  }
  const gitServiceHeaders = new Map([
    [SecretTokenHeaders.GITLAB, RemoteGitServices.GITLAB],
    [SecretTokenHeaders.GITEA, RemoteGitServices.GITEA],
  ]);
  for (const header of gitServiceHeaders.keys()) {
    const serviceSecret = headers[header];
    if (serviceSecret) {
      return verify(serviceSecret, jwtKey);
    }
  }
  return null;
});
