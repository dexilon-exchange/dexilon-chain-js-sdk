/* eslint-disable */
import { Reader, Writer } from 'protobufjs/minimal';
import { DeepPartial } from '../common/common';

export const protobufPackage = 'smartarbitrage.dexilonL2.withdraw';
export interface MsgWithdrawTransaction {
  creator: string;
  denom: string;
  amount: string;
  chainId: number;
}

const baseMsgWithdrawTransaction: object = {
  creator: '',
  denom: '',
  amount: '',
  chainId: 0,
};

export const MsgWithdrawTransaction = {
  typeUrl: '/dexilon_exchange.dexilonL2.ethereumbridge.MsgWithdrawTransaction',

  encode(message: MsgWithdrawTransaction, writer: Writer = Writer.create()): Writer {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.denom !== '') {
      writer.uint32(18).string(message.denom);
    }
    if (message.amount !== '') {
      writer.uint32(26).string(message.amount);
    }
    if (message.chainId !== 0) {
      writer.uint32(32).int32(message.chainId);
    }
    return writer;
  },

  decode(input: Reader | Uint8Array, length?: number): MsgWithdrawTransaction {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = { ...baseMsgWithdrawTransaction } as MsgWithdrawTransaction;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.denom = reader.string();
          break;
        case 3:
          message.amount = reader.string();
          break;
        case 4:
          message.chainId = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): MsgWithdrawTransaction {
    const message = { ...baseMsgWithdrawTransaction } as MsgWithdrawTransaction;
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = String(object.creator);
    } else {
      message.creator = '';
    }
    if (object.denom !== undefined && object.denom !== null) {
      message.denom = String(object.denom);
    } else {
      message.denom = '';
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = String(object.amount);
    } else {
      message.amount = '';
    }
    if (object.chainId !== undefined && object.chainId !== null) {
      message.chainId = Number(object.chainId);
    } else {
      message.chainId = 0;
    }
    return message;
  },

  toJSON(message: MsgWithdrawTransaction): unknown {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.denom !== undefined && (obj.denom = message.denom);
    message.amount !== undefined && (obj.amount = message.amount);
    message.chainId !== undefined && (obj.chainId = message.chainId);
    return obj;
  },

  fromPartial(object: DeepPartial<MsgWithdrawTransaction>): MsgWithdrawTransaction {
    const message = { ...baseMsgWithdrawTransaction } as MsgWithdrawTransaction;
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = object.creator;
    } else {
      message.creator = '';
    }
    if (object.denom !== undefined && object.denom !== null) {
      message.denom = object.denom;
    } else {
      message.denom = '';
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = object.amount;
    } else {
      message.amount = '';
    }
    if (object.chainId !== undefined && object.chainId !== null) {
      message.chainId = object.chainId;
    } else {
      message.chainId = 0;
    }
    return message;
  },
};
