import {
  calculateFee,
  defaultRegistryTypes,
  GasPrice,
  SigningStargateClient,
  SigningStargateClientOptions,
  StdFee,
} from '@cosmjs/stargate';
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
import { PushTxResponseDTO } from './interfaces/blockchain-api.dto';
import { DepositTradingBalanceRequest } from './interfaces/trading';

const defaultSigningClientOptions: SigningStargateClientOptions = {
  broadcastPollIntervalMs: 300,
  broadcastTimeoutMs: 8_000,
};

export class DexilonClient {
  private client: SigningStargateClient;
  private from: string;
  private readonly config: Config;
  private readonly wallet: DirectSecp256k1HdWallet;
  private readonly api: BlockchainAPI;

  constructor(wallet: DirectSecp256k1HdWallet, api: BlockchainAPI, config: Config) {
    this.api = api;
    this.config = config;
    this.wallet = wallet;
  }

  async init() {
    const registry = new Registry(defaultRegistryTypes);
    registry.register(MsgCreateAddressMapping.typeUrl, MsgCreateAddressMapping);
    registry.register(MsgGrantPermissionRequest.typeUrl, MsgGrantPermissionRequest);
    registry.register(MsgRevokePermissionRequest.typeUrl, MsgRevokePermissionRequest);

    console.log(registry);
    const options = { ...defaultSigningClientOptions, registry: registry };
    this.client = await SigningStargateClient.offline(this.wallet, options);
    this.from = (await this.wallet.getAccounts())[0].address;
  }

  get bondDenom() {
    return this.config.bondDenom;
  }

  get chainId() {
    return this.config.chainId;
  }

  async createAddressMapping(chainId: number, externalAddress: string): Promise<PushTxResponseDTO> {
    const cosmosAddress = this.from;
    const txBodyFields = this.getTxBody(MsgCreateAddressMapping.typeUrl, {
      creator: cosmosAddress,
      chainId,
      address: externalAddress,
    });
    const txRaw = await this.directSignCustomMsg(cosmosAddress, txBodyFields);

    return await this.api.pushTx(txRaw);
  }

  async grantPermissions(
    granterEthAddress: string,
    signature: string,
    signedMessage: string,
    expirationTime: number,
  ): Promise<any> {
    const creator = this.from;

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
    granterEthAddress: string,
    signature: string,
    signedMessage: string,
  ): Promise<any> {
    const creator = this.from;

    const txBodyFields = this.getTxBody(MsgRevokePermissionRequest.typeUrl, {
      creator,
      granterEthAddress,
      signature,
      signedMessage,
    });
    const txRaw = await this.directSignCustomMsg(creator, txBodyFields);

    return await this.api.pushTx(txRaw);
  }

  async depositTrading(granter: string, balance: string, asset: string): Promise<any> {
    const grantee = this.from;

    // The Custom Module Message that the grantee needs to execute
    const txDepositTradingMessage = {
      typeUrl: DepositTradingBalanceRequest.typeUrl,
      value: DepositTradingBalanceRequest.encode(
        DepositTradingBalanceRequest.fromPartial({
          accountAddress: granter,
          balance,
          asset,
        }),
      ).finish(),
    };

    return await this.authzWrapAndPushTx(grantee, [txDepositTradingMessage]);
  }

  private async authzWrapAndPushTx(grantee: string, msgs: any[]) {
    const txAuthMessage = {
      typeUrl: '/cosmos.authz.v1beta1.MsgExec',
      value: {
        grantee: grantee,
        msgs,
      },
    };

    const { account_number: accountNumber, sequence } = (await this.api.getAccountInfo(grantee))!
      .account;

    const defaultGasPrice = GasPrice.fromString('0stake');
    const defaultSendFee: StdFee = calculateFee(200000, defaultGasPrice);

    const txRaw = await this.client.sign(grantee, [txAuthMessage], defaultSendFee, '', {
      accountNumber: parseInt(accountNumber),
      sequence: parseInt(sequence),
      chainId: 'dexilonL2',
    });

    const txBytes = TxRaw.encode(txRaw).finish();

    return await this.api.pushTx(txBytes);
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

  private async directSignCustomMsg(
    cosmosAddress: string,
    txBodyFields: TxBodyEncodeObject,
  ): Promise<Uint8Array> {
    const [{ address: alice, pubkey: pubkeyBytes }] = await this.wallet.getAccounts();
    const pubkey = encodePubkey({
      type: 'tendermint/PubKeySecp256k1',
      value: toBase64(pubkeyBytes),
    });

    const registry = this.client.registry;
    registry.register(MsgCreateAddressMapping.typeUrl, MsgCreateAddressMapping);

    const txBodyBytes = registry.encode(txBodyFields);
    const { account_number: accountNumber, sequence } = (await this.api.getAccountInfo(
      cosmosAddress,
    ))!.account;
    const feeAmount = coins(0, this.bondDenom);
    const gasLimit = 200000;
    const authInfoBytes = makeAuthInfoBytes(
      [{ pubkey, sequence: parseInt(sequence) }],
      feeAmount,
      gasLimit,
    );

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
