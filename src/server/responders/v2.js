import express from "express";
const app = express();

export default function apiV2(btcnew) {
  require("./v2/accounts").default(app, btcnew);
  require("./v2/blocks").default(app, btcnew);
  require("./v2/confirmation").default(app, btcnew);
  require("./v2/network").default(app, btcnew);
  require("./v2/representatives").default(app, btcnew);
  require("./v2/search").default(app, btcnew);
  require("./v2/ticker").default(app, btcnew);

  return app;
}
