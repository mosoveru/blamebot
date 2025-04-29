import { IssueMessageComposer } from './issue-message-composer';
import { MessageComposer } from '../../../types';

type MessageComposerConstructor = {
  new (): MessageComposer;
};

export const MessageComposerConstructors: MessageComposerConstructor[] = [IssueMessageComposer];
