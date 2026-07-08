import type {
  BasePrivateCall,
  CreatePrivateCallCommand,
  DeletePrivateCallCommand,
  PrivateCallLookups,
  UpdatePrivateCallCommand,
} from '@learncraft-spanish/shared';

export interface PrivateCallsPort {
  getPrivateCallLookups: () => Promise<PrivateCallLookups>;
  createPrivateCall: (
    privateCall: CreatePrivateCallCommand,
  ) => Promise<BasePrivateCall>;
  updatePrivateCall: (
    privateCall: UpdatePrivateCallCommand,
  ) => Promise<BasePrivateCall>;
  deletePrivateCall: (data: DeletePrivateCallCommand) => Promise<void>;
}
