import { Tx } from './interfaces/common';
import { Config } from './interfaces/config';

export class DexilonSDK {
  private config: Config;
  constructor(config: Config) {
    this.config = config;
  }


  async signAndBroadcast(tx: Tx) {
    // push tx to blockchain api
  }
}
