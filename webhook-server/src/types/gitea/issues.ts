import { Issue, Repository, Sender } from './common';

export interface GiteaIssuesEvent {
  action: 'opened' | 'closed' | 'reopened' | 'assigned' | 'unassigned' | 'label_updated' | string;
  number: number;
  changes: {
    title: {
      from: string;
    };
    body: {
      from: string;
    };
  };
  issue: Issue;
  repository: Repository;
  sender: Sender;
  commit_id: string;
}
