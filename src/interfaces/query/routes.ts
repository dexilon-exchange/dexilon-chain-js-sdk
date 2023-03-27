export const ACCOUNT_INFO_ROUTE = '/cosmos/auth/v1beta1/accounts/';
export const BANK_BALANCES_ROUTE = '/cosmos/bank/v1beta1/balances/';
export const PUSH_TX_ROUTE = '/cosmos/tx/v1beta1/txs';
export const FAUCET_ROUTE = '/faucet';
export const DEXILON_ADDRESS_MAPPING_ROUTE = (address: string) =>
  `dexilon-exchange/dexilonl2/registration/address_mapping/${address}`;
export const DEXILON_MIRROR_ADDRESS_MAPPING_ROUTE = (chainId: string | number, address: string) =>
  `dexilon-exchange/dexilonl2/registration/address_mapping/mirror/${chainId}/${address}`;
export const DEXILON_GET_FEE_TIER = (address: string) => `dexilon-exchange/dexilonL2/trading/fee_tier/${address}`;
