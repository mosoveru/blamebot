import { IssueHookDataParser } from './issue-hook';
import { DataParserConstructor } from '../types';
import { MergeRequestHookDataParser } from './merge-request-hook';
import { PipelineHookDataParser } from './pipeline-hook';
import { NoteHookDataParser } from './note-hook';

export const GitLabDataParsers: DataParserConstructor[] = [
  IssueHookDataParser,
  MergeRequestHookDataParser,
  PipelineHookDataParser,
  NoteHookDataParser,
];
