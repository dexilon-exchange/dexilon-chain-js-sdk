# Dexilon Chain Js sdk 
 [![NPM Version][npm-image]][npm-url]

## Dexilon concept of registration and authorization

The whole design of our authorization process was motivated with requirements: 

*“Support Metamask as the entry point of integration with the system and don’t make user approve every single action with Metamask pop up windows”* 

So we’ve created a workflow to be comfortable for user and to be decentralized enough

## Core idea

### **The initial idea was:**

> *It would be awesome to have a way to get a cosmos private key from Metamask ECDSA signature, moreover, one the same private key each time. This could allow user not to store any cosmos mnemonics, addresses. Ethereum wallet, metamask would be enough.
Just create a signature when you start a session ⇒ front-end has a private key, which can be restored in any time. This is secure and nice way, but it’s impossible due the ECDSA signatures have a random part in it and this causes impossibility to use a part of the signature as the private key (it always would be different)*

### **The original idea mutated to following one:**

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





[npm-image]: https://img.shields.io/badge/npm-v0.1.0-green?style=for-the-badge&logo=npm
[npm-url]: https://github.com/dexilon-exchange/dexilon-chain-js-sdk/packages/1585138
