import { PaginationRequestDTO, PaginationResponseDTO } from '../common/pagination';

export class GetPoolsRequest extends PaginationRequestDTO {
  static url = '/cosmos/liquidity/v1beta1/pools';
}

export class GetPoolsResponse extends PaginationResponseDTO {
  pools: PoolInfo[];
}

export class GetPoolById {
  id: string;
  static url(id: string) {
    return `/cosmos/liquidity/v1beta1/pools/${id}`;
  }
}

export class GetPoolByIdResponse {
  pool: PoolInfo;
}

export class PoolInfo {
  id: string;
  type_id: number;
  reserve_coin_denoms: string[];
  reserve_account_address: string;
  pool_coin_denom: string;
}

export class PoolPrices {
  dxlnToUsdc: string;
  usdcToDxln: string;
}
