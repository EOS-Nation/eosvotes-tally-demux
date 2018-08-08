import { BaseActionWatcher, NodeosActionReader } from "./demux-js"
import updaters from "./src/updaters"
import effects from "./src/effects"
import ObjectActionHandler from "./src/ObjectActionHandler"

const actionHandler = new ObjectActionHandler(
    updaters,
    effects,
)

const actionReader = new NodeosActionReader(
    "https://api.eosn.io", // Locally hosted node needed for reasonable indexing speed
    10141456, // First actions relevant to this dapp happen at this block
)

const actionWatcher = new BaseActionWatcher(
    actionReader,
    actionHandler,
    250, // Poll at twice the block interval for less latency
)

actionWatcher.watch() // Start watch loop