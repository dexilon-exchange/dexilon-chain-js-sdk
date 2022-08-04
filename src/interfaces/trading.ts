/* eslint-disable */
import { Reader, Writer } from 'protobufjs/minimal';
import { DeepPartial } from './common';

export interface DepositTradingBalanceRequest {
  accountAddress: string;
  balance: string;
  asset: string;
}

export interface WithdrawTradingBalanceRequest {
  accountAddress: string;
  balance: string;
  asset: string;
}

const baseDepositTradingBalanceRequest: object = {
  accountAddress: '',
  balance: '',
  asset: '',
};

export const DepositTradingBalanceRequest = {
  typeUrl: '/dexilon_exchange.dexilonL2.trading.DepositTradingBalanceRequest',
  encode(message: DepositTradingBalanceRequest, writer: Writer = Writer.create()): Writer {
    if (message.accountAddress !== '') {
      writer.uint32(10).string(message.accountAddress);
    }
    if (message.balance !== '') {
      writer.uint32(18).string(message.balance);
    }
    if (message.asset !== '') {
      writer.uint32(26).string(message.asset);
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): DepositTradingBalanceRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseDepositTradingBalanceRequest,
    } as DepositTradingBalanceRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.accountAddress = reader.string();
          break;
        case 2:
          message.balance = reader.string();
          break;
        case 3:
          message.asset = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DepositTradingBalanceRequest {
    const message = {
      ...baseDepositTradingBalanceRequest,
    } as DepositTradingBalanceRequest;
    if (object.accountAddress !== undefined && object.accountAddress !== null) {
      message.accountAddress = String(object.accountAddress);
    } else {
      message.accountAddress = '';
    }
    if (object.balance !== undefined && object.balance !== null) {
      message.balance = String(object.balance);
    } else {
      message.balance = '';
    }
    if (object.asset !== undefined && object.asset !== null) {
      message.asset = String(object.asset);
    } else {
      message.asset = '';
    }
    return message;
  },

  toJSON(message: DepositTradingBalanceRequest): unknown {
    const obj: any = {};
    message.accountAddress !== undefined && (obj.accountAddress = message.accountAddress);
    message.balance !== undefined && (obj.balance = message.balance);
    message.asset !== undefined && (obj.asset = message.asset);
    return obj;
  },

  fromPartial(object: DeepPartial<DepositTradingBalanceRequest>): DepositTradingBalanceRequest {
    const message = {
      ...baseDepositTradingBalanceRequest,
    } as DepositTradingBalanceRequest;
    if (object.accountAddress !== undefined && object.accountAddress !== null) {
      message.accountAddress = object.accountAddress;
    } else {
      message.accountAddress = '';
    }
    if (object.balance !== undefined && object.balance !== null) {
      message.balance = object.balance;
    } else {
      message.balance = '';
    }
    if (object.asset !== undefined && object.asset !== null) {
      message.asset = object.asset;
    } else {
      message.asset = '';
    }
    return message;
  },
};

const baseWithdrawTradingBalanceRequest: object = {
  accountAddress: '',
  balance: '',
  asset: '',
};

export const WithdrawTradingBalanceRequest = {
  typeUrl: '/dexilon_exchange.dexilonL2.trading.WithdrawTradingBalanceRequest',

  encode(message: WithdrawTradingBalanceRequest, writer: Writer = Writer.create()): Writer {
    if (message.accountAddress !== '') {
      writer.uint32(10).string(message.accountAddress);
    }
    if (message.balance !== '') {
      writer.uint32(18).string(message.balance);
    }
    if (message.asset !== '') {
      writer.uint32(26).string(message.asset);
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): WithdrawTradingBalanceRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...baseWithdrawTradingBalanceRequest,
    } as WithdrawTradingBalanceRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.accountAddress = reader.string();
          break;
        case 2:
          message.balance = reader.string();
          break;
        case 3:
          message.asset = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): WithdrawTradingBalanceRequest {
    const message = {
      ...baseWithdrawTradingBalanceRequest,
    } as WithdrawTradingBalanceRequest;
    if (object.accountAddress !== undefined && object.accountAddress !== null) {
      message.accountAddress = String(object.accountAddress);
    } else {
      message.accountAddress = '';
    }
    if (object.balance !== undefined && object.balance !== null) {
      message.balance = String(object.balance);
    } else {
      message.balance = '';
    }
    if (object.asset !== undefined && object.asset !== null) {
      message.asset = String(object.asset);
    } else {
      message.asset = '';
    }
    return message;
  },

  toJSON(message: WithdrawTradingBalanceRequest): unknown {
    const obj: any = {};
    message.accountAddress !== undefined && (obj.accountAddress = message.accountAddress);
    message.balance !== undefined && (obj.balance = message.balance);
    message.asset !== undefined && (obj.asset = message.asset);
    return obj;
  },

  fromPartial(object: DeepPartial<WithdrawTradingBalanceRequest>): WithdrawTradingBalanceRequest {
    const message = {
      ...baseWithdrawTradingBalanceRequest,
    } as WithdrawTradingBalanceRequest;
    if (object.accountAddress !== undefined && object.accountAddress !== null) {
      message.accountAddress = object.accountAddress;
    } else {
      message.accountAddress = '';
    }
    if (object.balance !== undefined && object.balance !== null) {
      message.balance = object.balance;
    } else {
      message.balance = '';
    }
    if (object.asset !== undefined && object.asset !== null) {
      message.asset = object.asset;
    } else {
      message.asset = '';
    }
    return message;
  },
};
