import SocketServer from "./socket_server";

export class SymbolInfo {
  /**
   * 
   * @param event_name request for data to retrieve
   * @param symbol_name request particular symbol info
   */
  private static async get(event_name: string, symbol_name: string) {
    SocketServer.getInstance().send(
      JSON.stringify({ event: event_name, symbol_name: symbol_name })
    );
    let data = JSON.parse(await SocketServer.getInstance().receive());
    if (
      Object.keys(data).includes(event_name) &&
      data.symbol_name == symbol_name
    ) {
      return data[event_name];
    }
    return null;
  }

  /**
   * List all symbols that available on your broker
   */
  static async symbolList() {
    SocketServer.getInstance().send(JSON.stringify({ event: "symbol_list" }));
    let data = JSON.parse(await SocketServer.getInstance().receive());
    if (Object.keys(data).includes("symbol_list")) {
      return data.symbol_list;
    }
    return [];
  }

  /**
   * Number of deals in the current session
   * @param symbol_name Retrieve specific symbol information 
   */
  static async sessionDeals(symbol_name: string) {
    let data = await this.get("sess_deals", symbol_name);
    return data == null ? 0 : data;
  }

  /**
   * Number of Buy orders at the moment
   * @param symbol_name Retrieve specific symbol information 
   */
  static async sessionBuyOrders(symbol_name: string) {
    let data = await this.get("sess_buy_orders", symbol_name);
    return data == null ? 0 : data;
  }

  /**
   * Number of Sell orders at the moment
   * @param symbol_name Retrieve specific symbol information 
   */
  static async sessionSellOrders(symbol_name: string) {
    let data = await this.get("sess_sell_orders", symbol_name);
    return data == null ? 0 : data;
  }

  /**
   * Volume of the last deal
   * @param symbol_name Retrieve specific symbol information 
   */
  static async volume(symbol_name: string) {
    let data = await this.get("volume", symbol_name);
    return data == null ? 0 : data;
  }

  /**
   * Maximal day volume
   * @param symbol_name Retrieve specific symbol information 
   */
  static async volumeHigh(symbol_name: string) {
    let data = await this.get("volume_high", symbol_name);
    return data == null ? 0 : data;
  }

  /**
   * Minimal day volume
   * @param symbol_name Retrieve specific symbol information 
   */
  static async volumeLow(symbol_name: string) {
    let data = await this.get("volume_low", symbol_name);
    return data == null ? 0 : data;
  }

  /**
   * Time of the last quote
   * @param symbol_name Retrieve specific symbol information 
   */
  static async time(symbol_name: string) {
    let data = await this.get("time", symbol_name);
    return data == null ? "" : data;
  }

  /**
   * Digits after a decimal point
   * @param symbol_name Retrieve specific symbol information 
   */
  static async digits(symbol_name: string) {
    let data = await this.get("digits", symbol_name);
    return data == null ? 0 : data;
  }

  /**
   * Indication of a floating spread
   * @param symbol_name Retrieve specific symbol information 
   */
  static async isSpreadFloat(symbol_name: string) {
    let data = await this.get("is_spread_float", symbol_name);
    return data == null ? false : data;
  }

  /**
   * Spread value in points
   * @param symbol_name Retrieve specific symbol information 
   */
  static async spread(symbol_name: string) {
    let data = await this.get("spread", symbol_name);
    return data == null ? 0 : data;
  }

  /**
   * Maximal number of requests shown in Depth of Market.
   *  For symbols that have no queue of requests, the value is equal to zero.
   * @param symbol_name Retrieve specific symbol information 
   */
  static async tickBookdepth(symbol_name: string) {
    let data = await this.get("tick_bookdepth", symbol_name);
    return data == null ? 0 : data;
  }

  /**
   * Order execution type
   * @param symbol_name Retrieve specific symbol information 
   */
  static async tradeMode(symbol_name: string) {
    let data: SymbolTradeMode = await this.get(
      "symbol_trade_mode",
      symbol_name
    );
    return data == null ? SymbolTradeMode.DISABLED : data;
  }

  /**
   * Minimal indention in points from the current close price to place Stop orders
   * @param symbol_name Retrieve specific symbol information 
   */
  static async stopsLevel(symbol_name: string) {
    let data = await this.get("trade_stops_level", symbol_name);
    return data == null ? 0 : data;
  }

  /**
   * Distance to freeze trade operations in points
   * @param symbol_name Retrieve specific symbol information 
   */
  static async freezeLevel(symbol_name: string) {
    let data = await this.get("trade_freeze_level", symbol_name);
    return data == null ? 0 : data;
  }

  /**
   * Deal execution mode
   * @param symbol_name Retrieve specific symbol information 
   */
  static async tradeExecMode(symbol_name: string) {
    let data: SymbolTradeExecMode = await this.get(
      "trade_exec_mode",
      symbol_name
    );
    return data;
  }

  /**
   * Swap calculation model
   * @param symbol_name Retrieve specific symbol information 
   */
  static async swapMode(symbol_name: string) {
    let data: SymbolSwapMode = await this.get("swap_mode", symbol_name);
    return data;
  }

  /**
   * Ask - best buy offer
   * @param symbol_name Retrieve specific symbol information 
   */
  static async ask(symbol_name: string) {
    let data = await this.get("ask", symbol_name);
    return data;
  }

  /**
   * Bid - best sell offer
   * @param symbol_name Retrieve specific symbol information 
   */
  static async bid(symbol_name: string) {
    let data = await this.get("bid", symbol_name);
    return data;
  }

  /**
   * Symbol point value
   * @param symbol_name Retrieve specific symbol information 
   */
  static async point(symbol_name: string) {
    let data = await this.get("point", symbol_name);
    return data;
  }

  /**
   * Maximal volume for a deal
   * @param symbol_name Retrieve specific symbol information 
   */
  static async volumeMax(symbol_name: string) {
    let data = await this.get("vol_max", symbol_name);
    return data;
  }

  /**
   * Minimal volume for a deal
   * @param symbol_name Retrieve specific symbol information 
   */
  static async volumeMin(symbol_name: string) {
    let data = await this.get("vol_min", symbol_name);
    return data;
  }

  /**
   * Minimal volume change step for deal execution
   * @param symbol_name Retrieve specific symbol information 
   */
  static async volumeStep(symbol_name: string) {
    let data = await this.get("vol_step", symbol_name);
    return data;
  }

  /**
   * Long swap value
   * @param symbol_name Retrieve specific symbol information 
   */
  static async swapLong(symbol_name: string) {
    let data = await this.get("swap_long", symbol_name);
    return data;
  }

  /**
   * Short swap value
   * @param symbol_name Retrieve specific symbol information 
   */
  static async swapShort(symbol_name: string) {
    let data = await this.get("swap_short", symbol_name);
    return data;
  }

  /**
   * Basic currency of a symbol
   * @param symbol_name Retrieve specific symbol information 
   */
  static async currencyBase(symbol_name: string) {
    let data = await this.get("currency_base", symbol_name);
    return data;
  }

  /**
   * Profit currency
   * @param symbol_name Retrieve specific symbol information 
   */
  static async currencyQuote(symbol_name: string) {
    let data = await this.get("currency_quote", symbol_name);
    return data;
  }

  /**
   * Margin currency
   * @param symbol_name Retrieve specific symbol information 
   */
  static async currencyMargin(symbol_name: string) {
    let data = await this.get("currency_margin", symbol_name);
    return data;
  }

  /**
   * Feeder of the current quote
   * @param symbol_name Retrieve specific symbol information 
   */
  static async broker(symbol_name: string) {
    let data = await this.get("broker", symbol_name);
    return data;
  }

  /**
   * Symbol description
   * @param symbol_name Retrieve specific symbol information 
   */
  static async description(symbol_name: string) {
    let data = await this.get("description", symbol_name);
    return data;
  }
}

export enum SymbolTradeMode {
  FULL,
  LONG_ONLY,
  SHORT_ONLY,
  CLOSE_ONLY,
  DISABLED
}

export enum SymbolTradeExecMode {
  REQUEST,
  INSTANT,
  MARKET,
  EXCHANGE
}

export enum SymbolSwapMode {
  CURRENCY_DEPOSIT,
  CURRENCY_MARGIN,
  CURRENCY_SYMBOL,
  INTEREST_CURRENT,
  INTEREST_OPEN,
  POINTS,
  REOPEN_BID,
  REOPEN_CURRENT,
  DISABLED
}
