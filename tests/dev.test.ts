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
  const config: Config = {
    blockchainApiUrl: 'https://proxy.dev2.dexilon.io',
    chainId: 'dexilon-dev2',
    bondDenom: 'dxln',
  };

  beforeAll(async () => {
    try {
      granterWallet = await getRandomCosmosAddress();
      granteeWallet = await getRandomCosmosAddress();

      console.log({ granter: granterWallet.address, grantee: granteeWallet.address });

      const api = new BlockchainAPI(config);

      await Promise.all([api.faucet(granterWallet.address), api.faucet(granteeWallet.address)]);

      granterClient = new DexilonClient(granterWallet.wallet, api, config);
      await granterClient.init();

      granteeClient = new DexilonClient(granteeWallet.wallet, api, config);
      await granteeClient.init();

      ethNetwork = randomInteger(1, 1000000);
      etherWallet = getRandomEthAddress();
      ethAddress = etherWallet.address;
    } catch (err: any) {
      console.log(err);
    }
  });

  describe('getters', () => {
    it('getBankBalances', async () => {
      const balances = await granterClient.getBankBalances(granteeWallet.address);

      expect(balances.length).toBeTruthy();
      expect(balances.filter((b) => b.denom === granterClient.bondDenom).length).toBeTruthy();
    });

    describe('Fee Tiers and Trading volume 30d', () => {
      it('getFeeTier works', async () => {
        const res = await granteeClient.getFeeTier('cosmos1h5rak6zxnges6t7sfwlgssehp507gjk9tggdc6');
        expect(res.account).toBeTruthy();
        expect(res.coinsDiscount.conditionThreshold).not.toBe(null);
        expect(res.coinsDiscount.conditionThreshold).not.toBe('');
        expect(res.coinsDiscount.discountFeePercentage).not.toBe(null);
        expect(res.tier.Trading).toBeTruthy();
        expect(res.tier.title).toBeTruthy();
        expect(res.tradingVolume).toBeTruthy();
      });

      it('getFeeTier works', async () => {
        const res = await granteeClient.get30dTradingVolume('cosmos1h5rak6zxnges6t7sfwlgssehp507gjk9tggdc6');
        expect(res).toBeTruthy();
      });
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

    it('have to find the mappings correctly', async () => {
      const mapping = await DexilonClient.getAddressMapping(config.blockchainApiUrl, granterWallet.address);
      expect(mapping.addressMapping.cosmosAddress).toBe(granterWallet.address);
      expect(mapping.addressMapping.mappings[0].address).toBe(etherWallet.address);
      expect(mapping.addressMapping.mappings[0].chainId).toBe(ethNetwork);

      const mirrorMapping = await DexilonClient.getMirrorAddressMapping(
        config.blockchainApiUrl,
        ethNetwork,
        ethAddress,
      );
      expect(mirrorMapping.cosmosAddress).toBe(granterWallet.address);
      expect(mirrorMapping.address).toBe(etherWallet.address);
      expect(mirrorMapping.chainId).toBe(ethNetwork);
    });

    it('should not allow rewrite address mapping for cosmosAddress!', async () => {
      const signedMessage = `${granterWallet.address}`;
      const dataStructure = ['string'];
      const granterSinature = await getSignature(etherWallet, [signedMessage], dataStructure);
      const res = await granterClient.createAddressMapping(ethNetwork, ethAddress, signedMessage, granterSinature);
      // console.log(res);
      expect(res.tx_response.code).not.toBe(0);
    });

    it('should not allow rewrite address mapping for ETH address!', async () => {
      const signedMessage = (await getRandomCosmosAddress()).address;
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
      const res = await granteeClient.grantPermissions(
        ethAddress,
        granterSinature,
        signedMessage,
        expirationTime,
        ethNetwork,
      );

      expect(res.tx_response.code).toBe(0);
    });
  });
  xdescribe('Liquidity Module', () => {
    xdescribe('depositAmm', () => {
      // TODO!
      it('works', async () => {
        const beforeBalances = await granteeClient.getBankBalances(granterWallet.address);

        const hasCoin = parseCoins(`100000000usdt, 100000000${granteeClient.bondDenom}`).sort((a, b) => {
          if (a.denom < b.denom) {
            return -1;
          }
          if (a.denom > b.denom) {
            return 1;
          }
          return 0;
        });
        const res = await granteeClient.depositAmm(granterWallet.address, hasCoin[0], hasCoin[1]);

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
          const beforeUsdt = beforeBalances.filter((c) => c.denom === 'usdt')[0];
          const beforeDxln = beforeBalances.filter((c) => c.denom === granteeClient.bondDenom)[0];

          // 11 usdt -> buy dxln
          const hasCoin: Coin = { amount: '1000000000000000000', denom: 'usdt' };
          const wishDenom = granteeClient.bondDenom;
          const { usdtToDxln } = await granteeClient.getDxlnUsdtPrice();

          const price = usdtToDxln.mul(1).toString();
          const res = await granteeClient.swap(granterWallet.address, wishDenom, hasCoin, price);

          console.log(JSON.stringify(res, null, 2));
          expect(res.tx_response.code).toBe(0);

          await delay(3000);
          const afterBalances = await granterClient.getBankBalances(granterWallet.address);
          const afterUsdt = afterBalances.filter((c) => c.denom === 'usdt')[0];
          const afterDxln = afterBalances.filter((c) => c.denom === granteeClient.bondDenom)[0];

          console.log({
            originalPrice: usdtToDxln.toString(),
            price,
            beforeBalances,
            afterBalances,
            diffUsdt: (BigInt(afterUsdt.amount) - BigInt(beforeUsdt.amount)).toString(),
            diffDxln: (BigInt(afterDxln.amount) - BigInt(beforeDxln.amount)).toString(),
          });

          expect(beforeDxln.amount).not.toEqual(afterDxln.amount);
          expect(beforeUsdt.amount).not.toEqual(afterUsdt.amount);
        };
        await swap();
        await swap();
      });
    });
  });

  xdescribe('Trading Module', () => {
    it('works', async () => {
      const balance = '1';
      const asset = 'usdt';
      const res = await granteeClient.depositTrading(granterWallet.address, balance, asset);

      expect(res.tx_response.code).toBe(0);
    });
  });

  xdescribe('WithdrawModule', () => {
    it('works', async () => {
      const amount = '1000000000000';
      const denom = 'usdt';
      const chainId = ethNetwork;
      const res = await granteeClient.withdraw(granterWallet.address, denom, amount, chainId);

      expect(res.tx_response.code).toBe(0);
    });
  });

  describe('revokePermissions', () => {
    it('works', async () => {
      const dataStructure = ['string'];
      const timestamp = Math.floor((new Date().getTime() + 3 * 60 * 1000) / 1000.0);

      const signedMessage = `${timestamp}#${granteeWallet.address}`;
      const granterSinature = await getSignature(etherWallet, [signedMessage], dataStructure);

      const res = await granterClient.revokePermissions(ethAddress, granterSinature, signedMessage, ethNetwork);

      expect(res.tx_response.code).toBe(0);
    });
  });
});
