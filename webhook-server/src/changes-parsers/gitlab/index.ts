import { IssueHookChangesParser } from './issue-hook';
import { ChangesParserConstructor } from '../../types';

export const GitLabChangesParsers: ChangesParserConstructor[] = [IssueHookChangesParser];
