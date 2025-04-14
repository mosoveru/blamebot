import IssueHookHandler from './issue-hook';
import { GitRemoteHandlerConstructor } from '../../types';

export const GitLabHandlers: GitRemoteHandlerConstructor[] = [IssueHookHandler];
