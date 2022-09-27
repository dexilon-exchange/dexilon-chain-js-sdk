import { ethers } from 'ethers';
import { BlockchainAPI } from '../src/api';
import { DexilonClient } from '../src/client';
import { Config } from '../src/interfaces/config';
import { getSignature } from './testUtils/ecdsa';
import { CosmosWalletData, getRandomCosmosAddress, getRandomEthAddress, randomInteger } from './testUtils/randomizer';

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

    // const config: Config = {
    //   blockchainApiUrl: 'http://localhost:3312',
    //   chainId: 'dexilonL2',
    //   bondDenom: 'stake',
    // };

    const config: Config = {
      blockchainApiUrl: 'https://dev2.dexilon-dev.xyz',
      chainId: 'dexilon-testnet',
      bondDenom: 'dxln',
    };

    const api = new BlockchainAPI(config);

    await Promise.all([api.faucet(granterWallet.address), api.faucet(granteeWallet.address)]);

    granterClient = new DexilonClient(granterWallet.wallet, api, config);
    await granterClient.init();

    granteeClient = new DexilonClient(granteeWallet.wallet, api, config);
    await granteeClient.init();

    ethNetwork = randomInteger(1, 1000000);
    etherWallet = getRandomEthAddress();
    ethAddress = etherWallet.address;
  });

  describe('getters', () => {
    it('getBankBalances', async () => {});
  });

  describe('registration', () => {
    it('works', async () => {
      const signedMessage = `${granterWallet.address}`;
      const dataStructure = ['string'];
      const granterSinature = await getSignature(etherWallet, [signedMessage], dataStructure);
      const res = await granterClient.createAddressMapping(ethNetwork, ethAddress, signedMessage, granterSinature);
      console.log(res);
      expect(res.tx_response.code).toBe(0);
      expect(res.tx_response.txhash).toBeTruthy();
      expect(res.tx_response.txhash.length).not.toBe(0);
    });

    it('should not allow rewrite address mapping!', async () => {
      const signedMessage = `${granterWallet.address}`;
      const dataStructure = ['string'];
      const granterSinature = await getSignature(etherWallet, [signedMessage], dataStructure);
      const res = await granterClient.createAddressMapping(ethNetwork, ethAddress, signedMessage, granterSinature);
      console.log(res);
      expect(res.tx_response.code).not.toBe(0);
    });
  });

  describe('grantPermissions', () => {
    it('works', async () => {
      const dataStructure = ['string'];
      const timestamp = Math.floor((new Date().getTime() + 3 * 60 * 1000) / 1000.0);
      const signedMessage = `${timestamp}#${granteeWallet.address}`;
      const granterSinature = await getSignature(etherWallet, [signedMessage], dataStructure);

      const expirationTime = 15 * 60;
      const res = await granteeClient.grantPermissions(ethAddress, granterSinature, signedMessage, expirationTime);

      console.log(JSON.stringify(res, null, 2));

      expect(res.tx_response.code).toBe(0);
    });
  });

  // describe('Liquidity Module', () => {
  //   describe('swap', () => {
  //     it('works', async () => {
  //       const { dxlnToUsdc } = await granterClient.getDxlnUsdcPrice();
  //       const amount = 100;
  //       const res = await granterClient.swap(granterWallet.address, amount.toString(), config.bondDenom, 'usdc', usdcToDxln);
  //       console.log(JSON.stringify(res, null, 2));
  //       expect(res.tx_response.code).toBe(0);
  //     });
  //   });
  // });
  // return;

  describe('Trading Module', () => {
    it('works', async () => {
      const balance = '1';
      const asset = 'usdc';
      const res = await granteeClient.depositTrading(granterWallet.address, balance, asset);
      console.log(JSON.stringify(res, null, 2));

      expect(res.tx_response.code).toBe(0);
    });
  });

  describe('WithdrawModule', () => {
    it('works', async () => {
      const amount = '1000000000000';
      const denom = 'usdc';
      const chainId = ethNetwork;
      const res = await granteeClient.withdraw(granterWallet.address, denom, amount, chainId);
      console.log(JSON.stringify(res, null, 2));

      expect(res.tx_response.code).toBe(0);
    });
  });

  describe('revokePermissions', () => {
    it('works', async () => {
      const dataStructure = ['string'];
      const timestamp = Math.floor((new Date().getTime() + 3 * 60 * 1000) / 1000.0);

      const signedMessage = `${timestamp}#${granteeWallet.address}`;
      const granterSinature = await getSignature(etherWallet, [signedMessage], dataStructure);

      const res = await granterClient.revokePermissions(ethAddress, granterSinature, signedMessage);

      console.log(JSON.stringify(res, null, 2));

      expect(res.tx_response.code).toBe(0);
    });
  });
});
