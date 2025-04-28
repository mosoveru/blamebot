import { ChangeParserData, ChangesParser, EventChanges } from '../../types';
import { GitLabIssueEvent } from '../../types/gitlab/issue-event';
import { GitLabEventTypes, RemoteGitServices } from '../../constants/enums';

export class IssueHookChangesParser implements ChangesParser<GitLabIssueEvent> {
  readonly gitProvider = RemoteGitServices.GITLAB;
  readonly eventType = GitLabEventTypes.ISSUE;

  parseEventChanges(data: ChangeParserData<GitLabIssueEvent>): EventChanges {
    return {
      changes: ['issue:assigned'],
    };
  }
}
