import os from "os";
import _ from "lodash";
import config from "../../../../server-config.json";
import redisFetch from "../../helpers/redisFetch";
import raiNodeInfo from "../../helpers/raiNodeInfo";
import networkStats from "../../helpers/networkStats";
import Currency from "../../../lib/Currency";

export default function(app, btcnew) {
  // btcnewNodeMonitor support
  app.get("/api.php", async (req, res, next) => {
    try {
      const data = await redisFetch("api.php", 10, async () => {
        const blockCount = await btcnew.blocks.count();
        const peerCount = _.keys((await btcnew.rpc("peers")).peers).length;
        const accBalanceMbtcnew = parseFloat(
          await btcnew.accounts.btcnewBalance(config.account),
          10
        );
        const stats = await raiNodeInfo();
        const weight = parseFloat(
          Currency.fromRaw(await btcnew.accounts.weight(config.account)),
          10
        );

        const blockStats = await networkStats();

        const blockSync =
          Math.round(
            (parseInt(blockCount.count, 10) / blockStats.maxBlockCount) *
              10000.0
          ) / 100.0;

        return {
          currency: config.monitorCurrencyName,
          btcnewNodeName: config.nodeName,
          btcnewNodeAccount: config.account,
          version: (await btcnew.rpc("version")).node_vendor,
          currentBlock: blockCount.count,
          uncheckedBlocks: blockCount.unchecked,
          blockSync,
          votingWeight: weight,
          numPeers: peerCount,
          accBalanceMbtcnew,
          usedMem: Math.round(stats.memory / 1024 / 1024),
          totalMem: Math.round(os.totalmem() / 1024 / 1024)
        };
      });

      res.json(data);
    } catch (e) {
      next(e);
    }
  });

  app.get("/operations", async (req, res, next) => {
    try {
      const data = await redisFetch("operations", 60, async () => {
        return await btcnew.blocks.count();
      });

      res.send(data.count);
    } catch (e) {
      next(e);
    }
  });
}
