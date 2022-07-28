/* eslint-disable */
import { Reader, util, configure, Writer } from 'protobufjs/minimal';
import Long from 'long';
import { DeepPartial } from './common';

export const registrationModuleProtobufPackage = 'smartarbitrage.dexilonl2.registration';

export class MsgCreateAddressMapping {
  creator: string;
  chainId: number;
  address: string;

  private base: object = {
    creator: '',
    chainId: 0,
    address: '',
  };

  encode(message: MsgCreateAddressMapping, writer: Writer = Writer.create()): Writer {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.chainId !== 0) {
      writer.uint32(16).int32(message.chainId);
    }
    if (message.address !== '') {
      writer.uint32(26).string(message.address);
    }
    return writer;
  }

  decode(input: Reader | Uint8Array, length?: number): MsgCreateAddressMapping {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...this.base,
    } as MsgCreateAddressMapping;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.chainId = reader.int32();
          break;
        case 3:
          message.address = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  }

  fromJSON(object: any): MsgCreateAddressMapping {
    const message = {
      ...this.base,
    } as MsgCreateAddressMapping;
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = String(object.creator);
    } else {
      message.creator = '';
    }
    if (object.chainId !== undefined && object.chainId !== null) {
      message.chainId = Number(object.chainId);
    } else {
      message.chainId = 0;
    }
    if (object.address !== undefined && object.address !== null) {
      message.address = String(object.address);
    } else {
      message.address = '';
    }
    return message;
  }

  toJSON(message: MsgCreateAddressMapping): any {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.chainId !== undefined && (obj.chainId = message.chainId);
    message.address !== undefined && (obj.address = message.address);
    return obj;
  }

  fromPartial(object: DeepPartial<MsgCreateAddressMapping>): MsgCreateAddressMapping {
    const message = {
      ...this.base,
    } as MsgCreateAddressMapping;
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = object.creator;
    } else {
      message.creator = '';
    }
    if (object.chainId !== undefined && object.chainId !== null) {
      message.chainId = object.chainId;
    } else {
      message.chainId = 0;
    }
    if (object.address !== undefined && object.address !== null) {
      message.address = object.address;
    } else {
      message.address = '';
    }
    return message;
  }
}

export class MsgGrantPermissionRequest {
  creator: string;
  granterEthAddress: string;
  signature: string;
  signedMessage: string;
  expirationTime: number;

  private base = {
    creator: '',
    granterEthAddress: '',
    signature: '',
    signedMessage: '',
    expirationTime: 0,
  };

  encode(message: MsgGrantPermissionRequest, writer: Writer = Writer.create()): Writer {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.granterEthAddress !== '') {
      writer.uint32(18).string(message.granterEthAddress);
    }
    if (message.signature !== '') {
      writer.uint32(26).string(message.signature);
    }
    if (message.signedMessage !== '') {
      writer.uint32(34).string(message.signedMessage);
    }
    if (message.expirationTime !== 0) {
      writer.uint32(40).uint64(message.expirationTime);
    }
    return writer;
  }

  decode(input: Reader | Uint8Array, length?: number): MsgGrantPermissionRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...this.base,
    } as MsgGrantPermissionRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.granterEthAddress = reader.string();
          break;
        case 3:
          message.signature = reader.string();
          break;
        case 4:
          message.signedMessage = reader.string();
          break;
        case 5:
          message.expirationTime = longToNumber(reader.uint64() as Long);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  }

  fromJSON(object: any): MsgGrantPermissionRequest {
    const message = {
      ...this.base,
    } as MsgGrantPermissionRequest;
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = String(object.creator);
    } else {
      message.creator = '';
    }
    if (object.granterEthAddress !== undefined && object.granterEthAddress !== null) {
      message.granterEthAddress = String(object.granterEthAddress);
    } else {
      message.granterEthAddress = '';
    }
    if (object.signature !== undefined && object.signature !== null) {
      message.signature = String(object.signature);
    } else {
      message.signature = '';
    }
    if (object.signedMessage !== undefined && object.signedMessage !== null) {
      message.signedMessage = String(object.signedMessage);
    } else {
      message.signedMessage = '';
    }
    if (object.expirationTime !== undefined && object.expirationTime !== null) {
      message.expirationTime = Number(object.expirationTime);
    } else {
      message.expirationTime = 0;
    }
    return message;
  }

  toJSON(message: MsgGrantPermissionRequest): unknown {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.granterEthAddress !== undefined && (obj.granterEthAddress = message.granterEthAddress);
    message.signature !== undefined && (obj.signature = message.signature);
    message.signedMessage !== undefined && (obj.signedMessage = message.signedMessage);
    message.expirationTime !== undefined && (obj.expirationTime = message.expirationTime);
    return obj;
  }

  fromPartial(object: DeepPartial<MsgGrantPermissionRequest>): MsgGrantPermissionRequest {
    const message = {
      ...this.base,
    } as MsgGrantPermissionRequest;
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = object.creator;
    } else {
      message.creator = '';
    }
    if (object.granterEthAddress !== undefined && object.granterEthAddress !== null) {
      message.granterEthAddress = object.granterEthAddress;
    } else {
      message.granterEthAddress = '';
    }
    if (object.signature !== undefined && object.signature !== null) {
      message.signature = object.signature;
    } else {
      message.signature = '';
    }
    if (object.signedMessage !== undefined && object.signedMessage !== null) {
      message.signedMessage = object.signedMessage;
    } else {
      message.signedMessage = '';
    }
    if (object.expirationTime !== undefined && object.expirationTime !== null) {
      message.expirationTime = object.expirationTime;
    } else {
      message.expirationTime = 0;
    }
    return message;
  }
}

export class MsgRevokePermissionRequest {
  creator: string;
  granterEthAddress: string;
  signature: string;
  signedMessage: string;

  private base = { creator: '', granterEthAddress: '', signature: '', signedMessage: '' };

  encode(message: MsgRevokePermissionRequest, writer: Writer = Writer.create()): Writer {
    if (message.creator !== '') {
      writer.uint32(10).string(message.creator);
    }
    if (message.granterEthAddress !== '') {
      writer.uint32(18).string(message.granterEthAddress);
    }
    if (message.signature !== '') {
      writer.uint32(26).string(message.signature);
    }
    if (message.signedMessage !== '') {
      writer.uint32(34).string(message.signedMessage);
    }
    return writer;
  }

  decode(input: Reader | Uint8Array, length?: number): MsgRevokePermissionRequest {
    const reader = input instanceof Uint8Array ? new Reader(input) : input;
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = {
      ...this.base,
    } as MsgRevokePermissionRequest;
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.creator = reader.string();
          break;
        case 2:
          message.granterEthAddress = reader.string();
          break;
        case 3:
          message.signature = reader.string();
          break;
        case 4:
          message.signedMessage = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  }

  fromJSON(object: any): MsgRevokePermissionRequest {
    const message = {
      ...this.base,
    } as MsgRevokePermissionRequest;
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = String(object.creator);
    } else {
      message.creator = '';
    }
    if (object.granterEthAddress !== undefined && object.granterEthAddress !== null) {
      message.granterEthAddress = String(object.granterEthAddress);
    } else {
      message.granterEthAddress = '';
    }
    if (object.signature !== undefined && object.signature !== null) {
      message.signature = String(object.signature);
    } else {
      message.signature = '';
    }
    if (object.signedMessage !== undefined && object.signedMessage !== null) {
      message.signedMessage = String(object.signedMessage);
    } else {
      message.signedMessage = '';
    }
    return message;
  }

  toJSON(message: MsgRevokePermissionRequest): unknown {
    const obj: any = {};
    message.creator !== undefined && (obj.creator = message.creator);
    message.granterEthAddress !== undefined && (obj.granterEthAddress = message.granterEthAddress);
    message.signature !== undefined && (obj.signature = message.signature);
    message.signedMessage !== undefined && (obj.signedMessage = message.signedMessage);
    return obj;
  }

  fromPartial(object: DeepPartial<MsgRevokePermissionRequest>): MsgRevokePermissionRequest {
    const message = {
      ...this.base,
    } as MsgRevokePermissionRequest;
    if (object.creator !== undefined && object.creator !== null) {
      message.creator = object.creator;
    } else {
      message.creator = '';
    }
    if (object.granterEthAddress !== undefined && object.granterEthAddress !== null) {
      message.granterEthAddress = object.granterEthAddress;
    } else {
      message.granterEthAddress = '';
    }
    if (object.signature !== undefined && object.signature !== null) {
      message.signature = object.signature;
    } else {
      message.signature = '';
    }
    if (object.signedMessage !== undefined && object.signedMessage !== null) {
      message.signedMessage = object.signedMessage;
    } else {
      message.signedMessage = '';
    }
    return message;
  }
}

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error('Value is larger than Number.MAX_SAFE_INTEGER');
  }
  return long.toNumber();
}

if (util.Long !== Long) {
  util.Long = Long as any;
  configure();
}
