# Dexilon Chain Js sdk 
 [![NPM Version][npm-image]][npm-url]
 **:warning:FOR INTERNAL USAGE ONLY:warning:**

## Dexilon concept of registration and authorization

The whole design of our authorization process was motivated with requirements: 

> *“Support Metamask as the entry point of integration with the system and don’t make user approve every single action with Metamask pop up windows”* 

So we’ve created a workflow to be comfortable for user and to be decentralized enough

## Core idea

### **The initial idea was:**

> *It would be awesome to have a way to get a cosmos private key from Metamask ECDSA signature, moreover, one the same private key each time. This could allow user not to store any cosmos mnemonics, addresses. Ethereum wallet, metamask would be enough.
Just create a signature when you start a session ⇒ front-end has a private key, which can be restored in any time. This is secure and nice way, but it’s impossible due the ECDSA signatures have a random part in it and this causes impossibility to use a part of the signature as the private key (it always would be different)*

### **The original idea mutated to the following one:**

- While first login we offer user to create a new mnemonic and sign “the registration msg” with metamask
    - User should save the mnemonic on his own responsibility
    - Registration message is a signed cosmos transaction with following data:
        - cosmos address (creator, new generated user’s account)
        - Ethereum address (mapping address)
        - chainId (numeric id of the chain)
- When **Dexilon** chain (cosmos) registers this transaction we get a result:
    - User can give a grant to perform actions on behalf of his cosmos account to another temporary account for some period of time based on a valid **Ethereum ECDSA signature**

### Why is it cool?

Cosmos-sdk has `x/authz` module which allows to exec messages signed with grantee key to perform actions on behalf of granter account. Thats exactly we want to do. The main difference, is that we create the grants based on the Ethereum signature, not the cosmos one.

So the flow looks like: 

- Front end can generate a new account *(actually mnemonic ⇒ privateKey ⇒ pubKey ⇒ address) per each user’s session.*
- Sends a transaction with GrantPermissions msg providing Ethereum ECDSA signature to proof the granter’s agreement
- After the grants appeared in the system grantee account (temporary account) can perform actions on behalf of granter account. Cool - user is now logged in and can interact with the platform


----

### Dependencies

- blockchain proxy API URL

:warning: The client is required to be async initialized due to dependencies it's got under the hood 

```ts
    granterWallet = await getRandomCosmosAddress();

    const api = new BlockchainAPI('localhost', 3312);

    await api.faucet(granterWallet.address);

    const config: Config = {
      blockchainApiHost: 'localhost',
      blockchainApiPort: 3000,
      chainId: 'dexilonL2',
      bondDenom: 'dxln',
    };

    granterClient = new DexilonClient(granterWallet.wallet, api, config);
    await granterClient.init();
```

### Before using the sdk

When new account is been generated locally you still can not use it even the transaction fee is zero. You need your account to be registered in the blockchain. The easiest way to do it is to claim some tokens from the faucet:

```ts
await api.faucet(granterWallet.address);
``` 

After that your account will have few WEI on the bank module and you can perform actions in the blockchain

### Methods

- [createAddressMapping](https://github.com/dexilon-exchange/dexilon-chain-js-sdk/blob/master/src/client.ts#L68)
- [grantPermissions](https://github.com/dexilon-exchange/dexilon-chain-js-sdk/blob/master/src/client.ts#L80)
- [revokePermissions](https://github.com/dexilon-exchange/dexilon-chain-js-sdk/blob/master/src/client.ts#L100)
- [depositTrading](https://github.com/dexilon-exchange/dexilon-chain-js-sdk/blob/master/src/client.ts#L118)
- [withdrawTrading](https://github.com/dexilon-exchange/dexilon-chain-js-sdk/blob/master/src/client.ts#L135)
- [withdraw](https://github.com/dexilon-exchange/dexilon-chain-js-sdk/blob/master/src/client.ts#L153)

### Usage examples for each method can be found in [tests](https://github.com/dexilon-exchange/dexilon-chain-js-sdk/blob/master/tests/dev.test.ts)

[npm-image]: https://img.shields.io/badge/npm-v0.1.0-green?style=plastic&logo=npm
[npm-url]: https://github.com/dexilon-exchange/dexilon-chain-js-sdk/packages/1585138
