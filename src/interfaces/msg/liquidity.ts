/* eslint-disable */
import Long from 'long';
import { Reader, util, configure, Writer } from 'protobufjs/minimal';
import { Coin } from '../common/coin';
import { DeepPartial, longToNumber } from '../common/common';

export const protobufPackage = 'dexilon_exchange.dexilonL2.liquidity';

/**
 * MsgCreatePool defines an sdk.Msg type that supports submitting a create liquidity pool tx.
 *
 * See: https://github.com/tendermint/liquidity/blob/develop/x/liquidity/spec/04_messages.md
 */
export interface MsgCreatePool {
  pool_creator_address: string;
  /** id of the target pool type, must match the value in the pool. Only pool-type-id 1 is supported. */
  pool_type_id: number;
  /** reserve coin pair of the pool to deposit. */
  deposit_coins: Coin[];
}

/** MsgCreatePoolResponse defines the Msg/CreatePool response type. */
export interface MsgCreatePoolResponse {}

/**
 * `MsgDepositWithinBatch defines` an `sdk.Msg` type that supports submitting
 * a deposit request to the batch of the liquidity pool.
 * Deposit is submitted to the batch of the Liquidity pool with the specified
 * `pool_id`, `deposit_coins` for reserve.
 * This request is stacked in the batch of the liquidity pool, is not processed
 * immediately, and is processed in the `endblock` at the same time as other requests.
 *
 * See: https://github.com/tendermint/liquidity/blob/develop/x/liquidity/spec/04_messages.md
 */
export interface MsgDepositWithinBatch {
  depositor_address: string;
  /** id of the target pool */
  pool_id: number;
  /** reserve coin pair of the pool to deposit */
  deposit_coins: Coin[];
}

/** MsgDepositWithinBatchResponse defines the Msg/DepositWithinBatch response type. */
export interface MsgDepositWithinBatchResponse {}

/**
 * `MsgWithdrawWithinBatch` defines an `sdk.Msg` type that supports submitting
 * a withdraw request to the batch of the liquidity pool.
 * Withdraw is submitted to the batch from the Liquidity pool with the
 * specified `pool_id`, `pool_coin` of the pool.
 * This request is stacked in the batch of the liquidity pool, is not processed
 * immediately, and is processed in the `endblock` at the same time as other requests.
 *
 * See: https://github.com/tendermint/liquidity/blob/develop/x/liquidity/spec/04_messages.md
 */
export interface MsgWithdrawWithinBatch {
  withdrawer_address: string;
  /** id of the target pool */
  pool_id: number;
  pool_coin: Coin | undefined;
}

/** MsgWithdrawWithinBatchResponse defines the Msg/WithdrawWithinBatch response type. */
export interface MsgWithdrawWithinBatchResponse {}

/**
 * `MsgSwapWithinBatch` defines an sdk.Msg type that supports submitting a swap offer request to the batch of the liquidity pool.
 * Submit swap offer to the liquidity pool batch with the specified the `pool_id`, `swap_type_id`,
 * `demand_coin_denom` with the coin and the price you're offering
 * and `offer_coin_fee` must be half of offer coin amount * current `params.swap_fee_rate` and ceil for reservation to pay fees.
 * This request is stacked in the batch of the liquidity pool, is not processed
 * immediately, and is processed in the `endblock` at the same time as other requests.
 * You must request the same fields as the pool.
 * Only the default `swap_type_id` 1 is supported.
 *
 * See: https://github.com/tendermint/liquidity/tree/develop/doc
 * https://github.com/tendermint/liquidity/blob/develop/x/liquidity/spec/04_messages.md
 */
export interface MsgSwapWithinBatch {
  /** address of swap requester */
  swap_requester_address: string;
  /** id of swap type, must match the value in the pool. Only `swap_type_id` 1 is supported. */
  pool_id: number;
  /** id of swap type. Must match the value in the pool. */
  swap_type_id: number;
  /** offer sdk.coin for the swap request, must match the denom in the pool. */
  offer_coin: Coin | undefined;
  /** denom of demand coin to be exchanged on the swap request, must match the denom in the pool. */
  demand_coin_denom: string;
  /** half of offer coin amount * params.swap_fee_rate and ceil for reservation to pay fees. */
  offer_coin_fee: Coin | undefined;
  /**
   * limit order price for the order, the price is the exchange ratio of X/Y
   * where X is the amount of the first coin and Y is the amount
   * of the second coin when their denoms are sorted alphabetically.
   */
  order_price: string;
}

/** MsgSwapWithinBatchResponse defines the Msg/Swap response type. */
export interface MsgSwapWithinBatchResponse {}

export interface MsgSwapWithinBatchSimpified {
  /** address of swap requester */
  swap_requester_address: string;
  /** offer sdk.coin for the swap request, must match the denom in the pool. */
  offer_coin: Coin | undefined;
  /** denom of demand coin to be exchanged on the swap request, must match the denom in the pool. */
  demand_coin_denom: string;
  price: string;
}

const baseMsgDepositWithinBatch: object = { depositor_address: '', pool_id: 0 };

export const MsgDepositWithinBatch = {
  typeUrl: '/dexilon_exchange.dexilonL2.liquidity.MsgDepositWithinBatch',
  encode(message: MsgDepositWithinBatch, writer: Writer = Writer.create()): Writer {
    if (message.depositor_address !== '') {
      writer.uint32(10).string(message.depositor_address);
    }
    if (message.pool_id !== 0) {
      writer.uint32(16).uint64(message.pool_id);
    }
    for (const v of message.deposit_coins) {
      Coin.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): MsgDepositWithinBatch {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMsgDepositWithinBatch } as MsgDepositWithinBatch;
    message.deposit_coins = [];
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.depositor_address = reader.string();
          break;
        case 2:
          message.pool_id = longToNumber(reader.uint64() as Long);
          break;
        case 3:
          message.deposit_coins.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgDepositWithinBatch {
    const message = { ...baseMsgDepositWithinBatch } as MsgDepositWithinBatch;
    message.deposit_coins = [];
    if (object.depositor_address !== undefined && object.depositor_address !== null) {
      message.depositor_address = String(object.depositor_address);
    } else {
      message.depositor_address = '';
    }
    if (object.pool_id !== undefined && object.pool_id !== null) {
      message.pool_id = Number(object.pool_id);
    } else {
      message.pool_id = 0;
    }
    if (object.deposit_coins !== undefined && object.deposit_coins !== null) {
      for (const e of object.deposit_coins) {
        message.deposit_coins.push(Coin.fromJSON(e));
      }
    }
    return message;
  },

  toJSON(message: MsgDepositWithinBatch): unknown {
    const obj: any = {};
    message.depositor_address !== undefined && (obj.depositor_address = message.depositor_address);
    message.pool_id !== undefined && (obj.pool_id = message.pool_id);
    if (message.deposit_coins) {
      obj.deposit_coins = message.deposit_coins.map((e) => (e ? Coin.toJSON(e) : undefined));
    } else {
      obj.deposit_coins = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<MsgDepositWithinBatch>): MsgDepositWithinBatch {
    const message = { ...baseMsgDepositWithinBatch } as MsgDepositWithinBatch;
    message.deposit_coins = [];
    if (object.depositor_address !== undefined && object.depositor_address !== null) {
      message.depositor_address = object.depositor_address;
    } else {
      message.depositor_address = '';
    }
    if (object.pool_id !== undefined && object.pool_id !== null) {
      message.pool_id = object.pool_id;
    } else {
      message.pool_id = 0;
    }
    if (object.deposit_coins !== undefined && object.deposit_coins !== null) {
      for (const e of object.deposit_coins) {
        message.deposit_coins.push(Coin.fromPartial(e));
      }
    }
    return message;
  },
};

const baseMsgDepositWithinBatchResponse: object = {};

export const MsgDepositWithinBatchResponse = {
  encode(_: MsgDepositWithinBatchResponse, writer: Writer = Writer.create()): Writer {
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): MsgDepositWithinBatchResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseMsgDepositWithinBatchResponse,
    } as MsgDepositWithinBatchResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): MsgDepositWithinBatchResponse {
    const message = {
      ...baseMsgDepositWithinBatchResponse,
    } as MsgDepositWithinBatchResponse;
    return message;
  },

  toJSON(_: MsgDepositWithinBatchResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(_: DeepPartial<MsgDepositWithinBatchResponse>): MsgDepositWithinBatchResponse {
    const message = {
      ...baseMsgDepositWithinBatchResponse,
    } as MsgDepositWithinBatchResponse;
    return message;
  },
};

const baseMsgWithdrawWithinBatch: object = {
  withdrawer_address: '',
  pool_id: 0,
};

export const MsgWithdrawWithinBatch = {
  typeUrl: '/dexilon_exchange.dexilonL2.liquidity.MsgWithdrawWithinBatch',
  encode(message: MsgWithdrawWithinBatch, writer: Writer = Writer.create()): Writer {
    if (message.withdrawer_address !== '') {
      writer.uint32(10).string(message.withdrawer_address);
    }
    if (message.pool_id !== 0) {
      writer.uint32(16).uint64(message.pool_id);
    }
    if (message.pool_coin !== undefined) {
      Coin.encode(message.pool_coin, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): MsgWithdrawWithinBatch {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMsgWithdrawWithinBatch } as MsgWithdrawWithinBatch;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.withdrawer_address = reader.string();
          break;
        case 2:
          message.pool_id = longToNumber(reader.uint64() as Long);
          break;
        case 3:
          message.pool_coin = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgWithdrawWithinBatch {
    const message = { ...baseMsgWithdrawWithinBatch } as MsgWithdrawWithinBatch;
    if (object.withdrawer_address !== undefined && object.withdrawer_address !== null) {
      message.withdrawer_address = String(object.withdrawer_address);
    } else {
      message.withdrawer_address = '';
    }
    if (object.pool_id !== undefined && object.pool_id !== null) {
      message.pool_id = Number(object.pool_id);
    } else {
      message.pool_id = 0;
    }
    if (object.pool_coin !== undefined && object.pool_coin !== null) {
      message.pool_coin = Coin.fromJSON(object.pool_coin);
    } else {
      message.pool_coin = undefined;
    }
    return message;
  },

  toJSON(message: MsgWithdrawWithinBatch): unknown {
    const obj: any = {};
    message.withdrawer_address !== undefined && (obj.withdrawer_address = message.withdrawer_address);
    message.pool_id !== undefined && (obj.pool_id = message.pool_id);
    message.pool_coin !== undefined && (obj.pool_coin = message.pool_coin ? Coin.toJSON(message.pool_coin) : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<MsgWithdrawWithinBatch>): MsgWithdrawWithinBatch {
    const message = { ...baseMsgWithdrawWithinBatch } as MsgWithdrawWithinBatch;
    if (object.withdrawer_address !== undefined && object.withdrawer_address !== null) {
      message.withdrawer_address = object.withdrawer_address;
    } else {
      message.withdrawer_address = '';
    }
    if (object.pool_id !== undefined && object.pool_id !== null) {
      message.pool_id = object.pool_id;
    } else {
      message.pool_id = 0;
    }
    if (object.pool_coin !== undefined && object.pool_coin !== null) {
      message.pool_coin = Coin.fromPartial(object.pool_coin);
    } else {
      message.pool_coin = undefined;
    }
    return message;
  },
};

const baseMsgWithdrawWithinBatchResponse: object = {};

export const MsgWithdrawWithinBatchResponse = {
  encode(_: MsgWithdrawWithinBatchResponse, writer: Writer = Writer.create()): Writer {
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): MsgWithdrawWithinBatchResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseMsgWithdrawWithinBatchResponse,
    } as MsgWithdrawWithinBatchResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): MsgWithdrawWithinBatchResponse {
    const message = {
      ...baseMsgWithdrawWithinBatchResponse,
    } as MsgWithdrawWithinBatchResponse;
    return message;
  },

  toJSON(_: MsgWithdrawWithinBatchResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(_: DeepPartial<MsgWithdrawWithinBatchResponse>): MsgWithdrawWithinBatchResponse {
    const message = {
      ...baseMsgWithdrawWithinBatchResponse,
    } as MsgWithdrawWithinBatchResponse;
    return message;
  },
};

const baseMsgSwapWithinBatch: object = {
  swap_requester_address: '',
  pool_id: 0,
  swap_type_id: 0,
  demand_coin_denom: '',
  order_price: '',
};

export const MsgSwapWithinBatch = {
  typeUrl: '/dexilon_exchange.dexilonL2.liquidity.MsgSwapWithinBatch',
  encode(message: MsgSwapWithinBatch, writer: Writer = Writer.create()): Writer {
    if (message.swap_requester_address !== '') {
      writer.uint32(10).string(message.swap_requester_address);
    }
    if (message.pool_id !== 0) {
      writer.uint32(16).uint64(message.pool_id);
    }
    if (message.swap_type_id !== 0) {
      writer.uint32(24).uint32(message.swap_type_id);
    }
    if (message.offer_coin !== undefined) {
      Coin.encode(message.offer_coin, writer.uint32(34).fork()).ldelim();
    }
    if (message.demand_coin_denom !== '') {
      writer.uint32(42).string(message.demand_coin_denom);
    }
    if (message.offer_coin_fee !== undefined) {
      Coin.encode(message.offer_coin_fee, writer.uint32(50).fork()).ldelim();
    }
    if (message.order_price !== '') {
      writer.uint32(58).string(message.order_price);
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): MsgSwapWithinBatch {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMsgSwapWithinBatch } as MsgSwapWithinBatch;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.swap_requester_address = reader.string();
          break;
        case 2:
          message.pool_id = longToNumber(reader.uint64() as Long);
          break;
        case 3:
          message.swap_type_id = reader.uint32();
          break;
        case 4:
          message.offer_coin = Coin.decode(reader, reader.uint32());
          break;
        case 5:
          message.demand_coin_denom = reader.string();
          break;
        case 6:
          message.offer_coin_fee = Coin.decode(reader, reader.uint32());
          break;
        case 7:
          message.order_price = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgSwapWithinBatch {
    const message = { ...baseMsgSwapWithinBatch } as MsgSwapWithinBatch;
    if (object.swap_requester_address !== undefined && object.swap_requester_address !== null) {
      message.swap_requester_address = String(object.swap_requester_address);
    } else {
      message.swap_requester_address = '';
    }
    if (object.pool_id !== undefined && object.pool_id !== null) {
      message.pool_id = Number(object.pool_id);
    } else {
      message.pool_id = 0;
    }
    if (object.swap_type_id !== undefined && object.swap_type_id !== null) {
      message.swap_type_id = Number(object.swap_type_id);
    } else {
      message.swap_type_id = 0;
    }
    if (object.offer_coin !== undefined && object.offer_coin !== null) {
      message.offer_coin = Coin.fromJSON(object.offer_coin);
    } else {
      message.offer_coin = undefined;
    }
    if (object.demand_coin_denom !== undefined && object.demand_coin_denom !== null) {
      message.demand_coin_denom = String(object.demand_coin_denom);
    } else {
      message.demand_coin_denom = '';
    }
    if (object.offer_coin_fee !== undefined && object.offer_coin_fee !== null) {
      message.offer_coin_fee = Coin.fromJSON(object.offer_coin_fee);
    } else {
      message.offer_coin_fee = undefined;
    }
    if (object.order_price !== undefined && object.order_price !== null) {
      message.order_price = String(object.order_price);
    } else {
      message.order_price = '';
    }
    return message;
  },

  toJSON(message: MsgSwapWithinBatch): unknown {
    const obj: any = {};
    message.swap_requester_address !== undefined && (obj.swap_requester_address = message.swap_requester_address);
    message.pool_id !== undefined && (obj.pool_id = message.pool_id);
    message.swap_type_id !== undefined && (obj.swap_type_id = message.swap_type_id);
    message.offer_coin !== undefined &&
      (obj.offer_coin = message.offer_coin ? Coin.toJSON(message.offer_coin) : undefined);
    message.demand_coin_denom !== undefined && (obj.demand_coin_denom = message.demand_coin_denom);
    message.offer_coin_fee !== undefined &&
      (obj.offer_coin_fee = message.offer_coin_fee ? Coin.toJSON(message.offer_coin_fee) : undefined);
    message.order_price !== undefined && (obj.order_price = message.order_price);
    return obj;
  },

  fromPartial(object: DeepPartial<MsgSwapWithinBatch>): MsgSwapWithinBatch {
    const message = { ...baseMsgSwapWithinBatch } as MsgSwapWithinBatch;
    if (object.swap_requester_address !== undefined && object.swap_requester_address !== null) {
      message.swap_requester_address = object.swap_requester_address;
    } else {
      message.swap_requester_address = '';
    }
    if (object.pool_id !== undefined && object.pool_id !== null) {
      message.pool_id = object.pool_id;
    } else {
      message.pool_id = 0;
    }
    if (object.swap_type_id !== undefined && object.swap_type_id !== null) {
      message.swap_type_id = object.swap_type_id;
    } else {
      message.swap_type_id = 0;
    }
    if (object.offer_coin !== undefined && object.offer_coin !== null) {
      message.offer_coin = Coin.fromPartial(object.offer_coin);
    } else {
      message.offer_coin = undefined;
    }
    if (object.demand_coin_denom !== undefined && object.demand_coin_denom !== null) {
      message.demand_coin_denom = object.demand_coin_denom;
    } else {
      message.demand_coin_denom = '';
    }
    if (object.offer_coin_fee !== undefined && object.offer_coin_fee !== null) {
      message.offer_coin_fee = Coin.fromPartial(object.offer_coin_fee);
    } else {
      message.offer_coin_fee = undefined;
    }
    if (object.order_price !== undefined && object.order_price !== null) {
      message.order_price = object.order_price;
    } else {
      message.order_price = '';
    }
    return message;
  },
};

const baseMsgSwapWithinBatchResponse: object = {};

export const MsgSwapWithinBatchResponse = {
  encode(_: MsgSwapWithinBatchResponse, writer: Writer = Writer.create()): Writer {
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): MsgSwapWithinBatchResponse {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseMsgSwapWithinBatchResponse,
    } as MsgSwapWithinBatchResponse;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): MsgSwapWithinBatchResponse {
    const message = {
      ...baseMsgSwapWithinBatchResponse,
    } as MsgSwapWithinBatchResponse;
    return message;
  },

  toJSON(_: MsgSwapWithinBatchResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(_: DeepPartial<MsgSwapWithinBatchResponse>): MsgSwapWithinBatchResponse {
    const message = {
      ...baseMsgSwapWithinBatchResponse,
    } as MsgSwapWithinBatchResponse;
    return message;
  },
};

const baseMsgSwapWithinBatchSimpified: object = {
  swap_requester_address: "",
  demand_coin_denom: "",
  price: "",
};

export const MsgSwapWithinBatchSimpified = {
  typeUrl: '/dexilon_exchange.dexilonL2.liquidity.MsgSwapWithinBatchSimpified',
  encode(message: MsgSwapWithinBatchSimpified, writer: Writer = Writer.create()): Writer {
    if (message.swap_requester_address !== '') {
      writer.uint32(10).string(message.swap_requester_address);
    }
    if (message.offer_coin !== undefined) {
      Coin.encode(message.offer_coin, writer.uint32(18).fork()).ldelim();
    }
    if (message.demand_coin_denom !== '') {
      writer.uint32(26).string(message.demand_coin_denom);
    }
    if (message.price !== '') {
      writer.uint32(34).string(message.price);
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): MsgSwapWithinBatchSimpified {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseMsgSwapWithinBatchSimpified,
    } as MsgSwapWithinBatchSimpified;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.swap_requester_address = reader.string();
          break;
        case 2:
          message.offer_coin = Coin.decode(reader, reader.uint32());
          break;
        case 3:
          message.demand_coin_denom = reader.string();
          break;
        case 4:
          message.price = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgSwapWithinBatchSimpified {
    const message = {
      ...baseMsgSwapWithinBatchSimpified,
    } as MsgSwapWithinBatchSimpified;
    if (object.swap_requester_address !== undefined && object.swap_requester_address !== null) {
      message.swap_requester_address = String(object.swap_requester_address);
    } else {
      message.swap_requester_address = '';
    }
    if (object.offer_coin !== undefined && object.offer_coin !== null) {
      message.offer_coin = Coin.fromJSON(object.offer_coin);
    } else {
      message.offer_coin = undefined;
    }
    if (object.demand_coin_denom !== undefined && object.demand_coin_denom !== null) {
      message.demand_coin_denom = String(object.demand_coin_denom);
    } else {
      message.demand_coin_denom = '';
    }
    if (object.price !== undefined && object.price !== null) {
      message.price = String(object.price);
    } else {
      message.price = '';
    }
    return message;
  },

  toJSON(message: MsgSwapWithinBatchSimpified): unknown {
    const obj: any = {};
    message.swap_requester_address !== undefined && (obj.swap_requester_address = message.swap_requester_address);
    message.offer_coin !== undefined &&
      (obj.offer_coin = message.offer_coin ? Coin.toJSON(message.offer_coin) : undefined);
    message.demand_coin_denom !== undefined && (obj.demand_coin_denom = message.demand_coin_denom);
    message.price !== undefined && (obj.price = message.price);
    return obj;
  },

  fromPartial(object: DeepPartial<MsgSwapWithinBatchSimpified>): MsgSwapWithinBatchSimpified {
    const message = {
      ...baseMsgSwapWithinBatchSimpified,
    } as MsgSwapWithinBatchSimpified;
    if (object.swap_requester_address !== undefined && object.swap_requester_address !== null) {
      message.swap_requester_address = object.swap_requester_address;
    } else {
      message.swap_requester_address = '';
    }
    if (object.offer_coin !== undefined && object.offer_coin !== null) {
      message.offer_coin = Coin.fromPartial(object.offer_coin);
    } else {
      message.offer_coin = undefined;
    }
    if (object.demand_coin_denom !== undefined && object.demand_coin_denom !== null) {
      message.demand_coin_denom = object.demand_coin_denom;
    } else {
      message.demand_coin_denom = '';
    }
    if (object.price !== undefined && object.price !== null) {
      message.price = object.price;
    } else {
      message.price = '';
    }
    return message;
  },
};

if (util.Long !== Long) {
  util.Long = Long as any;
  configure();
}
