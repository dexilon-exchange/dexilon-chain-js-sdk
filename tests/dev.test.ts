import { ethers } from 'ethers';
import { BlockchainAPI } from '../src/api';
import { DexilonClient } from '../src/client';
import { Config } from '../src/interfaces/config';
import { delay } from './testUtils/delay';
import { getSignature } from './testUtils/ecdsa';
import {
  CosmosWalletData,
  getRandomCosmosAddress,
  getRandomEthAddress,
  randomInteger,
} from './testUtils/randomizer';

describe('full workflow test', () => {
  let granterClient: DexilonClient;
  let granteeClient: DexilonClient;
  let ethNetwork: number;
  let ethAddress: string;
  let etherWallet: ethers.Wallet;
  let granterWallet: CosmosWalletData;
  let granteeWallet: CosmosWalletData;

  beforeAll(async () => {
    granterWallet = await getRandomCosmosAddress();
    granteeWallet = await getRandomCosmosAddress();

    console.log({ granter: granterWallet.address, grantee: granteeWallet.address });

    const config: Config = {
      blockchainApiHost: 'localhost',
      blockchainApiPort: 3312,
      chainId: 'dexilonL2',
      bondDenom: 'stake',
    };

    // const config: Config = {
    //   blockchainApiHost: '88.198.205.192',
    //   blockchainApiPort: 4000,
    //   chainId: 'dexilon-testnet',
    //   bondDenom: 'dxln',
    // };

    const api = new BlockchainAPI(config);
    await api.faucet(granterWallet.address);
    await api.faucet(granteeWallet.address);

    granterClient = new DexilonClient(granterWallet.wallet, api, config);
    await granterClient.init();

    granteeClient = new DexilonClient(granteeWallet.wallet, api, config);
    await granteeClient.init();

    ethNetwork = randomInteger(1, 1000000);
    etherWallet = getRandomEthAddress();
    ethAddress = etherWallet.address;
  });

  describe('registration', () => {
    describe('createAddressMapping::constructive', () => {
      it('works', async () => {
        const signedMessage = `${granterWallet.address}`;
        const dataStructure = ['string'];
        const granterSinature = await getSignature(etherWallet, [signedMessage], dataStructure);
        const res = await granterClient.createAddressMapping(
          ethNetwork,
          ethAddress,
          signedMessage,
          granterSinature,
        );
        console.log(res);
        expect(res.tx_response.code).toBe(0);
        expect(res.tx_response.txhash).toBeTruthy();
        expect(res.tx_response.txhash.length).not.toBe(0);
      });
    });

    // xdescribe('createAddressMapping::destructive', () => {
    //   it('fails on :: mapping exists', async () => {
    //     await delay(2000);
    //     const res = await granterClient.createAddressMapping(ethNetwork, ethAddress);
    //     console.log(res);
    //     expect(res.tx_response.code).not.toBe(0);
    //     expect(res.tx_response.code).toBe(19);
    //   }, 10000);
    // });
  });
  // return;
  describe('grantPermissions', () => {
    it('works', async () => {
      await delay(2000);
      const dataStructure = ['string'];
      const timestamp = Math.floor((new Date().getTime() + 3 * 60 * 1000) / 1000.0);
      const signedMessage = `${timestamp}#${granteeWallet.address}`;
      const granterSinature = await getSignature(etherWallet, [signedMessage], dataStructure);

      const expirationTime = 15 * 60;
      const res = await granteeClient.grantPermissions(
        ethAddress,
        granterSinature,
        signedMessage,
        expirationTime,
      );

      console.log(res);

      expect(res.tx_response.code).toBe(0);
    });
  });
// return;
  describe('Trading Module', () => {
    describe('deposit', () => {
      it('works', async () => {
        await delay(2000);

        const balance = '1';
        const asset = 'usdc';
        const res = await granteeClient.depositTrading(granterWallet.address, balance, asset);
        console.log(res);

        expect(res.tx_response.code).toBe(0);
      });
    });
  });

  describe('WithdrawModule', () => {
    it('works', async () => {
      await delay(2000);

      const amount = '1000000000000';
      const denom = 'usdc';
      const chainId = ethNetwork;
      const res = await granteeClient.withdraw(granterWallet.address, denom, amount, chainId);
      console.log(res);

      expect(res.tx_response.code).toBe(0);
    });
  });

  describe('revokePermissions', () => {
    it('works', async () => {
      await delay(2000);
      const dataStructure = ['string'];
      const timestamp = Math.floor((new Date().getTime() + 3 * 60 * 1000) / 1000.0);

      const signedMessage = `${timestamp}#${granteeWallet.address}`;
      const granterSinature = await getSignature(etherWallet, [signedMessage], dataStructure);

      const res = await granterClient.revokePermissions(ethAddress, granterSinature, signedMessage);

      console.log(res);

      expect(res.tx_response.code).toBe(0);
    });
  });
});
