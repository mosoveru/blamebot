import { IssueHookDataParser } from './issue-hook';
import { DataParserConstructor } from '../types';
import { MergeRequestHookDataParser } from './merge-request-hook';
import { PipelineHookDataParser } from './pipeline-hook';

export const GitLabDataParsers: DataParserConstructor[] = [
  IssueHookDataParser,
  MergeRequestHookDataParser,
  PipelineHookDataParser,
];
