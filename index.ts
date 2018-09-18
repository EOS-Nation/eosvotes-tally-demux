import axios from "axios";
import express from "express";
import { BaseActionWatcher } from "./demux-js";
import { LevelDBActionReader } from "./demux-js-leveldb";
import { state } from "./src/state";
import updaters from "./src/updaters";
import effects from "./src/effects";
import ObjectActionHandler from "./src/ObjectActionHandler";
import * as config from "./src/config";
import { db } from "./src/db";

const actionHandler = new ObjectActionHandler(
    updaters,
    effects,
);

const actionReader = new LevelDBActionReader(
    config.EOSIO_API, // Locally hosted node needed for reasonable indexing speed
    config.EOSVOTES_FIRST_BLOCK, // First actions relevant to this dapp happen at this block
    config.EOSVOTES_ONLY_IRREVERSIBLE, // Only irreversible blocks
    600, // Max History Length
    axios, // Axios Instance
    db, // LevelDB Instance
    config.DEMUX_CONTRACT_BLACKLIST, // Demux Contract Blacklist
    config.DEMUX_CONTRACT_WHITELIST, // Demux Contract Whitelist
);

const actionWatcher = new BaseActionWatcher(
    actionReader,
    actionHandler,
    500, // Poll at twice the block interval for less latency
);

actionWatcher.watch(); // Start watch loop

// Expose State via simple HTTP express app
const app = express();
app.set("json spaces", 2);

// Allow CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Full API
app.get("/", (req, res) => res.json(state));
app.get("/proposals(.json)?$", (req, res) => res.json(state.proposals));
app.get("/voters(.json)?$", (req, res) => res.json(state.voters));
app.get("/global(.json)?$", (req, res) => res.json(state.global));

// Scoped API
app.get("/voter/:voter", (req, res) => res.json(state.voters[req.params.voter] || {}));
app.get("/proposal/:proposal_name", (req, res) => {
    const { proposal_name } = req.params;
    if (state.proposals[proposal_name]) { res.json(state.proposals[proposal_name]);
    } else { res.json({}); }
});

app.listen(config.EOSVOTES_PORT, () => console.log(`EOS Votes listening on port ${config.EOSVOTES_PORT}!`));
