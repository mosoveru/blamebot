import { Issue, Repository, Sender } from './common';

export interface GiteaIssueCommentEvent {
  action: 'created' | string;
  issue: Issue;
  comment: Comment;
  repository: Repository;
  sender: Sender;
  is_pull: boolean;
}

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
