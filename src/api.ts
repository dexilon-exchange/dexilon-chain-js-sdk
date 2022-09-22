import axios, { AxiosError } from 'axios';
import { ACCOUNT_INFO_ROUTE, PUSH_TX_ROUTE, FAUCET_ROUTE } from './interfaces/query/routes';
import { AccountInfoResponseDTO, PushTxRequestDTO, PushTxResponseDTO } from './interfaces/blockchain-api.dto';
import { Config } from './interfaces/config';
import { GetPoolById, GetPoolsRequest } from './interfaces/query';

export class BlockchainAPI {
  private readonly url: string;

  constructor({ blockchainApiHost, blockchainApiPort }: Config) {
    this.url = `https://${blockchainApiHost}:${blockchainApiPort}`;
  }

  // accounts

  async getAccountInfo(cosmosAddress: string): Promise<AccountInfoResponseDTO> {
    try {
      const { data } = await axios.get<string, any>(`${this.url}${ACCOUNT_INFO_ROUTE}${cosmosAddress}`);
      return data;
    } catch (err: any) {
      throw this.handleAxiosError(err);
    }
  }

  // liquidity
  async getPools({ key, offset, limit, countTotal, reverse }: GetPoolsRequest): Promise<any> {
    try {
      const { data } = await axios.get(`${this.url}${GetPoolsRequest.url}`, {
        params: {
          'pagination.key': key,
          'pagination.offset': offset,
          'pagination.limit': limit,
          'pagination.count_total': countTotal,
          'pagination.reverse': reverse,
        },
      });
      return data;
    } catch (err: any) {
      throw this.handleAxiosError(err);
    }
  }

  async getPoolById({ id }: GetPoolById): Promise<any> {
    try {
      const { data } = await axios.get(`${this.url}${GetPoolById.url(id)}`);
      return data;
    } catch (err: any) {
      throw this.handleAxiosError(err);
    }
  }

  // async getDxlnUsdcPrice(): Promise<any> {
  //   try {
  //     const poolData = await this.getPoolById({ id: '1' });
  //   } catch (err: any) {
  //     throw this.handleAxiosError(err);
  //   }
  // }

  async pushTx(data: PushTxRequestDTO): Promise<PushTxResponseDTO> {
    try {
      const { data: resp } = await axios.post(`${this.url}${PUSH_TX_ROUTE}`, data);
      return resp;
    } catch (err: any) {
      throw this.handleAxiosError(err);
    }
  }

  async faucet(address: string) {
    try {
      const data = {
        address,
      };

      const { data: resp } = await axios.post(`${this.url}${FAUCET_ROUTE}`, data, {
        timeout: 10000,
      });
      return resp;
    } catch (err: any) {
      throw this.handleAxiosError(err);
    }
  }

  handleAxiosError(error: AxiosError) {
    if (error.response?.data) {
      throw error.response?.data;
    } else {
      throw error;
    }
  }
}
