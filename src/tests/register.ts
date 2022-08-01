import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { BlockchainAPI } from '../api';
import { DexilonClient } from '../client';
import { Config } from '../interfaces/config';

function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function foo() {
  const mnemonic =
    'repair ceiling announce flat select mosquito tonight arrow opera narrow echo mesh lazy memory table ordinary sound woman pause embrace reward rain narrow ignore';
  // 'main silver swing silver clutch ethics tape wealth leopard slot napkin give vague win review taste unit engage genius chuckle demand lonely junior cheese';

  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic);

  const api = new BlockchainAPI('localhost', 3312);
  // const api = new BlockchainAPI('localhost', 1317);
  const config: Config = {
    blockchainApiHost: 'localhost',
    blockchainApiPort: 3312,
    chainId: 'dexilonL2',
    bondDenom: 'stake',
  };
  const tb = new DexilonClient(wallet, api, config);
  await tb.init();

  const res = await tb.createAddressMapping(
    'cosmos1nu5fj5r2f74rn52uckvucg2xptya7rvs4z2sa5',
    randomInteger(1, 1000),
    `0xETHADDRESS${randomInteger(123231, 12323133123)}`,
  );

  console.log(res);
  
}

foo();
