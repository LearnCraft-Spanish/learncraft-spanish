import type {
  BaseGroupSession,
  CreateGroupSessionCommand,
  DeleteGroupSessionCommand,
  GroupCallLookups,
  UpdateGroupSessionCommand,
} from '@learncraft-spanish/shared';

export interface GroupCallsPort {
  getGroupCallLookups: () => Promise<GroupCallLookups>;
  createGroupCall: (
    groupSession: CreateGroupSessionCommand,
  ) => Promise<BaseGroupSession>;
  updateGroupCall: (
    groupSession: UpdateGroupSessionCommand,
  ) => Promise<BaseGroupSession>;
  deleteGroupCall: (data: DeleteGroupSessionCommand) => Promise<void>;
}
