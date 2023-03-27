import { Coin } from '@cosmjs/proto-signing';
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

export class GetPoolByIdResponseDto {
  pool: PoolInfo;
}

export class PoolInfo {
  id: string;
  type_id: number;
  reserve_coin_denoms: string[];
  reserve_account_address: string;
  pool_coin_denom: string;
}
export class BankBalancesResponseDTO {
  status: string;
  data: BankBalances;
}
export class BankBalances {
  balances: Coin[];
  pagination: any;
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

export class GetMirrorAddressMappingResponseDTO {
  chainId: number;
  address: string;
  cosmosAddress: string;
}

class Mapping {
  chainId: number;
  address: string;
}
export class GetAddressMappingResponseDTO {
  addressMapping: {
    cosmosAddress: string;
    mappings: Mapping[];
  };
}

export class GetFeeTierResponseDTO {
  account: string;
  tradingVolume: string;
  tier: TierData;
  coinsDiscount: CoinsDiscountData;
}

export class CoinsDiscountData {
  conditionThreshold: string;
  discountFeePercentage: number;
}

export class TradingData {
  conditionThreshold: string;
  takerFeePercentage: number;
  makerRebatePercentage: number;
}

export class TierData {
  title: string;
  Trading: TradingData;
}
