import _ from "lodash";
import redisFetch from "../../helpers/redisFetch";
import tpsCalculator from "../../helpers/tpsCalculator";
import Currency from "../../../lib/Currency";

export default function(app, btcnew) {
  // btcnewNodeMonitor network data
  app.get("/network_data", async (req, res, next) => {
    try {
      const data = await redisFetch("btcnewNodeMonitorPeerData", 10, async () => {
        return [];
      });

      res.json({ network: data });
    } catch (e) {
      next(e);
    }
  });

  app.get("/tps/:period", async (req, res, next) => {
    try {
      const calc = await tpsCalculator(req.params.period);
      res.json({ tps: calc || 0.0 });
    } catch (e) {
      next(e);
    }
  });

  app.get("/confirmation_quorum", async (req, res, next) => {
    try {
      const data = await redisFetch("confirmation_quorum", 10, async () => {
        return await btcnew.rpc("confirmation_quorum");
      });

      data.quorum_delta_mbtcnew = Currency.fromRaw(data.quorum_delta);
      data.online_weight_minimum_mbtcnew = Currency.fromRaw(
        data.online_weight_minimum
      );
      data.online_stake_total_mbtcnew = Currency.fromRaw(data.online_stake_total);
      data.peers_stake_total_mbtcnew = Currency.fromRaw(data.peers_stake_total);

      res.json(data);
    } catch (e) {
      next(e);
    }
  });
}
