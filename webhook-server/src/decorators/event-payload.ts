import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { NullableEventPayload } from '../types';
import { EventHeaders, GitProviders, SecretTokenHeaders } from '../constants/enums';
import { verify } from 'jsonwebtoken';

export const Payload = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const jwtKey = process.env.PRIVATE_JWT_KEY;
  if (!jwtKey) {
    throw new Error('PRIVATE_JWT_KEY key is not defined in .env file');
  }
  const req = ctx.switchToHttp().getRequest();
  const headers = req.headers;
  const body = req.body;
  const eventPayload: NullableEventPayload<any> = {
    service: null,
    eventType: null,
    eventPayload: null,
    instanceId: null,
  };

  const eventHeaders = new Map([
    [EventHeaders.GITLAB, GitProviders.GITLAB],
    [EventHeaders.GITEA, GitProviders.GITEA],
  ]);
  const secretTokenHeaders = new Map([
    [SecretTokenHeaders.GITLAB, GitProviders.GITLAB],
    [SecretTokenHeaders.GITEA, GitProviders.GITEA],
  ]);

  for (const eventHeader of eventHeaders.keys()) {
    if (headers[eventHeader]) {
      eventPayload.service = eventHeaders.get(eventHeader)!;
      eventPayload.eventType = headers[eventHeader] as string;
      eventPayload.eventPayload = body;
    }
  }
  for (const header of secretTokenHeaders.keys()) {
    const serviceSecret = headers[header];
    if (serviceSecret) {
      eventPayload.instanceId = verify(serviceSecret, jwtKey) as string;
    }
  }
  const hasNull = Object.values(eventPayload).some((value) => value === null || value === undefined);

  return hasNull ? null : eventPayload;
});
