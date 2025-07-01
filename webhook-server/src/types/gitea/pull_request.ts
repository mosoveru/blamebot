import { Repository, Sender } from './common';

export interface GiteaPullRequestEvent {
  action: 'opened' | 'assigned' | 'unassigned' | 'review_request_removed' | 'review_requested' | string;
  number: number;
  pull_request: PullRequest;
  requested_reviewer: null;
  repository: Repository;
  sender: Sender;
  commit_id: string;
  review: null;
}

export interface PullRequest {
  id: number;
  url: string;
  number: number;
  user: Sender;
  title: string;
  body: string;
  labels: any[];
  milestone: null;
  assignee: null;
  assignees: any[];
  requested_reviewers: Sender[];
  requested_reviewers_teams: any[];
  state: string;
  draft: boolean;
  is_locked: boolean;
  comments: number;
  additions: number;
  deletions: number;
  changed_files: number;
  html_url: string;
  diff_url: string;
  patch_url: string;
  mergeable: boolean;
  merged: boolean;
  merged_at: null;
  merge_commit_sha: null;
  merged_by: null;
  allow_maintainer_edit: boolean;
  base: Base;
  head: Base;
  merge_base: string;
  due_date: null;
  created_at: Date;
  updated_at: Date;
  closed_at: null;
  pin_order: number;
}

export interface Base {
  label: string;
  ref: string;
  sha: string;
  repo_id: number;
  repo: Repository;
}
