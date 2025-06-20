import { IssueHookDataParser } from './issue-hook';
import { DataParserConstructor } from '../types';
import { MergeRequestHookDataParser } from './merge-request-hook';

export const GitLabDataParsers: DataParserConstructor[] = [IssueHookDataParser, MergeRequestHookDataParser];
