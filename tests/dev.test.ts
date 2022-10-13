import { parseCoins } from '@cosmjs/amino';
import { ethers } from 'ethers';
import { BlockchainAPI } from '../src/api';
import { DexilonClient } from '../src/client';
import { Config } from '../src/interfaces/config';
import { getSignature } from './testUtils/ecdsa';
import { delay } from './testUtils/delay';
import { CosmosWalletData, getRandomCosmosAddress, getRandomEthAddress, randomInteger } from './testUtils/randomizer';
import { Coin } from '../src/interfaces/common/coin';

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
      blockchainApiUrl: 'http://localhost:3312',
      chainId: 'dexilonL2',
      bondDenom: 'stake',
    };

    // const config: Config = {
    //   blockchainApiUrl: 'https://dev2.dexilon-dev.xyz',
    //   chainId: 'dexilon-testnet',
    //   bondDenom: 'dxln',
    // };

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
    it('getBankBalances', async () => {
      const balances = await granterClient.getBankBalances(granteeWallet.address);

      expect(balances.length).toBeTruthy();
      expect(balances.filter((b) => b.denom === granterClient.bondDenom).length).toBeTruthy();
    });
  });

  describe('registration', () => {
    it('works', async () => {
      const signedMessage = `${granterWallet.address}`;
      const dataStructure = ['string'];
      const granterSinature = await getSignature(etherWallet, [signedMessage], dataStructure);
      const res = await granterClient.createAddressMapping(ethNetwork, ethAddress, signedMessage, granterSinature);
      // console.log(res);
      expect(res.tx_response.code).toBe(0);
      expect(res.tx_response.txhash).toBeTruthy();
      expect(res.tx_response.txhash.length).not.toBe(0);
    });

    it('should not allow rewrite address mapping!', async () => {
      const signedMessage = `${granterWallet.address}`;
      const dataStructure = ['string'];
      const granterSinature = await getSignature(etherWallet, [signedMessage], dataStructure);
      const res = await granterClient.createAddressMapping(ethNetwork, ethAddress, signedMessage, granterSinature);
      // console.log(res);
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

      // console.log(JSON.stringify(res, null, 2));

      expect(res.tx_response.code).toBe(0);
    });
  });

  describe('Liquidity Module', () => {
    xdescribe('depositAmm', () => {
      // TODO!
      it('works', async () => {
        const beforeBalances = await granteeClient.getBankBalances(granterWallet.address);

        const hasCoin = parseCoins(`100000000usdc, 100000000${granteeClient.bondDenom}`).sort((a, b) => {
          if (a.denom < b.denom) {
            return -1;
          }
          if (a.denom > b.denom) {
            return 1;
          }
          return 0;
        });
        console.log({ hasCoin });
        const res = await granteeClient.depositAmm(granterWallet.address, hasCoin[0], hasCoin[1]);

        console.log(JSON.stringify(res, null, 2));

        await delay(5000);
        const afterBalances = await granteeClient.getBankBalances(granterWallet.address);

        console.log(JSON.stringify({ beforeBalances, afterBalances }, null, 2));

        expect(res.tx_response.code).toBe(0);
      });
    });
    describe('swap', () => {
      it('works', async () => {
        const swap = async () => {
          const beforeBalances = await granterClient.getBankBalances(granterWallet.address);
          const beforeUsdc = beforeBalances.filter((c) => c.denom === 'usdc')[0];
          const beforeDxln = beforeBalances.filter((c) => c.denom === granteeClient.bondDenom)[0];

          // 11 usdc -> buy dxln
          const hasCoin: Coin = { amount: '1000000000000000000', denom: 'usdc' };
          const wishDenom = granteeClient.bondDenom;
          const { usdcToDxln } = await granteeClient.getDxlnUsdcPrice();

          const price = usdcToDxln.mul(1).toString();
          const res = await granteeClient.swap(granterWallet.address, wishDenom, hasCoin, price);

          console.log(JSON.stringify(res, null, 2));
          expect(res.tx_response.code).toBe(0);

          await delay(3000);
          const afterBalances = await granterClient.getBankBalances(granterWallet.address);
          const afterUsdc = afterBalances.filter((c) => c.denom === 'usdc')[0];
          const afterDxln = afterBalances.filter((c) => c.denom === granteeClient.bondDenom)[0];

          console.log({
            originalPrice: usdcToDxln.toString(),
            price,
            beforeBalances,
            afterBalances,
            diffUsdc: (BigInt(afterUsdc.amount) - BigInt(beforeUsdc.amount)).toString(),
            diffDxln: (BigInt(afterDxln.amount) - BigInt(beforeDxln.amount)).toString(),
          });

          expect(beforeDxln.amount).not.toEqual(afterDxln.amount);
          expect(beforeUsdc.amount).not.toEqual(afterUsdc.amount);
        };
        await swap();
        await swap();
      });
    });
  });
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
