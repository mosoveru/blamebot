import { GiteaIssuesEvent } from './issues';
import { GiteaIssueCommentEvent } from './issue_comment';

export type GiteaEvents = GiteaIssuesEvent | GiteaIssueCommentEvent;

export type AdditionalProperties = {
  assigned?: Array<NonNullable<GiteaEvents['issue']['assignee']>>;
  unassigned?: boolean;
  opened?: boolean;
};

export type CombinedProperties = {
  combinedProperties?: AdditionalProperties;
};

export type GiteaFlavor<C extends GiteaEvents> = C & CombinedProperties;
