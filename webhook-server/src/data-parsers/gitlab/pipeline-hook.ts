import { DataForParsingChanges, DataParser, EventChanges, EventPayload, PipelineChanges } from '../../types';
import { GitLabPipelineEvent } from '../../types/gitlab';
import { GitLabEventTypes, GitProviders, ObjectTypes } from '../../constants/enums';

type ChangesForPipeline = EventChanges<ObjectTypes.PIPELINE>;

export class PipelineHookDataParser implements DataParser<GitLabPipelineEvent> {
  readonly eventType = GitLabEventTypes.PIPELINE;
  readonly gitProvider = GitProviders.GITLAB;
  readonly objectType = ObjectTypes.PIPELINE as const;

  private _pipelineChanges: PipelineChanges | null;
  private _eventPayload: GitLabPipelineEvent | null;

  parseProjectInfo(eventPayload: EventPayload<GitLabPipelineEvent>) {
    return {
      instanceId: eventPayload.instanceId,
      projectId: String(eventPayload.eventPayload.project.id),
      name: eventPayload.eventPayload.project.name,
      projectUrl: eventPayload.eventPayload.project.web_url,
    };
  }

  parseObservableObjectInfo(eventPayload: EventPayload<GitLabPipelineEvent>) {
    return {
      instanceId: eventPayload.instanceId,
      objectId: String(eventPayload.eventPayload.object_attributes.id),
      projectId: String(eventPayload.eventPayload.project.id),
      objectType: ObjectTypes.PIPELINE,
      objectUrl: eventPayload.eventPayload.object_attributes.url,
    };
  }

  parseEventMembersIds(serviceType: EventPayload<GitLabPipelineEvent>) {
    const objectMembersIdsSet = new Set<number>();
    const objectMembersIds: number[] = [];
    for (const build of serviceType.eventPayload.builds) {
      objectMembersIdsSet.add(build.user.id);
    }
    objectMembersIdsSet.add(serviceType.eventPayload.user.id);
    for (const id of objectMembersIdsSet) {
      objectMembersIds.push(id);
    }
    return objectMembersIds;
  }

  parseEventInitiatorId(_: EventPayload<GitLabPipelineEvent>): string {
    // We won't exclude initiator id in this event type.
    // So, we'll return impossible value for user id
    return '-1';
  }

  parseEventChanges({ eventPayload }: DataForParsingChanges<GitLabPipelineEvent>): ChangesForPipeline[] {
    this.eventPayload = eventPayload;
    const changes = this.parseChanges();
    if (!changes) {
      return [];
    }
    const commonChanges = {
      objectType: this.objectType,
      objectUrl: eventPayload.object_attributes.url,
      objectId: String(eventPayload.object_attributes.id),
      projectUrl: eventPayload.project.web_url,
      projectName: eventPayload.project.name,
      changes: {
        ...changes,
      },
      isCommon: true,
    };
    this.resetContext();
    return [commonChanges];
  }

  private parseChanges() {
    const changes: PipelineChanges = {
      isPipelinePassed: false,
      isPipelineFailed: false,
      isPipelinePending: false,
    };
    const eventPayload = this.eventPayload;
    if (eventPayload.object_attributes.status === 'pending') {
      changes.isPipelinePending = true;
      this.pipelineChanges = changes;
      return changes;
    }
    if (eventPayload.object_attributes.status === 'failed') {
      changes.isPipelineFailed = true;
      this.pipelineChanges = changes;
      return changes;
    }
    if (eventPayload.object_attributes.status === 'success') {
      changes.isPipelinePassed = true;
      this.pipelineChanges = changes;
      return changes;
    }
    return null;
  }

  private get eventPayload() {
    if (this._eventPayload === null) {
      throw new TypeError(
        'Event Payload was not provided within Issue Hook Data Parser class. Did you forget to set the event payload value?',
      );
    }
    return this._eventPayload;
  }

  private get requestChanges() {
    if (this._pipelineChanges === null) {
      throw new TypeError(
        'Pipeline Changes object was not set within Merge Request Hook Data Parser class. Did you forget to set the initial object to the property Pipeline Changes?',
      );
    }
    return this._pipelineChanges;
  }

  private set eventPayload(payload: GitLabPipelineEvent) {
    this._eventPayload = payload;
  }

  private set pipelineChanges(changes: PipelineChanges) {
    this._pipelineChanges = changes;
  }

  private resetContext() {
    this._eventPayload = null;
    this._pipelineChanges = null;
  }
}
