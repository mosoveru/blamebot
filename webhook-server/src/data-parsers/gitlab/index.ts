import { IssueHookDataParser } from './issue-hook';
import { DataParserConstructor } from '../types';
import { MergeRequestHookDataParser } from './merge-request-hook';
import { NoteEmojiPipelineHookDataParser } from './note-emoji-pipeline-hook';

export const GitLabDataParsers: DataParserConstructor[] = [
  IssueHookDataParser,
  MergeRequestHookDataParser,
  NoteEmojiPipelineHookDataParser,
];
