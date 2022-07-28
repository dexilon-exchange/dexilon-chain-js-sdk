import { StdFee } from "@cosmjs/stargate";

type Builtin = Date | Function | Uint8Array | string | number | undefined;
export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;


export abstract class Msg {
  typeUrl: string;
  value: any;
}

export interface Tx {
  sender: string;
  msgs: Msg[];
  fee: StdFee;
  memo: string;
}
