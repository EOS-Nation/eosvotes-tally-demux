import { Action } from "../demux-js";

export interface EosAuthorization {
  actor: string;
  permission: string;
}

export interface EosPayload<T = any> {
  account: string;
  actionIndex: number;
  authorization: EosAuthorization[];
  data: T;
  name: string;
  transactionId: string;
}

export interface EosAction extends Action {
  payload: EosPayload;
}
