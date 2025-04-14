export enum EventType {
  GET_REQUEST = 'GET_REQUEST',
  GIT_SERVICE_TYPE_PARSED = 'GIT_SERVICE_TYPE_PARSED',
}

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
