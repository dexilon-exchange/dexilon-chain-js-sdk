export enum BroadcastMode {
  BROADCAST_MODE_SYNC = 'BROADCAST_MODE_SYNC',
  BROADCAST_MODE_BLOCK = 'BROADCAST_MODE_BLOCK',
}

export class TxOptions {
  mode: BroadcastMode;
}
