import { BaseActionWatcher } from "./demux-js"
import { NodeosActionReader } from "./demux-js-leveldb-plugin"
import updaters from "./src/updaters"
import effects from "./src/effects"
import ObjectActionHandler from "./src/ObjectActionHandler"
import * as config from "./config"
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