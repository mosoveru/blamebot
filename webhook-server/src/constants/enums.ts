export enum GitProviders {
  GITLAB = 'GITLAB',
  GITEA = 'GITEA',
}

export enum SecretTokenHeaders {
  GITLAB = 'x-gitlab-token',
  GITEA = 'x-gitea-secret',
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
}

export enum ObjectTypes {
  ISSUE = 'issue',
  REQUEST = 'request',
  PIPELINE = 'pipeline',
}
