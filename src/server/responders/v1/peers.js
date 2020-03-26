import _ from "lodash";
import redisFetch from "../../helpers/redisFetch";

export default function(app, btcnew) {
  app.get("/peer_count", async (req, res, next) => {
    try {
      const peerCount = await redisFetch("peerCount", 60, async () => {
        return _.keys((await btcnew.rpc("peers")).peers).length;
      });

      res.json({ peerCount: peerCount });
    } catch (e) {
      next(e);
    }
  });

  app.get("/peers", async (req, res) => {
    try {
      const peers = await redisFetch("peers", 60, async () => {
        return await btcnew.rpc("peers");
      });

      res.json(peers);
    } catch (e) {
      next(e);
    }
  });
}
