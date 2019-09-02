#MQL5-Connector-Js

MQL5-connector-js is an interface between MT5 and nodeJS. All of the functionality of MT5 can be use on nodejs using [ZeroMq](https://zeromq.org). This library is created with javascript asynchronous technology. So, you have to use `async` `await` keywords to retrieve data from MT5.

1.First of all go to this link to install [mql5-connector]() on MT5 and follow the github installation guides.
2.Install python 2.7 on your windows or linux machine. Or if you having trouble to install [zeromq.js](https://github.com/zeromq/zeromq.js/) then follow the github guide to install [zeromq.js](https://github.com/zeromq/zeromq.js/)
3.Install mql5-connector-js using npm

```sh
npm install mql5-connector-js
```

First you have to initialize mql5-connector-js.

```js
const { ConfigContext } = require("mql5-connector-js");
// default config
new ConfigContext().init();

// or you can change as your needs
// input this config to mql5-connector on MT5
new ConfigContext({
  host_ip: "127.0.0.1", // server ip
  protocol: "tcp", // transfer protocol
  port1: 3033, // push socket port
  port2: 3034, // pull socket port
  port3: 3035, // publisher socket port
  timeout_ms: 1000 // wait for messages from server until timeout
}).init();
```

`AccountInfo` class have the functions of Mql5 [Account properties](https://www.mql5.com/en/docs/constants/environment_state/accountinformation)

```javascript
const { ConfigContext, AccountInfo } = require("mql5-connector-js");
// config context
new ConfigContext().init();

//first init default or custom socket config as avobe
AccountInfo.loginId().then(loginId =>
  console.log("Account Login Id : " + loginId)
);
// or
let loginId = await AccountInfo.loginId();
console.log("Account Login Id : " + loginId);

// explore AccountInfo for more functions
```

`SymbolInfo` class have functions of Mql5 [Symbol properties](https://www.mql5.com/en/docs/constants/environment_state/marketinfoconstants)

```javascript
const { ConfigContext, SymbolInfo } = require("mql5-connector-js");
// config context
new ConfigContext().init();

SymbolInfo.digits("EURUSD").then(digits =>
  console.log("EURUSD digits : " + digits)
);
//or
let digits = await SymbolInfo.digits("EURUSD");
console.log("EURUSD digits : " + digits);

// explore SymbolInfo for more functions
```

Placing a buy trade on `EURUSD`

```javascript
const { ConfigContext, Trade } = require("mql5-connector-js");
// default config context
new ConfigContext().init();
// you can change the model anytime if you want
// or you can build multiple model to perform same task
let buy_model = new Trade()
  .magic(123734234)
  .slippage(10)
  .lotSize(0.01)
  .symbol("EURUSD")
  // you can define your price
  .price(1.102)
  // or you can call latest price. Then this will get the
  // latest price from market and place a buy trade
  .latestPrice() // only for buy and sell trade
  // you can define your custom price
  .takeProfitPrice(1.103) // 10 pips from defined price
  // you can define it with pips
  .takeProfit(10) // 10 pips from current price
  .stopLoss(10) // as same as take profit
  .comment("Placing a buy trade using declared price");
let ticket = await buy_model.buy(); // returns order ticket
console.log("Ticket : " + ticket);
// sometimes it fails to retrieve order ticket. so, handle it your owns
```

Placing a buy stop order on AUDUSD

```javascript
const { ConfigContext, Trade } = require("mql5-connector-js");
// default config context
new ConfigContext().init();

// you can build a model for placing stop or limit order for future works
let buy_stop_model = new Trade()
  .magic(123734234)
  .slippage(10)
  .lotSize(0.01)
  .symbol("AUDUSD")
  .price(0.675)
  .takeProfit(10)
  .stopLoss(10)
  .comment("placing a buy stop order");
let ticket = await buy_stop_model.buyStop(); // returns order ticket
console.log("Ticket : " + ticket);
// sometimes it fails to retrieve order ticket. so, handle it your owns
```

There are two types of event 1. `onBar` event (which called after a new bar has formed) 2. `onTick` event (which called after a new tick has found)

example of `onBar` event for EURUSD with 1H timeframe & 100 history bars

```javascript
// import types
const { ConfigContext, Event, Timeframe, Bar } = require("mql5-connector-js");
// default config context
new ConfigContext().init();

let bar_event = new Event()
  .selectSymbol("EURUSD")
  .timeframe(Timeframe.H1)
  .historyBarCount(100)
  .onBar(bars => {
    // bars : Bars[]
    console.log("bars : " + bars);
  });

bar_event.unsubscribeOnBarEvent(); // unsubsribe it when not necessary
```

example of `onTick` event for USDJPY with 100 history ticks

```javascript
// import types
const { ConfigContext, Event, Tick } = require("mql5-connector-js");
// default config context
new ConfigContext().init();

let tick_event = new Event()
  .selectSymbol("USDJPY")
  .historyTickCount(100)
  .onTick(ticks => {
    // ticks : Tick[]
    console.log("Ticks : " + ticks);
  });

tick_event.unsubscribeOnTickEvent(); // unsubsribe when not necessary
```

You can get history data using `Event`.
example of retrieving EURUSD 1H history bars from MT5

```javascript
const { ConfigContext, Event, Timeframe, Bar } = require("mql5-connector-js");
// default config context
new ConfigContext().init();

let bars = await new Event()
  .selectSymbol("EURUSD")
  .timeframe(Timeframe.H1)
  .fromDate(new Date("2010-01-01 00:00:00"))
  .toDate(new Date())
  .getBars();

console.log(bars[0]);
```
