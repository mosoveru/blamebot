export enum RemoteGitServices {
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
}

export enum ObjectTypes {
  ISSUE = 'issue',
  REQUEST = 'request',
}
