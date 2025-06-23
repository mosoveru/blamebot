import { Commit, Label, Project, Repository, User } from './common';

export interface GitLabMergeRequestEvent {
  object_kind: 'merge_request';
  event_type: 'merge_request';
  user: User;
  project: Project;
  object_attributes: ObjectAttributes;
  labels: Label[];
  changes: Changes;
  repository: Repository;
  assignees: User[];
  reviewers: User[];
}

export interface ObjectAttributes {
  assignee_id: number;
  author_id: number;
  created_at: string;
  description: string;
  draft: boolean;
  head_pipeline_id: null;
  id: number;
  iid: number;
  last_edited_at: null;
  last_edited_by_id: null;
  merge_commit_sha: null | string;
  merge_error: null;
  merge_params: {
    force_remove_source_branch: '1' | string;
  };
  merge_status: 'can_be_merged' | 'unchecked' | string;
  merge_user_id: null;
  merge_when_pipeline_succeeds: boolean;
  milestone_id: null;
  source_branch: string;
  source_project_id: number;
  state_id: number;
  target_branch: string;
  target_project_id: number;
  time_estimate: number;
  title: string;
  updated_at: string;
  updated_by_id: null;
  prepared_at: string;
  assignee_ids: number[];
  blocking_discussions_resolved: boolean;
  detailed_merge_status:
    | 'mergeable'
    | 'cannot_be_merged'
    | 'not_open'
    | 'unchecked'
    | 'draft_status'
    | 'merge_time'
    | 'ci_must_pass'
    | 'broken_status'
    | string;
  first_contribution: boolean;
  human_total_time_spent: null | string;
  human_time_change: null | string;
  human_time_estimate: null | string;
  labels: Label[];
  last_commit: Commit;
  reviewer_ids: number[];
  source: Project;
  state: 'opened' | 'closed' | 'merged' | string;
  target: Project;
  time_change: number;
  total_time_spent: number;
  url: string;
  work_in_progress: boolean;
  action: 'open' | 'reopen' | 'approved' | 'unapproved' | 'close' | 'update' | 'merge' | string;
  oldrev?: string;
}

export interface Changes {
  merge_status?: {
    previous: string;
    current: string;
  };
  updated_at?: {
    previous: string;
    current: string;
  };
  prepared_at?: {
    previous: null | string;
    current: string;
  };
  title?: {
    previous: string;
    current: string;
  };
  description?: {
    previous: null;
    current: string;
  };
  updated_by_id?: {
    previous: null;
    current: number;
  };
  reviewers?: {
    previous: User[];
    current: User[];
  };
  assignees?: {
    previous: User[];
    current: User[];
  };
  time_estimate?: {
    previous: number;
    current: number;
  };
  total_time_spent?: {
    previous: number;
    current: number;
  };
  time_change?: {
    previous: number;
    current: number;
  };
  state_id?: {
    previous: number;
    current: number;
  };
  merge_commit_sha: {
    previous: null;
    current: string;
  };
  draft?: {
    previous: boolean;
    current: boolean;
  };
  labels?: {
    previous: Label[];
    current: Label[];
  };
}
