export interface GiteaIssuesEvent {
  action: 'closed' | 'reopened' | 'assigned' | 'unassigned' | string;
  number: number;
  issue: Issue;
  repository: EventPayloadRepository;
  sender: Sender;
  commit_id: string;
}

export interface Issue {
  id: number;
  url: string;
  html_url: string;
  number: number;
  user: Sender;
  original_author: string;
  original_author_id: number;
  title: string;
  body: string;
  ref: string;
  assets: any[];
  labels: any[];
  milestone: null;
  assignee: Sender;
  assignees: Sender[];
  state: string;
  is_locked: boolean;
  comments: number;
  created_at: Date;
  updated_at: Date;
  closed_at: Date;
  due_date: null;
  pull_request: null;
  repository: IssueRepository;
  pin_order: number;
}

export interface IssueRepository {
  id: number;
  name: string;
  owner: string;
  full_name: string;
}

export interface Sender {
  id: number;
  login: string;
  login_name: string;
  source_id: number;
  full_name: string;
  email: string;
  avatar_url: string;
  html_url: string;
  language: string;
  is_admin: boolean;
  last_login: Date;
  created: Date;
  restricted: boolean;
  active: boolean;
  prohibit_login: boolean;
  location: string;
  website: string;
  description: string;
  visibility: string;
  followers_count: number;
  following_count: number;
  starred_repos_count: number;
  username: string;
}

export interface EventPayloadRepository {
  id: number;
  owner: Sender;
  name: string;
  full_name: string;
  description: string;
  empty: boolean;
  private: boolean;
  fork: boolean;
  template: boolean;
  parent: null;
  mirror: boolean;
  size: number;
  language: string;
  languages_url: string;
  html_url: string;
  url: string;
  link: string;
  ssh_url: string;
  clone_url: string;
  original_url: string;
  website: string;
  stars_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  open_pr_counter: number;
  release_counter: number;
  default_branch: string;
  archived: boolean;
  created_at: Date;
  updated_at: Date;
  archived_at: Date;
  permissions: Permissions;
  has_issues: boolean;
  internal_tracker: InternalTracker;
  has_wiki: boolean;
  has_pull_requests: boolean;
  has_projects: boolean;
  projects_mode: string;
  has_releases: boolean;
  has_packages: boolean;
  has_actions: boolean;
  ignore_whitespace_conflicts: boolean;
  allow_merge_commits: boolean;
  allow_rebase: boolean;
  allow_rebase_explicit: boolean;
  allow_squash_merge: boolean;
  allow_fast_forward_only_merge: boolean;
  allow_rebase_update: boolean;
  default_delete_branch_after_merge: boolean;
  default_merge_style: string;
  default_allow_maintainer_edit: boolean;
  avatar_url: string;
  internal: boolean;
  mirror_interval: string;
  object_format_name: string;
  mirror_updated: Date;
  repo_transfer: null;
  topics: any[];
  licenses: null;
}

export interface InternalTracker {
  enable_time_tracker: boolean;
  allow_only_contributors_to_track_time: boolean;
  enable_issue_dependencies: boolean;
}

export interface Permissions {
  admin: boolean;
  push: boolean;
  pull: boolean;
}
