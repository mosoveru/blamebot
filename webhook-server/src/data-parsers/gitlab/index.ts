import { IssueHookDataParser } from './issue-hook';
import type { DataParserConstructor } from '../../types';

export const GitLabDataParsers: DataParserConstructor[] = [IssueHookDataParser];
