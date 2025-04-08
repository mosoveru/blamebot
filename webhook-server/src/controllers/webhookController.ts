import { Controller, Inject, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { GitServiceTypeParser } from '../types';
import { TOKENS } from '../config/tokens';

@Controller('webhook')
export class WebhookController {
  constructor(@Inject(TOKENS.GIT_SERVICE_PARSER) private readonly gitServiceParser: GitServiceTypeParser) {}

  @Post()
  printPayload(@Req() req: Request): void {
    const gitService = this.gitServiceParser.parseGitServiceAndEventType(req.headers);
    console.log(gitService);
  }
}
