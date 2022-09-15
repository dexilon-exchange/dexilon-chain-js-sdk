import { BroadcastMode } from './common/client';

export class PushTxRequestDTO {
  tx_bytes!: string;
  mode!: BroadcastMode;
}

export class PushTxResponseDTO {
  tx_response: {
    height: string;
    txhash: string;
    codespace: string;
    code: number;
    data: string;
    raw_log: string;
    logs: Array<any>;
    info: string;
    gas_wanted: string;
    gas_used: string;
    tx: any;
    timestamp: string;
    events: Array<any>;
  };
}

export class AccountInfoResponseDTO {
  account: AccountInfo;
}

class AccountInfo {
  '@type': string;
  address: string;
  pub_key: PubKey;
  account_number: string;
  sequence: string;
}

class PubKey {
  '@type': string;
  key: string;
}
