import { Issue, Repository, Sender } from './common';
import { PullRequest } from './pull_request';

export type GiteaIssueCommentEvent = {
  action: 'created' | string;
  issue: Issue;
  comment: Comment;
  repository: Repository;
  sender: Sender;
} & IsPullRequest;

type IsPullRequest = WithPullRequest | WithoutPullRequest;

type WithPullRequest = {
  is_pull: true;
  pull_request: PullRequest;
};

type WithoutPullRequest = {
  is_pull: false;
};

export interface Comment {
  id: number;
  html_url: string;
  pull_request_url: string;
  issue_url: string;
  user: Sender;
  original_author: string;
  original_author_id: number;
  body: string;
  assets: any[];
  created_at: string;
  updated_at: string;
}
