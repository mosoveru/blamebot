import { IssueMessageComposer } from './issue-message-composer';
import { MessageComposer } from '../../../types';
import { RequestMessageComposer } from './request-message-composer';

type MessageComposerConstructor = {
  new (): MessageComposer;
};

export const MessageComposerConstructors: MessageComposerConstructor[] = [IssueMessageComposer, RequestMessageComposer];
