export type GitLabIssueEvent = {
  object_kind: 'issue';
  event_type: 'issue';
  user: {
    id: number;
    name: string;
    username: string;
    avatar_url: string;
    email: string;
  };
  project: {
    id: number;
    name: string;
    description: string;
    web_url: string;
    avatar_url: string | null;
    git_ssh_url: string;
    git_http_url: string;
    namespace: string;
    visibility_level: number;
    path_with_namespace: string;
    default_branch: string;
    ci_config_path: string | null;
    homepage: string;
    url: string;
    ssh_url: string;
    http_url: string;
  };
  object_attributes: {
    id: number;
    title: string;
    assignee_ids: number[];
    assignee_id: number;
    author_id: number;
    project_id: number;
    created_at: string;
    updated_at: string;
    updated_by_id: number;
    last_edited_at: string | null;
    last_edited_by_id: number | null;
    relative_position: number;
    description: string;
    milestone_id: number | null;
    state_id: number;
    confidential: boolean;
    discussion_locked: boolean;
    due_date: string | null;
    moved_to_id: number | null;
    duplicated_to_id: number | null;
    time_estimate: number;
    total_time_spent: number;
    time_change: number;
    human_total_time_spent: string | null;
    human_time_estimate: string | null;
    human_time_change: string | null;
    weight: number | null;
    health_status: 'at_risk' | string;
    type: 'Issue' | string;
    iid: number;
    url: string;
    state: string;
    action: string;
    severity: string;
    escalation_status: string;
    escalation_policy: {
      id: number;
      name: string;
    };
    labels: Label[];
  };
  repository: {
    name: string;
    url: string;
    description: string;
    homepage: string;
  };
  assignees: Assignee[];
  assignee: Assignee;
  labels: Label[];
  changes: {
    updated_by_id: {
      previous: number | null;
      current: number;
    };
    updated_at: {
      previous: string;
      current: string;
    };
    labels: {
      previous: Label[];
      current: Label[];
    };
  };
};

type Assignee = {
  name: string;
  username: string;
  avatar_url: string;
};

type Label = {
  id: number;
  title: string;
  color: string;
  project_id: number;
  created_at: string;
  updated_at: string;
  template: boolean;
  description: string;
  type: string;
  group_id: number;
};
