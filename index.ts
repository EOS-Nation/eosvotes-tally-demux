import { BaseActionWatcher, NodeosActionReader } from "./demux-js"
import updaters from "./src/updaters"
import effects from "./src/effects"
import ObjectActionHandler from "./src/ObjectActionHandler"
import * as config from "./config"

const actionHandler = new ObjectActionHandler(
    updaters,
    effects,
)

const actionReader = new NodeosActionReader(
    config.EOSIO_API, // Locally hosted node needed for reasonable indexing speed
    config.EOSVOTES_FIRST_BLOCK, // First actions relevant to this dapp happen at this block
)

const actionWatcher = new BaseActionWatcher(
    actionReader,
    actionHandler,
    250, // Poll at twice the block interval for less latency
)

actionWatcher.watch() // Start watch loop