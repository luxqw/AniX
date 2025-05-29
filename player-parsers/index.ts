import { asJSON } from "./shared";
import { getAnilibriaURL } from "./libria";
import { getSibnetURL } from "./sibnet";
import { getKodikURL } from "./kodik";

import express from "express";
const app = express();

const host = "0.0.0.0";
const port = 7000;
const allowedPlayers = ["kodik", "libria", "sibnet"];

app.get("/", (req, res) => {
  const url = req.query.url;
  const player = req.query.player;

  if (!url) {
    asJSON(res, { message: "no 'url' query provided" }, 400)
    return
  }

  if (!player) {
    asJSON(res, { message: "no 'player' query provided" }, 400)
    return
  }

  switch (player) {
    case "libria":
        getAnilibriaURL(res, url)
        return
    case "sibnet":
        getSibnetURL(res, url)
        return
    case "kodik":
        getKodikURL(res, url)
        return
    default:
        asJSON(res, { message: `player '${player}' is not supported. choose one of: ${allowedPlayers.join(", ")}` }, 400)
        return
  }
});

app.listen(port, host, function () {
  console.log(`Server listens http://${host}:${port}`);
});
