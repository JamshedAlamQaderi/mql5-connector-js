import SocketServer from "./socket_server";

/**
 * All MQL5 Account Info can be found on this static class 
 * 
 * @example
 * //Request the login id of account from MT5
 * console.log(AccountInfo.loginId())
 * 
 */
export class AccountInfo {
  /**
   * In AccountInfo all request are same. So, a get() method
   * created for request data
   * @param event_name request AccountInfo using event_name
   */
  private static async get(event_name: string) {
    SocketServer.getInstance().send(JSON.stringify({ event: event_name }));
    let data = JSON.parse(await SocketServer.getInstance().receive());
    if (Object.keys(data).includes(event_name)) {
      return data[event_name];
    }
    return null;
  }

  /**
   * Account number
   */
  static async loginId() {
    return this.get("login_id");
  }

  /**
   * Account trade mode
   */
  static async tradeMode() {
    let res: AccountTradeMode = await this.get("trade_mode");
    return res;
  }

  /**
   * Account leverage
   */
  static async leverage() {
    return await this.get("leverage");
  }

  /**
   * Maximum allowed number of active pending orders
   */
  static async maxOrdersLimit() {
    return await this.get("limit_orders");
  }

  /**
   * Mode for setting the minimal allowed margin
   */
  static async stopoutMode() {
    let res: AccountStopoutMode = await this.get("stopout_mode");
    return res;
  }

  /**
   * Allowed trade for the current account
   */
  static async isTradeAllowed() {
    return await this.get("is_trade_allowed");
  }

  /**
   * Allowed trade for an Expert Advisor
   */
  static async canExpertTrade() {
    return await this.get("can_expert_trade");
  }

  /**
   * Margin calculation mode
   */
  static async marginMode() {
    return (await this.get("margin_mode")) as AccountMarginMode;
  }

  /**
   * The number of decimal places in the account currency, 
   * which are required for an accurate display of trading results
   */
  static async currencyDigit() {
    return await this.get("account_currency_digit");
  }

  /**
   * Account balance in the deposit currency
   */
  static async balance() {
    return await this.get("balance");
  }

  /**
   * Account credit in the deposit currency
   */
  static async credit() {
    return await this.get("credit");
  }

  /**
   * Current profit of an account in the deposit currency
   */
  static async profit() {
    return await this.get("profit");
  }

  /**
   * Account equity in the deposit currency
   */
  static async equity() {
    return await this.get("equity");
  }

  /**
   * Account margin used in the deposit currency
   */
  static async margin() {
    return await this.get("margin");
  }

  /**
   * Free margin of an account in the deposit currency
   */
  static async marginFree() {
    return await this.get("margin_free");
  }

  /**
   * Account margin level in percents
   */
  static async marginLevel() {
    return await this.get("margin_level");
  }

  /**
   * Margin call level. Depending on the set ACCOUNT_MARGIN_SO_MODE is expressed in percents or in the deposit currency
   */
  static async marginSoCall() {
    return await this.get("margin_so_call");
  }

  /**
   * Margin stop out level. Depending on the set ACCOUNT_MARGIN_SO_MODE is expressed in percents or in the deposit currency
   */
  static async marginSoSo() {
    return await this.get("margin_so_so");
  }

  /**
   * Maintenance margin. The minimum equity reserved on an account to cover the minimum amount of all open positions
   */
  static async marginMaintenance() {
    return await this.get("margin_maintenance");
  }

  /**
   * The current assets of an account
   */
  static async assets() {
    return await this.get("assets");
  }

  /**
   * The current liabilities on an account
   */
  static async liabilities() {
    return await this.get("liabilities");
  }

  /**
   * The current blocked commission amount on an account
   */
  static async commisionBlocked() {
    return await this.get("commision_blocked");
  }

  /**
   * Client name
   */
  static async accountName() {
    return await this.get("account_name");
  }

  /**
   * Trade server name
   */
  static async Server() {
    return await this.get("account_server");
  }

  /**
   * Account currency
   */
  static async currency() {
    return await this.get("account_currency");
  }

  /**
   * Name of a company that serves the account
   */
  static async company() {
    return await this.get("account_company");
  }
}

export enum AccountTradeMode {
  DEMO,
  REAL,
  CONTEST
}
export enum AccountStopoutMode {
  MONEY,
  PERCENT
}

export enum AccountMarginMode {
  RETAIL_NETTING,
  RETAIL_HEDGING,
  EXCHANGE
}
