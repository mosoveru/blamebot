export interface GitLabIssueEvent {
  object_kind: string;
  event_type: string;
  user: User;
  project: Project;
  object_attributes: ObjectAttributes;
  labels: Label[];
  changes: Changes;
  repository: Repository;
  assignees?: User[];
}

export interface Label {
  id: number;
  title: string;
  color: string;
  project_id: number;
  created_at: string;
  updated_at: string;
  template: boolean;
  description: null | string;
  type: string;
  group_id: null | number;
}

export interface User {
  id: number;
  name: string;
  username: string;
  avatar_url: string;
  email: string;
}

interface Changes {
  author_id?: AuthorID;
  created_at?: CreatedAt;
  description?: CreatedAt;
  id?: AuthorID;
  iid?: AuthorID;
  project_id?: AuthorID;
  title?: CreatedAt;
  updated_at?: CreatedAt;
  closed_at?: ClosedAt;
  state_id?: StateID;
  assignees?: Assignee;
  labels?: LabelChanges;
  due_date?: DueDate;
  total_time_spent?: TotalTimeSpend;
  time_change?: TimeChange;
  time_estimate?: TimeEstimate;
}

interface LabelChanges {
  previous: Label[];
  current: Label[];
}

interface Assignee {
  previous: User[];
  current: User[];
}

interface StateID {
  previous: number;
  current: number;
}

interface ClosedAt {
  previous: string | null;
  current: string;
}

interface AuthorID {
  previous: null;
  current: number;
}

interface CreatedAt {
  previous: null;
  current: string;
}

interface DueDate {
  previous: string | null;
  current: string | null;
}

interface TotalTimeSpend {
  previous: number;
  current: number;
}

interface TimeChange {
  previous: number;
  current: number;
}

interface TimeEstimate {
  previous: number;
  current: number;
}

interface ObjectAttributes {
  author_id: number;
  closed_at: null;
  confidential: boolean;
  created_at: string;
  description: string;
  discussion_locked: null;
  due_date: null | string;
  id: number;
  iid: number;
  last_edited_at: null;
  last_edited_by_id: null | number;
  milestone_id: null;
  moved_to_id: null;
  duplicated_to_id: null;
  project_id: number;
  relative_position: null | number;
  state_id: number;
  time_estimate: number;
  title: string;
  updated_at: string;
  updated_by_id: null | number;
  type: string;
  url: string;
  total_time_spent: number;
  time_change: number;
  human_total_time_spent: null | string;
  human_time_change: null | string;
  human_time_estimate: null | string;
  assignee_ids: number[];
  assignee_id: number | null;
  labels: Label[];
  state: string;
  severity: string;
  customer_relations_contacts: any[];
  action: string;
}

interface Project {
  id: number;
  name: string;
  description: null;
  web_url: string;
  avatar_url: null;
  git_ssh_url: string;
  git_http_url: string;
  namespace: string;
  visibility_level: number;
  path_with_namespace: string;
  default_branch: string;
  ci_config_path: null;
  homepage: string;
  url: string;
  ssh_url: string;
  http_url: string;
}

interface Repository {
  name: string;
  url: string;
  description: null | string;
  homepage: string;
}
