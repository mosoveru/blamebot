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
}

export enum ObjectTypes {
  ISSUE = 'issue',
  REQUEST = 'request',
  PIPELINE = 'pipeline',
}
