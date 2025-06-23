import { Commit, Project, User } from './common';

export interface GitLabPipelineEvent {
  object_kind: 'pipeline';
  object_attributes: ObjectAttributes;
  merge_request: MergeRequest;
  user: User;
  project: Project;
  commit: Commit;
  builds: Build[];
}

interface Build {
  id: number;
  stage: string;
  name: string;
  status: string;
  created_at: string;
  started_at: null | string;
  finished_at: null | string;
  duration: number | null;
  queued_duration: number | null;
  failure_reason: null;
  when: string;
  manual: boolean;
  allow_failure: boolean;
  user: User;
  runner: Runner | null;
  artifacts_file: ArtifactsFile;
  environment: {
    name: string;
    action: string;
    deployment_tier: string;
  };
}

interface ArtifactsFile {
  filename: null;
  size: null;
}

interface Runner {
  id: number;
  description: string;
  runner_type: string;
  active: boolean;
  is_shared: boolean;
  tags: string[];
}

interface MergeRequest {
  id: number;
  iid: number;
  title: string;
  source_branch: string;
  source_project_id: number;
  target_branch: string;
  target_project_id: number;
  state: string;
  merge_status: string;
  detailed_merge_status: string;
  url: string;
}

interface ObjectAttributes {
  id: number;
  iid: number;
  name: null;
  ref: string;
  tag: boolean;
  sha: string;
  before_sha: string;
  source: string;
  status: 'running' | 'pending' | 'success' | 'failed';
  detailed_status: string;
  stages: string[];
  created_at: string;
  finished_at: null | string;
  duration: number | null;
  queued_duration: number | null;
  variables: any[];
  url: string;
}
