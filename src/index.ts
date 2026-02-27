import Type, { Static, TObject } from "typebox";

type ApiMap = Record<string, { input?: TObject; output?: TObject }>;
export const defineApiMap = <T extends ApiMap>(api: T) => {
  return api;
};

export type StreamRequiredEvents = { end: TObject; error: TObject<{ message: Type.TString }> };
type StreamMap = Record<string, { input?: TObject; events?: { [key: string]: TObject } & StreamRequiredEvents }>;
export const defineStreamMap = <T extends StreamMap>(stream: T) => {
  return stream;
};

type SocketMap = Record<string, { client?: Record<string, TObject>; server?: Record<string, TObject> }>;
export const defineSocketMap = <T extends SocketMap>(socket: T) => {
  return socket;
};

export class Contract<
  TApiMap extends ApiMap = {},
  TStreamMap extends StreamMap = {},
  TSocketMap extends SocketMap = {},
> {
  apiMap: Record<string, { input?: TObject; output?: TObject }> = {};
  streamMap: Record<string, { input?: TObject; events?: { [key: string]: TObject } & StreamRequiredEvents }> = {};
  socketMap: Record<string, { client?: Record<string, TObject>; server?: Record<string, TObject> }> = {};

  api<T extends ApiMap>(apiMap: T) {
    this.apiMap = apiMap;
    return this as Contract<T, TStreamMap, TSocketMap>;
  }

  stream<T extends StreamMap>(streamMap: T) {
    this.streamMap = streamMap;
    return this as Contract<TApiMap, T, TSocketMap>;
  }

  socket<T extends SocketMap>(socketMap: T) {
    this.socketMap = socketMap;
    return this as Contract<TApiMap, TStreamMap, T>;
  }
}

export type StaticApiMap<T extends Contract> =
  T extends Contract<infer ApiMap>
    ? {
        [key in keyof ApiMap]: {
          input: ApiMap[key]["input"] extends TObject ? Static<ApiMap[key]["input"]> : undefined;
          output: ApiMap[key]["output"] extends TObject ? Static<ApiMap[key]["output"]> : undefined;
        };
      }
    : {};

export type StaticStreamMap<T extends Contract> =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  T extends Contract<infer _ApiMap, infer StreamMap>
    ? {
        [key in keyof StreamMap]: {
          input: StreamMap[key]["input"] extends TObject ? Static<StreamMap[key]["input"]> : undefined;
          events: StreamMap[key]["events"] extends Record<string, TObject>
            ? { [eventName in keyof StreamMap[key]["events"]]: Static<StreamMap[key]["events"][eventName]> }
            : undefined;
        };
      }
    : {};

export type StaticSocketMap<T extends Contract> =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  T extends Contract<infer _ApiMap, infer _StreamMap, infer SocketMap>
    ? {
        [key in keyof SocketMap]: {
          client: SocketMap[key]["client"] extends Record<string, TObject>
            ? { [eventName in keyof SocketMap[key]["client"]]: Static<SocketMap[key]["client"][eventName]> }
            : undefined;
          server: SocketMap[key]["server"] extends Record<string, TObject>
            ? { [eventName in keyof SocketMap[key]["server"]]: Static<SocketMap[key]["server"][eventName]> }
            : undefined;
        };
      }
    : {};

export * from "./Socket";
