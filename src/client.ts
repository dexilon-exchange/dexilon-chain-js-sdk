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
} from './interfaces/msg/registration';
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
import { PushTxRequestDTO, PushTxResponseDTO } from './interfaces/blockchain-api.dto';
import { DepositTradingBalanceRequest } from './interfaces/msg/trading';
import { MsgWithdrawTransaction } from './interfaces/msg/withdraw';
import { MsgDepositWithinBatch, MsgSwapWithinBatch, MsgWithdrawWithinBatch } from './interfaces/msg/liquidity';
import { BroadcastMode, TxOptions } from './interfaces/common/client';
import { BigFloat, div } from 'bigfloat.js';
import { PoolPrices } from './interfaces/query/liquidity.dto';

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
    registry.register(MsgDepositWithinBatch.typeUrl, MsgDepositWithinBatch);
    registry.register(MsgSwapWithinBatch.typeUrl, MsgSwapWithinBatch);
    registry.register(MsgWithdrawWithinBatch.typeUrl, MsgWithdrawWithinBatch);

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

  async createAddressMapping(
    chainId: number,
    externalAddress: string,
    signedMessage: string,
    signature: string,
    options?: TxOptions,
  ): Promise<PushTxResponseDTO> {
    const cosmosAddress = this.from;
    const txBodyFields = this.getTxBody(MsgCreateAddressMapping.typeUrl, {
      creator: cosmosAddress,
      chainId,
      address: externalAddress,
      signedMessage,
      signature,
    });
    const txRaw = await this.directSignCustomMsg(cosmosAddress, txBodyFields);

    return await this.pushTx(txRaw, options);
  }

  async grantPermissions(
    granterEthAddress: string,
    signature: string,
    signedMessage: string,
    expirationTime: number,
    options?: TxOptions,
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

    return await this.pushTx(txRaw, options);
  }

  async revokePermissions(
    granterEthAddress: string,
    signature: string,
    signedMessage: string,
    options?: TxOptions,
  ): Promise<any> {
    const creator = this.from;

    const txBodyFields = this.getTxBody(MsgRevokePermissionRequest.typeUrl, {
      creator,
      granterEthAddress,
      signature,
      signedMessage,
    });
    const txRaw = await this.directSignCustomMsg(creator, txBodyFields);

    return await this.pushTx(txRaw, options);
  }

  async depositTrading(granter: string, balance: string, asset: string, options?: TxOptions): Promise<any> {
    const grantee = this.from;

    const msg = {
      typeUrl: DepositTradingBalanceRequest.typeUrl,
      value: DepositTradingBalanceRequest.encode(
        DepositTradingBalanceRequest.fromPartial({
          accountAddress: granter,
          balance,
          asset,
        }),
      ).finish(),
    };

    return await this.authzWrapAndPushTx(grantee, [msg], options);
  }

  async getDxlnUsdcPrice(): Promise<PoolPrices> {
    const { pool } = await this.api.getPoolById({ id: '1' });
    const poolBankAccount = pool.reserve_account_address;

    const { data } = await this.api.getBankBalances(poolBankAccount);
    const balances = data.balances;

    const dxlnCoin = balances.find((coin) => coin.denom === this.bondDenom);
    const usdcCoin = balances.find((coin) => coin.denom === 'usdc');

    console.log(balances);

    const dxlnAmount = new BigFloat(dxlnCoin.amount);
    const usdcAmount = new BigFloat(usdcCoin.amount);
    const PRECISION = -16;
    const priceA = new BigFloat(div(dxlnAmount, usdcAmount, PRECISION));
    const priceB = new BigFloat(div(usdcAmount, dxlnAmount, PRECISION));

    return { dxlnToUsdc: priceA.toString(), usdcToDxln: priceB.toString() };
  }

  async swap(
    address: string,
    amount: string,
    wishDenom: string,
    hasDenom: string,
    price: string,
    options?: TxOptions,
  ): Promise<any> {
    console.log({ address, amount, wishDenom, hasDenom, price });
    const from = this.from;
    console.log({
      swap_requester_address: address,
      pool_id: 1,
      swap_type_id: 1,
      demand_coin_denom: wishDenom,
      order_price: price,
      offer_coin: { denom: hasDenom, amount },
      offer_coin_fee: {
        denom: hasDenom,
        amount: '3',
      },
    });

    const msg = {
      typeUrl: MsgSwapWithinBatch.typeUrl,
      value: MsgSwapWithinBatch.encode(
        MsgSwapWithinBatch.fromPartial({
          swap_requester_address: address,
          pool_id: 1,
          swap_type_id: 1,
          demand_coin_denom: wishDenom,
          order_price: price,
          offer_coin: { denom: hasDenom, amount },
          offer_coin_fee: {
            denom: hasDenom,
            amount: '3',
          },
        }),
      ).finish(),
    };

    return await this.authzWrapAndPushTx(from, [msg], options);
  }

  async withdraw(granter: string, denom: string, amount: string, chainId: number, options?: TxOptions): Promise<any> {
    const grantee = this.from;

    // The Custom Module Message that the grantee needs to execute
    const msg = {
      typeUrl: MsgWithdrawTransaction.typeUrl,
      value: MsgWithdrawTransaction.encode(
        MsgWithdrawTransaction.fromPartial({
          creator: granter,
          denom,
          amount,
          chainId,
        }),
      ).finish(),
    };

    return await this.authzWrapAndPushTx(grantee, [msg], options);
  }

  private async authzWrapAndPushTx(grantee: string, msgs: any[], options?: TxOptions) {
    const txAuthMessage = {
      typeUrl: '/cosmos.authz.v1beta1.MsgExec',
      value: {
        grantee: grantee,
        msgs,
      },
    };

    const { account_number: accountNumber, sequence } = (await this.api.getAccountInfo(grantee))!.account;

    const defaultGasPrice = GasPrice.fromString(`0${this.bondDenom}`);
    const defaultSendFee: StdFee = calculateFee(200000, defaultGasPrice);

    const txRaw = await this.client.sign(grantee, [txAuthMessage], defaultSendFee, '', {
      accountNumber: parseInt(accountNumber),
      sequence: parseInt(sequence),
      chainId: this.config.chainId,
    });

    const txBytes = TxRaw.encode(txRaw).finish();

    return await this.pushTx(txBytes, options);
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

  private async pushTx(txRaw: Uint8Array, options: TxOptions) {
    const b64encoded = Buffer.from(txRaw).toString('base64');

    const data: PushTxRequestDTO = {
      tx_bytes: b64encoded,
      mode: options?.mode ? options.mode : BroadcastMode.BROADCAST_MODE_BLOCK,
    };
    return await this.api.pushTx(data);
  }
}
