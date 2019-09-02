import SocketServer from "./socket_server";

/**
 *
 */
export class Event {
  private symbol?: string;
  private from_date?: Date;
  private to_date?: Date;
  private _timeframe?: Timeframe;
  private _historyBarCount?: number;
  private _historyTickCount?: number;

  selectSymbol(symbol_name: string) {
    this.symbol = symbol_name;
    return this;
  }

  /**
   * @param from_date this date can be used by retrieving bar_history
   * @returns Event is returned for build data flow for bar_history
   */
  fromDate(from_date: Date) {
    this.from_date = from_date;
    return this;
  }

  /**
   * @param to_date this date can be used by retrieving bar_history
   * @returns Event is returned for build data flow for bar_history
   */
  toDate(to_date: Date) {
    this.to_date = to_date;
    return this;
  }

  /**
   * @param timeframe Needs when onBar is called
   * @returns Event is returned for build data flow for onBarEvent
   */
  timeframe(timeframe: Timeframe) {
    this._timeframe = timeframe;
    return this;
  }

  /**
   *
   * @param history_bar_count When onBar event called this amount of bars will send to onBar event callbacks
   */
  historyBarCount(history_bar_count: number) {
    this._historyBarCount = history_bar_count;
    return this;
  }

  /**
   *
   * @param history_tick_count when onTick event called this amount of ticks will send to onTick event callbacks
   */
  historyTickCount(history_tick_count: number) {
    this._historyTickCount = history_tick_count;
    return this;
  }

  /**
   * Convert Javascript date to Mql5 date
   * @param date JavaScript date
   */
  private jsDateToMqlDate(date: Date) {
    return (
      date.getFullYear() +
      "." +
      ((date.getMonth() < 10 ? "0" : "") + (date.getMonth() + 1)) +
      "." +
      ((date.getDate() < 10 ? "0" : "") + date.getDate()) +
      " " +
      ((date.getHours() < 10 ? "0" : "") + date.getHours()) +
      ":" +
      ((date.getMinutes() < 10 ? "0" : "") + date.getMinutes()) +
      ":00"
    );
  }

  /**
   * Get price history bars - requires
   *    1. symbol name
   *    2. timeframe
   *    3. from date
   *    4. to date
   */
  async getBars() {
    if (this.symbol == undefined || this.symbol == null) {
      throw new Error("selectSymbol is undefined or null");
    }
    if (this._timeframe == undefined || this._timeframe == null) {
      throw new Error("timeframe is undefined or null");
    }
    if (this.from_date == undefined || this.from_date == null) {
      throw new Error("fromDate is undefined or null");
    }
    if (this.to_date == undefined || this.to_date == null) {
      throw new Error("toDate is undefined or null");
    }
    let from_date = new Date(this.from_date!);
    let to_date = new Date(this.from_date!);
    to_date.setDate(from_date.getDate() + 22);
    if (to_date > this.to_date!) {
      to_date = new Date(this.to_date!);
    }
    let bar_data: Bar[] = [];
    while (true) {
      let send_data = JSON.stringify({
        event: "bar_history",
        symbol_name: this.symbol,
        timeframe: this._timeframe,
        from_date: this.jsDateToMqlDate(from_date),
        to_date: this.jsDateToMqlDate(to_date)
      });
      SocketServer.getInstance().send(send_data);
      let result = JSON.parse(await SocketServer.getInstance().receive());
      if (
        Object.keys(result).includes("bar_history") &&
        result.bar_history != null
      ) {
        let tmp_data: Bar[] = result.bar_history;
        tmp_data.forEach((bar: Bar) => {
          bar_data.push(bar);
        });
      }
      if (to_date >= this.to_date!) {
        break;
      }
      from_date = new Date(to_date);
      to_date.setDate(from_date.getDate() + 22);
      if (to_date > this.to_date!) {
        to_date = this.to_date!;
      }
    }
    return bar_data;
  }

  /**
   * onBar event called when a new bar is formed using your specified parameters - requires
   *    1. symbol name
   *    2. timeframe
   *    3. history bar count
   * @param on_bar_callback when a new bar is formed this callback will be called with amount of history bars you specified
   */
  onBar(on_bar_callback: (bars: Bar[]) => void) {
    SocketServer.getInstance().send(
      JSON.stringify({
        event: "bar_event_sub",
        symbol_name: this.symbol,
        timeframe: this._timeframe,
        history_count: this._historyBarCount
      })
    );
    let event_name =
      this.symbol + "_" + this._timeframe + "_" + this._historyBarCount;
    SocketServer.getInstance().subscribe(event_name);
    SocketServer.getInstance().onEvent(event_name, (datas: string) => {
      let bars_res: Bar[] = JSON.parse(datas)[event_name];
      on_bar_callback(bars_res);
    });
    return this;
  }

  /**
   * onTick event will called when a new tick is found - requires
   *    1. symbol name
   *    2. history tick count
   * @param on_tick_callback when a new tick is found this callback will be called with amount of tick history you specified
   */
  onTick(on_tick_callback: (ticks: Tick[]) => void) {
    SocketServer.getInstance().send(
      JSON.stringify({
        event: "tick_event_sub",
        symbol_name: this.symbol,
        history_count: this._historyTickCount
      })
    );
    let event_name = this.symbol + "_" + this._historyTickCount;
    SocketServer.getInstance().subscribe(event_name);
    SocketServer.getInstance().onEvent(event_name, (datas: string) => {
      let ticks_res: Tick[] = JSON.parse(datas)[event_name];
      on_tick_callback(ticks_res);
    });
    return this;
  }

  /**
   * If onBar event is not needed anymore than unsubscribe it
   */
  unsubscribeOnBarEvent() {
    SocketServer.getInstance().send(
      JSON.stringify({
        event: "bar_event_unsub",
        symbol_name: this.symbol,
        timeframe: this._timeframe,
        history_count: this._historyBarCount
      })
    );
    SocketServer.getInstance().unsubscribe(
      this.symbol + "_" + this._timeframe + "_" + this._historyBarCount
    );
  }

  /**
   * If onTick event is not needed anymore than unsubsribe it
   */
  unsubscribeOnTickEvent() {
    SocketServer.getInstance().send(
      JSON.stringify({
        event: "ticket_event_unsub",
        symbol_name: this.symbol,
        history_count: this._historyTickCount
      })
    );
    SocketServer.getInstance().unsubscribe(
      this.symbol + "_" + this._historyTickCount
    );
  }
}

export enum Timeframe {
  M1 = "M1",
  M2 = "M2",
  M3 = "M3",
  M4 = "M4",
  M5 = "M5",
  M6 = "M6",
  M10 = "M10",
  M12 = "M12",
  M15 = "M15",
  M20 = "M20",
  M30 = "M30",
  H1 = "H1",
  H2 = "H2",
  H3 = "H3",
  H4 = "H4",
  H6 = "H6",
  H8 = "H8",
  H12 = "H12",
  D1 = "D1",
  W1 = "W1",
  MN1 = "MN1"
}

export interface Bar {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  spread: number;
}

export interface Tick {
  ask: number;
  bid: number;
  flags: TickFlag;
  last: number;
  time: string;
  time_msc: number;
  volume: number;
}

export enum TickFlag {
  ASK = "ASK",
  BID = "BID",
  BUY = "BUY",
  SELL = "SELL",
  LAST = "LAST",
  VOLUME = "VOLUME",
  NONE = "NONE"
}
