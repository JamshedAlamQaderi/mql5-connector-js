import { socket, Socket } from "zeromq";

export default class SocketServer {
  private static instance: SocketServer;
  private pushAddress: string = "";
  private pullAddress: string = "";
  private subAddress: string = "";
  private pushSocket: Socket = socket("push");
  private pullSocket: Socket = socket("pull");
  private subSocket: Socket = socket("sub");
  private connected: boolean = false;
  private msg: string = "";
  private timeout_ms: number = 1000;
  private event_callbacks: Map<string, any> = new Map();

  private constructor(
    protocol: string,
    hostname: string,
    push_port: number,
    pull_port: number,
    sub_port: number,
    timeout_ms: number
  ) {
    this.pushAddress = protocol + "://" + hostname + ":" + push_port;
    this.pullAddress = protocol + "://" + hostname + ":" + pull_port;
    this.subAddress = protocol + "://" + hostname + ":" + sub_port;
    this.timeout_ms = timeout_ms;
  }

  static getInstance(
    protocol = "tcp",
    hostname = "127.0.0.1",
    push_port = 3033,
    pull_port = 3034,
    sub_port = 3035,
    timeout_ms = 1000
  ): SocketServer {
    if (this.instance == null) {
      SocketServer.instance = new SocketServer(
        protocol,
        hostname,
        push_port,
        pull_port,
        sub_port,
        timeout_ms
      );
    }
    return this.instance;
  }

  connect() {
    this.pushSocket.connect(this.pushAddress);
    this.pullSocket.connect(this.pullAddress);
    this.subSocket.connect(this.subAddress);
    this.connected = true;
    this.pullSocket.on("message", (msg: string) => {
      this.msg = msg.toString();
    });

    this.subSocket.on("message", (data: string) => {
      let event_name = data.toString().substring(0, data.indexOf(" "));
      let datas = data.toString().substring(event_name.length + 1, data.length);
      if (this.event_callbacks.has(event_name)) {
        this.event_callbacks.get(event_name)(datas);
      }
    });
  }

  send(msg: string) {
    this.pushSocket.send(msg);
  }

  subscribe(event_name: string) {
    this.subSocket.subscribe(event_name);
  }

  unsubscribe(event_name: string) {
    this.subSocket.unsubscribe(event_name);
    if (this.event_callbacks.has(event_name)) {
      this.event_callbacks.delete(event_name);
    }
  }

  onEvent(event_name: string, listener: (...args: any[]) => void) {
    this.event_callbacks.set(event_name, listener);
  }

  receive() {
    let start_time_ms = Date.now();
    return new Promise<string>((resolve, reject) => {
      let interval = setInterval(() => {
        if (this.msg.length > 0) {
          resolve(this.msg);
          this.msg = "";
          clearInterval(interval);
        }
        if (Date.now() >= start_time_ms + this.timeout_ms) {
          resolve("{}");
          this.msg = "";
          clearInterval(interval);
        }
      }, 1);
    });
  }

  isConnected(): boolean {
    return this.connected;
  }
}
