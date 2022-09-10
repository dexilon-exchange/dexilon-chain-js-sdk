import axios, { AxiosError } from 'axios';
import {
  AccountInfoResponseDTO,
  BroadcastMode,
  PushTxRequestDTO,
  PushTxResponseDTO,
} from './interfaces/blockchain-api.dto';
import { Config } from './interfaces/config';

const PUSH_TX_ROUTE = '/cosmos/tx/v1beta1/txs';
const FAUCET_ROUTE = '/faucet';
const ACCOUNT_INFO_ROUTE = '/cosmos/auth/v1beta1/accounts/';

export class BlockchainAPI {
  private readonly url: string;

  constructor({blockchainApiHost, blockchainApiPort}: Config) {
    this.url = `http://${blockchainApiHost}:${blockchainApiPort}`;
  }

  async getAccountInfo(cosmosAddress: string): Promise<AccountInfoResponseDTO> {
    try {
      const { data } = await axios.get<string, any>(
        `${this.url}${ACCOUNT_INFO_ROUTE}${cosmosAddress}`,
      );
      return data;
    } catch (err: any) {
      throw this.handleAxiosError(err);
    }
  }

  async pushTx(txBytes: Uint8Array, mode: BroadcastMode = BroadcastMode.BROADCAST_MODE_BLOCK): Promise<PushTxResponseDTO> {
    try {
      const b64encoded = Buffer.from(txBytes).toString('base64');

      const data: PushTxRequestDTO = {
        tx_bytes: b64encoded,
        mode,
      };

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
