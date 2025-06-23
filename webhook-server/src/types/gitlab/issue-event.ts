import { Label, Project, Repository, User } from './common';

export interface GitLabIssueEvent {
  object_kind: 'issue';
  event_type: 'issue';
  user: User;
  project: Project;
  object_attributes: ObjectAttributes;
  labels: Label[];
  changes: Changes;
  repository: Repository;
  assignees?: User[];
}

export interface ObjectAttributes {
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
  action: 'close' | 'update' | 'reopen';
}

interface Changes {
  author_id?: {
    previous: null;
    current: number;
  };
  created_at?: {
    previous: null;
    current: string;
  };
  description?: {
    previous: null;
    current: string;
  };
  id?: {
    previous: null;
    current: number;
  };
  iid?: {
    previous: null;
    current: number;
  };
  project_id?: {
    previous: null;
    current: number;
  };
  title?: {
    previous: null;
    current: string;
  };
  updated_at?: {
    previous: null;
    current: string;
  };
  closed_at?: {
    previous: string | null;
    current: string;
  };
  state_id?: {
    previous: number;
    current: number;
  };
  assignees?: {
    previous: User[];
    current: User[];
  };
  labels?: {
    previous: Label[];
    current: Label[];
  };
  due_date?: {
    previous: string | null;
    current: string | null;
  };
  total_time_spent?: {
    previous: number;
    current: number;
  };
  time_change?: {
    previous: number;
    current: number;
  };
  time_estimate?: {
    previous: number;
    current: number;
  };
}
