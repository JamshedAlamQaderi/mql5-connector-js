import { SymbolInfo } from "./symbol_info";
import SocketServer from "./socket_server";

export class Trade {
  private _magic_number?: number;
  private _slippage?: number;
  private _lot_size?: number;
  private _symbol?: string;
  private _price?: number;
  private _price_latest?: string;
  private _tp_pips?: number;
  private _sl_pips?: number;
  private _tp_price?: number;
  private _sl_price?: number;
  private _comment?: string;

  /**
   * @param magic_number Magic number of a trade
   */
  magic(magic_number: number) {
    this._magic_number = magic_number;
    return this;
  }

  /**
   * @returns current magic number of this trade builder
   */
  getMagic() {
    return this._magic_number;
  }

  /**
   *
   * @param slippage_in_points buffer size of a trade when price slip to this range then trade will execute
   */
  slippage(slippage_in_points: number) {
    this._slippage = slippage_in_points;
    return this;
  }
  /**
   * @returns current slippage of this trade builder
   */
  getSlippage() {
    return this._slippage;
  }

  /**
   *
   * @param lot_size Trade volume size
   */
  lotSize(lot_size: number) {
    this._lot_size = lot_size;
    return this;
  }

  /**
   * @returns volume size
   */
  getLotSize() {
    return this._lot_size;
  }

  /**
   *
   * @param symbol_name select a symbol for the trade builder
   */
  symbol(symbol_name: string) {
    this._symbol = symbol_name;
    return this;
  }

  /**
   * @returns selected symbol of current trade builder
   */
  getSymbol() {
    return this._symbol;
  }

  /**
   *
   * @param price set price for execute trade on this price
   */
  price(price: number) {
    this._price = price;
    this._price_latest = undefined;
    return this;
  }

  /**
   * Trade will execute in MT5 using latest price of the market
   */
  latestPrice() {
    this._price_latest = "latest";
    this._price = undefined;
    return this;
  }

  /**
   * @returns trade price
   */
  getPrice() {
    return this._price;
  }

  /**
   *
   * @param tp_in_pips set takeprofit in pips
   */
  takeProfit(tp_in_pips: number) {
    this._tp_pips = tp_in_pips;
    this._tp_price = undefined;
    return this;
  }

  /**
   *
   * @param tp_in_price set takeprofit in price value
   */
  takeProfitPrice(tp_in_price: number) {
    this._tp_pips = undefined;
    this._tp_price = tp_in_price;
    return this;
  }

  /**
   * @returns takeprofit in pips or price
   */
  getTakeProfit() {
    return this._tp_price == undefined ? this._tp_pips : this._tp_price;
  }

  /**
   *
   * @param sl_in_pips set stoploss in pips
   */
  stopLoss(sl_in_pips: number) {
    this._sl_pips = sl_in_pips;
    this._sl_price = undefined;
    return this;
  }

  /**
   *
   * @param sl_in_price set stoploss in price value
   */
  stopLossPrice(sl_in_price: number) {
    this._sl_pips = undefined;
    this._sl_price = sl_in_price;
    return this;
  }

  /**
   * @returns stoploss in pips or price
   */
  getStopLoss() {
    return this._sl_price == undefined ? this._sl_pips : this._sl_price;
  }

  /**
   *
   * @param comment set comment of an order
   */
  comment(comment: string) {
    this._comment = comment;
    return this;
  }

  /**
   * @return comment
   */
  getComment() {
    return this._comment;
  }

  /**
   * Buy - requires
   *    1. magic number
   *    2. slippage
   *    3. lot size
   *    4. symbol name
   *    5. price or price latest
   *    6. tp_pips or tp_price
   *    7. sl_pips or sl_price
   */
  async buy() {
    if (this.analyzeVars()) {
      let s_point = await SymbolInfo.point(this._symbol!);
      let ask_price =
        this._price == undefined
          ? await SymbolInfo.ask(this._symbol!)
          : this._price;
      let tp =
        this._tp_price != undefined
          ? this._tp_price
          : this._tp_pips == undefined || this._tp_pips <= 0
          ? 0.0
          : ask_price + this._tp_pips * 10 * s_point;
      let sl =
        this._sl_price != undefined
          ? this._sl_price
          : this._sl_pips == undefined || this._sl_pips <= 0
          ? 0.0
          : ask_price - this._sl_pips * 10 * s_point;
      if (sl != 0.0 && sl > ask_price) {
        throw new Error("Couldn't set stoploss avobe the price when buying");
      }
      if (tp != 0.0 && tp < ask_price) {
        throw new Error("Couldn't set takeprofit below the price when buying");
      }

      let data_obj = {
        event: "buy",
        magic: this._magic_number,
        slippage: this._slippage,
        lot_size: this._lot_size,
        symbol_name: this._symbol,
        price:
          this._price_latest != undefined ? this._price_latest : this._price,
        tp: tp,
        sl: sl,
        comment: this._comment == undefined ? "" : this._comment
      };
      SocketServer.getInstance().send(JSON.stringify(data_obj));
      let res_data = JSON.parse(await SocketServer.getInstance().receive());
      if (
        Object.keys(res_data).includes("buy") &&
        res_data.symbol_name == this._symbol
      ) {
        if (res_data.buy == "error") {
          throw new Error("Couldn't place a buy position due to having error!");
        } else {
          return res_data.buy;
        }
      } else {
        throw new Error("mql server not responding!");
      }
    }
  }

  /**
   * BuyStop - requires
   *    1. magic number
   *    2. slippage
   *    3. lot size
   *    4. symbol name
   *    5. price
   *    6. tp_pips or tp_price
   *    7. sl_pips or sl_price
   */
  async buyStop() {
    if (this.analyzeVars()) {
      if (this._price == undefined || this._price == null) {
        throw new Error("You must set the price when placing an order");
      }
      let s_point = await SymbolInfo.point(this._symbol!);
      let tp =
        this._tp_price != undefined
          ? this._tp_price
          : this._tp_pips == undefined || this._tp_pips == 0.0
          ? 0.0
          : this._price! + this._tp_pips * 10 * s_point;

      let sl =
        this._sl_price != undefined
          ? this._sl_price
          : this._sl_pips == undefined || this._sl_pips == 0.0
          ? 0.0
          : this._price! - this._sl_pips * 10 * s_point;
      if (sl != 0.0 && sl > this._price!) {
        throw new Error("Couldn't set stoploss avobe the price when buying");
      }
      if (tp != 0.0 && tp < this._price!) {
        throw new Error("Couldn't set takeprofit below the price when buying");
      }
      let data_obj = {
        event: "buy_stop",
        magic: this._magic_number,
        slippage: this._slippage,
        lot_size: this._lot_size,
        symbol_name: this._symbol,
        price: this._price,
        tp: tp,
        sl: sl,
        comment: this._comment == undefined ? "" : this._comment
      };
      SocketServer.getInstance().send(JSON.stringify(data_obj));
      let res_data = JSON.parse(await SocketServer.getInstance().receive());
      if (
        Object.keys(res_data).includes("buy_stop") &&
        res_data.symbol_name == this._symbol
      ) {
        if (res_data.buy_stop == "error") {
          throw new Error(
            "Couldn't place a buy stop order due to having error!"
          );
        } else {
          return res_data.buy_stop;
        }
      } else {
        throw new Error("mql server not responding!");
      }
    }
  }

  /**
   * BuyLimit - requires
   *    1. magic number
   *    2. slippage
   *    3. lot size
   *    4. symbol name
   *    5. price
   *    6. tp_pips or tp_price
   *    7. sl_pips or sl_price
   */
  async buyLimit() {
    if (this.analyzeVars()) {
      if (this._price == undefined || this._price == null) {
        throw new Error("You must set the price when placing an order");
      }
      let s_point = await SymbolInfo.point(this._symbol!);
      let tp =
        this._tp_price != undefined
          ? this._tp_price
          : this._tp_pips == undefined || this._tp_pips == 0.0
          ? 0.0
          : this._price! + this._tp_pips * 10 * s_point;

      let sl =
        this._sl_price != undefined
          ? this._sl_price
          : this._sl_pips == undefined || this._sl_pips == 0.0
          ? 0.0
          : this._price! - this._sl_pips * 10 * s_point;
      if (sl != 0.0 && sl > this._price!) {
        throw new Error("Couldn't set stoploss avobe the price when buying");
      }
      if (tp != 0.0 && tp < this._price!) {
        throw new Error("Couldn't set takeprofit below the price when buying");
      }
      let data_obj = {
        event: "buy_limit",
        magic: this._magic_number,
        slippage: this._slippage,
        lot_size: this._lot_size,
        symbol_name: this._symbol,
        price: this._price,
        tp: tp,
        sl: sl,
        comment: this._comment == undefined ? "" : this._comment
      };
      SocketServer.getInstance().send(JSON.stringify(data_obj));
      let res_data = JSON.parse(await SocketServer.getInstance().receive());
      if (
        Object.keys(res_data).includes("buy_limit") &&
        res_data.symbol_name == this._symbol
      ) {
        if (res_data.buy_limit == "error") {
          throw new Error(
            "Couldn't place a buy limit order due to having error!"
          );
        } else {
          return res_data.buy_limit;
        }
      } else {
        throw new Error("mql server not responding!");
      }
    }
  }

  /**
   * Sell - requires
   *    1. magic number
   *    2. slippage
   *    3. lot size
   *    4. symbol name
   *    5. price or price latest
   *    6. tp_pips or tp_price
   *    7. sl_pips or sl_price
   */
  async sell() {
    if (this.analyzeVars()) {
      let s_point = await SymbolInfo.point(this._symbol!);
      let bid_price =
        this._price == undefined
          ? await SymbolInfo.bid(this._symbol!)
          : this._price;
      let tp =
        this._tp_price != undefined
          ? this._tp_price
          : this._tp_pips == undefined || this._tp_pips <= 0
          ? 0.0
          : bid_price - this._tp_pips * 10 * s_point;
      let sl =
        this._sl_price != undefined
          ? this._sl_price
          : this._sl_pips == undefined || this._sl_pips <= 0
          ? 0.0
          : bid_price + this._sl_pips * 10 * s_point;
      if (sl != 0.0 && sl < bid_price) {
        throw new Error("Couldn't set stoploss bellow the price when selling");
      }
      if (tp != 0.0 && tp > bid_price) {
        throw new Error("Couldn't set takeprofit avobe the price when selling");
      }
      let data_obj = {
        event: "sell",
        magic: this._magic_number,
        slippage: this._slippage,
        lot_size: this._lot_size,
        symbol_name: this._symbol,
        price:
          this._price_latest != undefined ? this._price_latest : this._price,
        tp: tp,
        sl: sl,
        comment: this._comment == undefined ? "" : this._comment
      };
      SocketServer.getInstance().send(JSON.stringify(data_obj));
      let res_data = JSON.parse(await SocketServer.getInstance().receive());
      if (
        Object.keys(res_data).includes("sell") &&
        res_data.symbol_name == this._symbol
      ) {
        if (res_data.sell == "error") {
          throw new Error(
            "Couldn't place a sell position due to having error!"
          );
        } else {
          return res_data.sell;
        }
      } else {
        throw new Error("mql server not responding!");
      }
    }
  }

  /**
   * SellStop - requires
   *    1. magic number
   *    2. slippage
   *    3. lot size
   *    4. symbol name
   *    5. price
   *    6. tp_pips or tp_price
   *    7. sl_pips or sl_price
   */
  async sellStop() {
    if (this.analyzeVars()) {
      if (this._price == undefined || this._price == null) {
        throw new Error("You must set the price when placing an order");
      }
      let s_point = await SymbolInfo.point(this._symbol!);
      let tp =
        this._tp_price != undefined
          ? this._tp_price
          : this._tp_pips == undefined || this._tp_pips == 0.0
          ? 0.0
          : this._price! - this._tp_pips * 10 * s_point;

      let sl =
        this._sl_price != undefined
          ? this._sl_price
          : this._sl_pips == undefined || this._sl_pips == 0.0
          ? 0.0
          : this._price! + this._sl_pips * 10 * s_point;
      if (sl != 0.0 && sl < this._price!) {
        throw new Error("Couldn't set stoploss bellow the price when selling");
      }
      if (tp != 0.0 && tp > this._price!) {
        throw new Error("Couldn't set takeprofit avobe the price when selling");
      }
      let data_obj = {
        event: "sell_stop",
        magic: this._magic_number,
        slippage: this._slippage,
        lot_size: this._lot_size,
        symbol_name: this._symbol,
        price: this._price,
        tp: tp,
        sl: sl,
        comment: this._comment == undefined ? "" : this._comment
      };
      SocketServer.getInstance().send(JSON.stringify(data_obj));
      let res_data = JSON.parse(await SocketServer.getInstance().receive());
      if (
        Object.keys(res_data).includes("sell_stop") &&
        res_data.symbol_name == this._symbol
      ) {
        if (res_data.sell_stop == "error") {
          throw new Error(
            "Couldn't place a sell stop order due to having error!"
          );
        } else {
          return res_data.sell_stop;
        }
      } else {
        throw new Error("mql server not responding!");
      }
    }
  }

  /**
   * SellLimit - requires
   *    1. magic number
   *    2. slippage
   *    3. lot size
   *    4. symbol name
   *    5. price
   *    6. tp_pips or tp_price
   *    7. sl_pips or sl_price
   */
  async sellLimit() {
    if (this.analyzeVars()) {
      if (this._price == undefined || this._price == null) {
        throw new Error("You must set the price when placing an order");
      }
      let s_point = await SymbolInfo.point(this._symbol!);
      let tp =
        this._tp_price != undefined
          ? this._tp_price
          : this._tp_pips == undefined || this._tp_pips == 0.0
          ? 0.0
          : this._price! - this._tp_pips * 10 * s_point;

      let sl =
        this._sl_price != undefined
          ? this._sl_price
          : this._sl_pips == undefined || this._sl_pips == 0.0
          ? 0.0
          : this._price! + this._sl_pips * 10 * s_point;
      if (sl != 0.0 && sl < this._price!) {
        throw new Error("Couldn't set stoploss below the price when selling");
      }
      if (tp != 0.0 && tp > this._price!) {
        throw new Error("Couldn't set takeprofit avobe the price when selling");
      }
      let data_obj = {
        event: "sell_limit",
        magic: this._magic_number,
        slippage: this._slippage,
        lot_size: this._lot_size,
        symbol_name: this._symbol,
        price: this._price,
        tp: tp,
        sl: sl,
        comment: this._comment == undefined ? "" : this._comment
      };
      SocketServer.getInstance().send(JSON.stringify(data_obj));
      let res_data = JSON.parse(await SocketServer.getInstance().receive());
      if (
        Object.keys(res_data).includes("sell_limit") &&
        res_data.symbol_name == this._symbol
      ) {
        if (res_data.sell_limit == "error") {
          throw new Error(
            "Couldn't place a sell limit order due to having error!"
          );
        } else {
          return res_data.sell_limit;
        }
      } else {
        throw new Error("mql server not responding!");
      }
    }
  }

  /**
   * Checks parameters are set correctly or throw error
   */
  private analyzeVars() {
    if (this._magic_number == undefined || this._magic_number == null) {
      throw new Error("Magic number undefined");
    }
    if (this._slippage == undefined || this._slippage == null) {
      throw new Error("Slippage undefined");
    }
    if (this._lot_size == undefined || this._lot_size == null) {
      throw new Error("Lot Size undefined");
    }
    if (this._symbol == undefined || this._symbol == null) {
      throw new Error("Symbol name undefined");
    }
    if (
      (this._price == undefined || this._price == null) &&
      (this._price_latest == undefined || this._price_latest == null)
    ) {
      throw new Error("Price or Latest price undefined");
    }
    if (
      (this._tp_pips == undefined || this._tp_pips == null) &&
      (this._tp_price == undefined || this._tp_price == null)
    ) {
      throw new Error("TakeProfit pips or TakeProfit price undefined");
    }
    if (
      (this._sl_pips == undefined || this._sl_pips == null) &&
      (this._sl_price == undefined || this._sl_price == null)
    ) {
      throw new Error("StopLoss pips or StopLoss price undefined");
    }
    return true;
  }

  /**
   * Requires -
   *    1. takeprofit price
   *    2. stoploss price
   * @param position_ticket position which to modify
   */
  async modifyPosition(position_ticket: number) {
    if (this._tp_price == undefined || this._tp_price == null) {
      throw new Error("TakeProfit price undefined or null");
    }
    if (this._sl_price == undefined || this._sl_price == null) {
      throw new Error("StopLoss price undefined or null");
    }
    SocketServer.getInstance().send(
      JSON.stringify({
        event: "modify_position",
        ticket: position_ticket,
        sl: this._sl_price,
        tp: this._tp_price
      })
    );
    let result = JSON.parse(await SocketServer.getInstance().receive());
    if (Object.keys(result).includes("modify_position")) {
      return result.modify_position;
    } else {
      return false;
    }
  }

  /**
   * Requires -
   *    1. price
   *    2. takeprofit price
   *    3. stoploss price
   * @param order_ticket Order which to modify
   */
  async modifyOrder(order_ticket: number) {
    if (this._price == undefined || this._price == null) {
      throw new Error("Order price undefined or null");
    }
    if (this._tp_price == undefined || this._tp_price == null) {
      throw new Error("TakeProfit price undefined or null");
    }
    if (this._sl_price == undefined || this._sl_price == null) {
      throw new Error("StopLoss price undefined or null");
    }

    SocketServer.getInstance().send(
      JSON.stringify({
        event: "modify_order",
        ticket: order_ticket,
        price: this._price,
        sl: this._sl_price,
        tp: this._tp_price
      })
    );
    let result = JSON.parse(await SocketServer.getInstance().receive());
    if (Object.keys(result).includes("modify_order")) {
      return result.modify_order;
    } else {
      return false;
    }
  }

  /**
   * @param position_ticket Position which to delete
   */
  static async deletePosition(position_ticket: number) {
    SocketServer.getInstance().send(
      JSON.stringify({ event: "delete_position", ticket: position_ticket })
    );
    let result = JSON.parse(await SocketServer.getInstance().receive());
    if (Object.keys(result).includes("delete_position")) {
      return result.delete_position;
    } else {
      return false;
    }
  }

  /**
   * @param order_ticket  Order which to delete
   */
  static async deleteOrder(order_ticket: number) {
    SocketServer.getInstance().send(
      JSON.stringify({ event: "delete_order", ticket: order_ticket })
    );
    let result = JSON.parse(await SocketServer.getInstance().receive());
    if (Object.keys(result).includes("delete_order")) {
      return result.delete_order;
    } else {
      return false;
    }
  }

  /**
   * List all Positions info
   */
  static async allPositions() {
    SocketServer.getInstance().send(
      JSON.stringify({ event: "total_pos_info" })
    );
    let data_res = JSON.parse(await SocketServer.getInstance().receive());
    if (Object.keys(data_res).includes("total_pos_info")) {
      let datas = data_res.total_pos_info;
      let f_res: PositionInfo[] = [];
      if (datas.length <= 0) {
        return f_res;
      }
      for (let data of datas) {
        f_res.push({
          ticket: data.ticket,
          time: data.time,
          updateTime: data.update_time,
          positionType: data.pos_type,
          magic: data.magic,
          positionId: data.pos_id,
          lotSize: data.lot_size,
          openPrice: data.open_price,
          stoploss: data.sl,
          takeprofit: data.tp,
          currentPrice: data.current_price,
          commission: data.commission,
          swap: data.swap,
          profit: data.profit,
          symbol: data.symbol,
          comment: data.comment
        });
      }
      return f_res;
    } else {
      return [] as PositionInfo[];
    }
  }

  /**
   * List all Orders Info
   */
  static async allOrders() {
    SocketServer.getInstance().send(
      JSON.stringify({ event: "total_order_info" })
    );
    let data_res = JSON.parse(await SocketServer.getInstance().receive());
    if (Object.keys(data_res).includes("total_order_info")) {
      let datas = data_res.total_order_info;
      let f_res: OrderInfo[] = [];
      for (let data of datas) {
        let order_type =
          data.order_type == "buy stop"
            ? OrderType.BUY_STOP
            : data.order_type == "buy limit"
            ? OrderType.BUY_LIMIT
            : data.order_type == "sell stop"
            ? OrderType.SELL_STOP
            : OrderType.SELL_LIMIT;
        f_res.push({
          ticket: data.ticket,
          setupTime: data.time_setup,
          orderType: order_type,
          state: data.state,
          timeDone: data.time_done,
          typeFilling: data.type_filling,
          typeTime: data.type_time,
          magic: data.magic,
          positionId: data.pos_id,
          initialVolume: data.initial_volume,
          currentVolume: data.current_volume,
          openPrice: data.open_price,
          stoploss: data.sl,
          takeprofit: data.tp,
          currentPrice: data.current_price,
          symbol: data.symbol,
          comment: data.comment
        });
      }
      return f_res;
    } else {
      return [] as OrderInfo[];
    }
  }

  /**
   * List all History Info
   */
  static async allHistory() {
    SocketServer.getInstance().send(
      JSON.stringify({ event: "total_history_info" })
    );
    let data_res = JSON.parse(await SocketServer.getInstance().receive());
    if (Object.keys(data_res).includes("total_order_info")) {
      let datas = data_res.total_order_info;
      let f_res: HistoryInfo[] = [];
      for (let data of datas) {
        f_res.push({
          ticket: data.ticket,
          time: data.time,
          dealType:
            data.deal_type == "Buy type"
              ? DealType.BUY
              : data.deal_type == "Sell type"
              ? DealType.SELL
              : DealType.UNKNOWN,
          magic: data.magic,
          positionId: data.pos_id,
          volume: data.volume,
          entryType: data.entry_type,
          symbol: data.symbol,
          comment: data.comment,
          swap: data.swap,
          commission: data.commission,
          price: data.price,
          profit: data.profit
        });
      }
      return f_res;
    } else {
      return [] as HistoryInfo[];
    }
  }
}

export interface PositionInfo {
  ticket: number;
  time: string;
  updateTime: string;
  positionType: PositionType;
  magic: number;
  positionId: number;
  lotSize: number;
  openPrice: number;
  stoploss: number;
  takeprofit: number;
  currentPrice: number;
  commission: number;
  swap: number;
  profit: number;
  symbol: string;
  comment: string;
}

export enum PositionType {
  BUY,
  SELL
}

export interface OrderInfo {
  ticket: number;
  setupTime: string;
  orderType: OrderType;
  state: string;
  timeDone: string;
  typeFilling: string;
  typeTime: string;
  magic: number;
  positionId: number;
  initialVolume: number;
  currentVolume: number;
  openPrice: number;
  stoploss: number;
  takeprofit: number;
  currentPrice: number;
  symbol: string;
  comment: string;
}

export enum OrderType {
  BUY_STOP,
  BUY_LIMIT,
  SELL_STOP,
  SELL_LIMIT
}

export interface HistoryInfo {
  ticket: number;
  time: string;
  dealType: DealType;
  magic: number;
  positionId: number;
  volume: number;
  entryType: EntryType;
  symbol: string;
  comment: string;
  swap: number;
  commission: number;
  price: number;
  profit: number;
}

export enum DealType {
  BUY,
  SELL,
  UNKNOWN
}

export enum EntryType {
  IN,
  OUT
}
