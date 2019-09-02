import SocketServer from "./socket_server";

export interface Config {
  protocol: string;
  host_ip: string;
  port1: number;
  port2: number;
  port3: number;
  timeout_ms: number;
}

export class ConfigContext {
  private config: Config;
  constructor(
    config: Config = {
      protocol: "tcp",
      host_ip: "127.0.0.1",
      port1: 3033,
      port2: 3034,
      port3: 3035,
      timeout_ms: 1000
    }
  ) {
    this.config = config;
  }

  init() {
    SocketServer.getInstance(
      this.config.protocol,
      this.config.host_ip,
      this.config.port1,
      this.config.port2,
      this.config.port3,
      this.config.timeout_ms
    ).connect();
  }
}
