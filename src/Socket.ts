import { EventEmitter } from "events";

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Minimal WebSocket interface compatible with both DOM and Cloudflare Workers. */
interface WebSocketLike {
  send(data: string): void;
  close(code?: number, reason?: string): void;
  onopen: ((ev: any) => void) | null;
  onclose: ((ev: any) => void) | null;
  onerror: ((ev: any) => void) | null;
  onmessage: ((ev: any) => void) | null;
}

export type SocketClient<ClientEM extends {} = {}, ServerEM extends {} = {}> = {
  websocket?: WebSocketLike;
  emitter: EventEmitter;
  state: "connecting" | "connected" | "disconnected" | "destroyed";
  onReconnected?: () => void;
  destroy(): void;
  connect(): Promise<void>;
  on: <E extends keyof ClientEM>(event: E, ln: (payload: ClientEM[E]) => void) => void;
  once: <E extends keyof ClientEM>(event: E, ln: (payload: ClientEM[E]) => void) => void;
  off: <E extends keyof ClientEM>(event: E, ln: (payload: ClientEM[E]) => void) => void;
  addListener: <E extends keyof ClientEM>(event: E, ln: (payload: ClientEM[E]) => void) => void;
  removeListener: <E extends keyof ClientEM>(event: E, ln: (payload: ClientEM[E]) => void) => void;
  emit: <E extends keyof ServerEM>(event: E, payload: ServerEM[E]) => void;
};

export class Socket {
  websocket?: WebSocketLike;
  wsUrl: string;

  state: "connecting" | "connected" | "disconnected" | "destroyed" = "disconnected";

  _firstConnect = true;
  onReconnected?: () => void;

  constructor(
    public emitter: EventEmitter,
    baseUrl: string,
    route: string,
    query?: Record<string, string>,
  ) {
    let url = baseUrl.replace("http", "ws") + route;
    const _query: Record<string, string> = {};
    if (query) {
      Object.keys(query).forEach((key) => {
        if (query[key] !== undefined) {
          _query[key] = query[key];
        }
      });
    }
    if (Object.keys(_query).length > 0) {
      const queryString = new URLSearchParams(_query).toString();
      url += "?" + queryString;
    }
    this.wsUrl = url;
    this.connect();
  }

  private _createWs(onSuccess: () => void, onError: () => void) {
    const ws = new WebSocket(this.wsUrl) as unknown as WebSocketLike;
    this.websocket = ws;
    this.state = "connecting";
    ws.onopen = () => {
      this.state = "connected";
      onSuccess();
      if (this._firstConnect) {
        this.emitter.emit("__firstConnect");
        this._firstConnect = false;
      }
    };
    ws.onerror = () => {
      if (this.state === "destroyed") return;
      this.state = "disconnected";
      this.websocket = undefined;
      onError();
    };
    ws.onmessage = (message: { data: any }) => {
      const value = JSON.parse(message.data as string);
      this.emitter.emit(value.type, value.payload);
    };
    ws.onclose = () => {
      if (this.state === "destroyed") return;
      this.state = "disconnected";
      this.websocket = undefined;
      onError();
    };
  }

  connect() {
    return new Promise<void>((resolve) => {
      if (this.state === "connecting") {
        this.emitter.once("__firstConnect", () => resolve());
      } else {
        this.emitter.once("__firstConnect", () => resolve());
        this._createWs(
          () => {},
          async () => {
            await sleep(200);
            this.connect();
          },
        );
      }
    });
  }

  async emit(eventName: string, payload: any) {
    if (this.state !== "connected") {
      await this.connect();
    }
    const message = JSON.stringify({ type: eventName, payload });
    this.websocket?.send(message);
    this.emitter.emit(eventName, payload);
  }

  on(eventName: string, listener: (data: any) => void) {
    this.emitter.on(eventName, listener);
  }

  off(eventName: string, listener: (data: any) => void) {
    this.emitter.off(eventName, listener);
  }

  once(eventName: string, listener: (data: any) => void) {
    this.emitter.once(eventName, listener);
  }

  addListener(eventName: string, listener: (data: any) => void) {
    this.emitter.addListener(eventName, listener);
  }

  removeListener(eventName: string, listener: (data: any) => void) {
    this.emitter.removeListener(eventName, listener);
  }

  destroy() {
    this.state = "destroyed";
    this.emitter.removeAllListeners();
    this.websocket?.close();
    this.websocket = undefined;
  }
}
