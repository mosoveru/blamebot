export enum GitProviders {
  GITLAB = 'GITLAB',
  GITEA = 'GITEA',
}

export enum SecretTokenHeaders {
  GITLAB = 'x-gitlab-token',
  GITEA = 'authorization',
}

export enum EventHeaders {
  GITLAB = 'x-gitlab-event',
  GITEA = 'x-gitea-event',
}

export enum GitLabEventTypes {
  ISSUE = 'Issue Hook',
  MERGE_REQUEST = 'Merge Request Hook',
  PIPELINE = 'Pipeline Hook',
  NOTE = 'Note Hook',
  EMOJI = 'Emoji Hook',
}

export enum GiteaEventTypes {
  ISSUE = 'issues',
  ISSUE_NOTE = 'issue_comment',
  PULL_REQUEST = 'pull_request',
  PULL_REQUEST_REJECTED = 'pull_request_rejected',
  PULL_REQUEST_APPROVED = 'pull_request_approved',
  PULL_REQUEST_COMMENT = 'pull_request_comment',
}

export enum ObjectTypes {
  ISSUE = 'issue',
  REQUEST = 'request',
  PIPELINE = 'pipeline',
}
