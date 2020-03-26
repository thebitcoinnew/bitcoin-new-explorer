import express from "express";
const app = express();

export default function apiV1(btcnew) {
  require("./v1/accounts").default(app, btcnew);
  require("./v1/api").default(app, btcnew);
  require("./v1/blocks").default(app, btcnew);
  require("./v1/network").default(app, btcnew);
  require("./v1/peers").default(app, btcnew);
  require("./v1/representatives").default(app, btcnew);
  require("./v1/system").default(app, btcnew);

  return app;
}
