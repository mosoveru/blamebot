import { Project, User } from './common';
import { ObjectAttributes as MergeRequest } from './merge-request-event';
import { ObjectAttributes as Issue } from './issue-event';

export interface GitLabEmojiEvent {
  object_kind: 'emoji';
  event_type: 'revoke' | 'award';
  user: User;
  project_id: number;
  project: Project;
  object_attributes: ObjectAttributes;
  merge_request?: MergeRequest;
  issue?: Issue;
}

export interface ObjectAttributes {
  user_id: number;
  created_at: string;
  id: number;
  name: string;
  awardable_type: 'Issue' | 'MergeRequest';
  awardable_id: number;
  updated_at: string;
  awarded_on_url: string;
}
