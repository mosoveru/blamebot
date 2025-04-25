import IssueHookNotificationComposer from './issue-hook';
import type { NotificationComposerConstructor } from '../../types';

export const GitLabNotificationComposers: NotificationComposerConstructor[] = [IssueHookNotificationComposer];
