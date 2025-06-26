import { IssueMessageComposer } from './issue-message-composer';
import { MessageComposer } from '../../../types';
import { RequestMessageComposer } from './request-message-composer';
import { PipelineMessageComposer } from './pipeline-message-composer';

type MessageComposerConstructor = {
  new (): MessageComposer;
};

export const MessageComposerConstructors: MessageComposerConstructor[] = [
  IssueMessageComposer,
  RequestMessageComposer,
  PipelineMessageComposer,
];
