import _ from "lodash";
import fetch from "node-fetch";
import redis from "redis";
import { BitcoinNew } from "nanode";
import config from "../../server-config.json";

import NodeMonitor from "./NodeMonitor";

const redisClient = redis.createClient(config.redis);
redisClient.on("error", err => {
  console.error("Redis unavailable");
});

const btcnew = new BitcoinNew({ url: config.nodeHost });

let KNOWN_MONITORS = [];

async function updateKnownMonitors() {
  let monitors = _.keys((await btcnew.rpc("peers")).peers)
    .filter(
      peer =>
        !config.blacklistedPeers.includes(
          peer.match(/\[(?:\:\:ffff\:)?(.+)\]:\d+/)[1]
        )
    )
    .map(peer => NodeMonitor.fromPeerAddress(peer));

  monitors = monitors.concat(
    config.knownMonitors.map(url => new NodeMonitor(url))
  );

  monitors = _.uniqBy(monitors, "apiUrl");

  KNOWN_MONITORS = _.uniqBy(
    _.compact(
      await Promise.all(
        monitors.map(monitor =>
          monitor.fetch().catch(e => console.error(e.message))
        )
      )
    ),
    "data.btcnewNodeAccount"
  ).map(data => data.url);

  console.log(`There are now ${KNOWN_MONITORS.length} known monitors`);

  setTimeout(updateKnownMonitors, 5 * 60 * 1000);
}

async function checkKnownMonitors() {
  console.log("Checking known btcnewNodeMonitors");

  const data = _.compact(
    await Promise.all(
      KNOWN_MONITORS.map(url =>
        new NodeMonitor(url, "known")
          .fetch()
          .catch(e => console.error(e.message))
      )
    )
  );

  redisClient.set(
    `btcnew-control-panel/${config.redisNamespace ||
      "default"}/btcnewNodeMonitorPeerData`,
    JSON.stringify(data)
  );

  setTimeout(checkKnownMonitors, 60 * 1000);
}

export default function startNetworkDataUpdates() {
  redisClient.on("ready", async () => {
    await updateKnownMonitors();
    checkKnownMonitors();
  });
}
