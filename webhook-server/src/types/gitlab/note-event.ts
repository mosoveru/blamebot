import { Project, Repository, User } from './common';
import { ObjectAttributes as MergeRequest } from './merge-request-event';
import { ObjectAttributes as Issue } from './issue-event';

export interface GitLabNoteHookEvent {
  object_kind: 'note';
  event_type: 'note';
  user: User;
  project_id: number;
  project: Project;
  object_attributes: ObjectAttributes;
  repository: Repository;
  issue?: Issue;
  merge_request?: MergeRequest;
}

export interface ObjectAttributes {
  attachment: null;
  author_id: number;
  change_position: Position | null;
  commit_id: null;
  created_at: string;
  discussion_id: string;
  id: number;
  line_code: null | string;
  note: string;
  noteable_id: number;
  noteable_type: 'Issue' | 'MergeRequest';
  original_position: Position | null;
  position: Position | null;
  project_id: number;
  resolved_at: null;
  resolved_by_id: null;
  resolved_by_push: null;
  st_diff: null;
  system: boolean;
  type: null | 'DiffNote' | string;
  updated_at: string;
  updated_by_id: null;
  description: string;
  url: string;
  action: string;
}

interface Position {
  base_sha: null | string;
  start_sha: null | string;
  head_sha: null | string;
  old_path: null | string;
  new_path: null | string;
  position_type: string;
  old_line: number | null;
  new_line: number | null;
  line_range: LineRange | null;
}

interface LineRange {
  start: End;
  end: End;
}

interface End {
  line_code: string;
  type: null | string;
  old_line: number | null;
  new_line: number;
}
