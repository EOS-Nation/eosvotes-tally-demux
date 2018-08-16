import { State, Payload, BlockInfo } from "../types"
import { logInfo } from "./logging"
import { EOSVOTES_CODE } from "../config"

function logBase(state: State, payload: Payload, blockInfo: BlockInfo, context: any) {
    logInfo(`${payload.account}::${payload.name}`, blockInfo.blockNumber, JSON.stringify(payload.data));
}

export default [
    {
        actionType: `${EOSVOTES_CODE}::propose`,
        effect: logBase,
    },
    {
        actionType: `${EOSVOTES_CODE}::unpropose`,
        effect: logBase,
    },
    {
        actionType: `${EOSVOTES_CODE}::vote`,
        effect: logBase,
    },
    {
        actionType: `${EOSVOTES_CODE}::unvote`,
        effect: logBase,
    },
    {
        actionType: `${EOSVOTES_CODE}::cleanvotes`,
        effect: logBase,
    },
    {
        actionType: `eosio::delegatebw`,
        effect: logBase
    },
    {
        actionType: `eosio::undelegatebw`,
        effect: logBase
    },
]
