import { GiteaIssuesEvent } from './issues';
import { GiteaIssueCommentEvent } from './issue_comment';
import { GiteaPullRequestEvent } from './pull_request';
import { Sender } from './common';

export type GiteaEvents = GiteaIssuesEvent | GiteaIssueCommentEvent | GiteaPullRequestEvent;
export type GiteaEventsWithIssue = GiteaIssuesEvent | GiteaIssueCommentEvent;

export type AdditionalProperties = {
  assigned?: Array<NonNullable<GiteaEventsWithIssue['issue']['assignee']>>;
  unassigned?: boolean;
  opened?: boolean;
  addedReviewers?: Array<NonNullable<Sender>>;
  deletedReviewers?: Array<NonNullable<Sender>>;
};

export type CombinedProperties = {
  combinedProperties?: AdditionalProperties;
};

export type GiteaFlavor<C extends GiteaEvents> = C & CombinedProperties;
