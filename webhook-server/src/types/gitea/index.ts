import { GiteaIssuesEvent } from './issues';

export type GiteaEvents = GiteaIssuesEvent;

type CombinedPropertyForAssignedAction = {
  added: Array<GiteaEvents['issue']['assignee']>;
};

export type AdditionalProperties = {
  assigned?: CombinedPropertyForAssignedAction;
  unassigned?: boolean;
};

export type CombinedProperties = {
  combinedProperties?: AdditionalProperties;
};

export type GiteaFlavor<C extends GiteaEvents> = C & CombinedProperties;
