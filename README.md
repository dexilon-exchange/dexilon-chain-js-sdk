# Dexilon Chain Js sdk

[![NPM Version][npm-image]][npm-url]

### Description

Cosmos-sdk has `x/authz` module which allows to exec messages signed with grantee key to perform actions on behalf of granter account. Thats exactly we want to do. The main difference, is that we create the grants based on the Ethereum signature, not the cosmos one.

So the flow looks like:

- Front end can generate a new account _(actually mnemonic ⇒ privateKey ⇒ pubKey ⇒ address) per each user’s session._
- Sends a transaction with GrantPermissions msg providing Ethereum ECDSA signature to proof the granter’s agreement
- After the grants appeared in the system grantee account (temporary account) can perform actions on behalf of granter account. Cool - user is now logged in and can interact with the platform

---

## How to use

:warning: The client is required to be async initialized due to dependencies it's got under the hood

```ts
cosmosWallet = await getRandomCosmosAddress();

const config: Config = {
  blockchainApiUrl: 'https://proxy.staging.dexilon.io',
  chainId: 'dexilon-staging',
  bondDenom: 'dxln',
};
const api = new BlockchainAPI(config);

await api.faucet(cosmosWallet.address);

cosmosClient = new DexilonClient(cosmosWallet.wallet, api, config);
await cosmosClient.init();
```

### Faucet usage

When new account is been generated locally you still can not use it even the transaction fee is zero. You need your account to be registered in the blockchain. The easiest way to do it is to claim some tokens from the faucet:

```ts
await api.faucet(granterWallet.address);
```

After that your account will have few WEI of DXLN token on the bank module and you can perform actions in the blockchain

### Methods

- [createAddressMapping](https://github.com/dexilon-exchange/dexilon-chain-js-sdk/blob/master/src/client.ts#L68)
- [grantPermissions](https://github.com/dexilon-exchange/dexilon-chain-js-sdk/blob/master/src/client.ts#L80)
- [revokePermissions](https://github.com/dexilon-exchange/dexilon-chain-js-sdk/blob/master/src/client.ts#L100)
- [depositTrading](https://github.com/dexilon-exchange/dexilon-chain-js-sdk/blob/master/src/client.ts#L118)
- [withdrawTrading](https://github.com/dexilon-exchange/dexilon-chain-js-sdk/blob/master/src/client.ts#L135)
- [withdraw](https://github.com/dexilon-exchange/dexilon-chain-js-sdk/blob/master/src/client.ts#L153)

### Usage examples for each method can be found in [tests](https://github.com/dexilon-exchange/dexilon-chain-js-sdk/blob/master/tests/dev.test.ts)

[npm-image]: https://img.shields.io/badge/npm-v0.2.6-green?style=plastic&logo=npm
[npm-url]: https://github.com/dexilon-exchange/dexilon-chain-js-sdk/packages/1585138
