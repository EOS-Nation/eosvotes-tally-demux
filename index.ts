import * as path from "path";
import * as write from "write-json-file";
import { BaseActionWatcher } from "./demux-js"
import { NodeosActionReader } from "./demux-js-leveldb-plugin"
import { CronJob } from "cron";
import { state } from "./src/state"
import updaters from "./src/updaters"
import effects from "./src/effects"
import ObjectActionHandler from "./src/ObjectActionHandler"
import * as config from "./src/config"
const levelup = require("levelup");
const leveldown = require("leveldown");

// LevelDB to improve local caching
const db = levelup(leveldown(config.EOSVOTES_LEVELDB));

const actionHandler = new ObjectActionHandler(
    updaters,
    effects,
)

const actionReader = new NodeosActionReader(
    config.EOSIO_API, // Locally hosted node needed for reasonable indexing speed
    config.EOSVOTES_FIRST_BLOCK, // First actions relevant to this dapp happen at this block
    config.EOSVOTES_ONLY_IRREVERSIBLE, // Only irreversible blocks
    undefined,
    undefined,
    db
)

const actionWatcher = new BaseActionWatcher(
    actionReader,
    actionHandler,
    250, // Poll at twice the block interval for less latency
)

actionWatcher.watch() // Start watch loop

// Save State to JSON
new CronJob('*/10 * * * * *', async () => {
    const name = `${state.indexState.blockNumber}.json`

    // Save Proposals
    write.sync(path.join(__dirname, "aws", "proposals", "eosvotes-proposals-" + name), state.proposals)
    write.sync(path.join(__dirname, "aws", "proposals", "latest.json"), state.proposals)

    // Save Tally
    write.sync(path.join(__dirname, "aws", "tally", "eosvotes-tally-" + name), state.tally)
    write.sync(path.join(__dirname, "aws", "tally", "latest.json"), state.tally)

    // Save Voters
    write.sync(path.join(__dirname, "aws", "voters", "eosvotes-voters-" + name), state.voters)
    write.sync(path.join(__dirname, "aws", "voters", "latest.json"), state.voters)
}, () => {}, true, 'America/Toronto')