import { SigningStargateClient, SigningStargateClientOptions } from '@cosmjs/stargate';
import { Config } from './interfaces/config';
import {
  MsgCreateAddressMapping,
  MsgGrantPermissionRequest,
  MsgRevokePermissionRequest,
} from './interfaces/registration';
import { BlockchainAPI } from './api';
import {
  coins,
  DirectSecp256k1HdWallet,
  encodePubkey,
  makeAuthInfoBytes,
  makeSignDoc,
  Registry,
  TxBodyEncodeObject,
} from '@cosmjs/proto-signing';
import { fromBase64, toBase64 } from '@cosmjs/encoding';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

const defaultSigningClientOptions: SigningStargateClientOptions = {
  broadcastPollIntervalMs: 300,
  broadcastTimeoutMs: 8_000,
};

export class DexilonClient {
  private client: SigningStargateClient;
  private readonly config: Config;
  private readonly wallet: DirectSecp256k1HdWallet;
  private readonly api: BlockchainAPI;

  constructor(wallet: DirectSecp256k1HdWallet, api: BlockchainAPI, config: Config) {
    this.api = api;
    this.config = config;
    this.wallet = wallet;
  }

  async init() {
    const registry = new Registry();
    registry.register(MsgCreateAddressMapping.typeUrl, MsgCreateAddressMapping);
    registry.register(MsgGrantPermissionRequest.typeUrl, MsgGrantPermissionRequest);
    registry.register(MsgRevokePermissionRequest.typeUrl, MsgRevokePermissionRequest);

    const options = { ...defaultSigningClientOptions, registry: registry };
    this.client = await SigningStargateClient.offline(this.wallet, options);
  }

  get bondDenom() {
    return this.config.bondDenom;
  }

  get chainId() {
    return this.config.chainId;
  }

  async createAddressMapping(cosmosAddress: string, chainId: number, externalAddress: string): Promise<any> {
    const txBodyFields = this.getTxBody(MsgCreateAddressMapping.typeUrl, {
      creator: cosmosAddress,
      chainId,
      address: externalAddress,
    });
    const txRaw = await this.directSignCustomMsg(cosmosAddress, txBodyFields);

    return await this.api.pushTx(txRaw);
  }

  async grantPermissions(
    creator: string,
    granterEthAddress: string,
    signature: string,
    signedMessage: string,
    expirationTime: number,
  ): Promise<any> {
    const txBodyFields = this.getTxBody(MsgGrantPermissionRequest.typeUrl, {
      creator,
      granterEthAddress,
      signature,
      signedMessage,
      expirationTime,
    });
    const txRaw = await this.directSignCustomMsg(creator, txBodyFields);

    return await this.api.pushTx(txRaw);
  }

  async revokePermissions(
    creator: string,
    granterEthAddress: string,
    signature: string,
    signedMessage: string,
  ): Promise<any> {
    const txBodyFields = this.getTxBody(MsgRevokePermissionRequest.typeUrl, {
      creator,
      granterEthAddress,
      signature,
      signedMessage,
    });
    const txRaw = await this.directSignCustomMsg(creator, txBodyFields);

    return await this.api.pushTx(txRaw);
  }

  private getTxBody(typeUrl: string, value: any): TxBodyEncodeObject {
    return {
      typeUrl: '/cosmos.tx.v1beta1.TxBody',
      value: {
        messages: [
          {
            typeUrl,
            value,
          },
        ],
      },
    };
  }

  private async directSignCustomMsg(cosmosAddress: string, txBodyFields: TxBodyEncodeObject): Promise<Uint8Array> {
    const [{ address: alice, pubkey: pubkeyBytes }] = await this.wallet.getAccounts();
    const pubkey = encodePubkey({
      type: 'tendermint/PubKeySecp256k1',
      value: toBase64(pubkeyBytes),
    });

    const registry = this.client.registry;
    registry.register(MsgCreateAddressMapping.typeUrl, MsgCreateAddressMapping);

    const txBodyBytes = registry.encode(txBodyFields);
    const { account_number: accountNumber, sequence } = (await this.api.getAccountInfo(cosmosAddress))!.account;
    const feeAmount = coins(0, this.bondDenom);
    const gasLimit = 200000;
    const authInfoBytes = makeAuthInfoBytes([{ pubkey, sequence: parseInt(sequence) }], feeAmount, gasLimit);

    const chainId = this.chainId;
    const signDoc = makeSignDoc(txBodyBytes, authInfoBytes, chainId, parseInt(accountNumber));
    const { signature } = await this.wallet.signDirect(alice, signDoc);

    const txRaw = TxRaw.fromPartial({
      bodyBytes: txBodyBytes,
      authInfoBytes: authInfoBytes,
      signatures: [fromBase64(signature.signature)],
    });

    const txRawBytes = Uint8Array.from(TxRaw.encode(txRaw).finish());
    return txRawBytes;
  }
}
