import { State, PayloadPropose, PayloadUnpropose } from "../types"
import { createProposalKey, logInfo } from "./utils"

function logPropose(state: State, payload: PayloadPropose, blockInfo: any, context: any) {
    const proposalKey = createProposalKey(payload.data);
    logInfo("eosforumdapp::propose", proposalKey)
}

function logUnpropose(state: State, payload: PayloadUnpropose, blockInfo: any, context: any) {
    const proposalKey = createProposalKey(payload.data);
    logInfo("eosforumdapp::unpropose", proposalKey)
}

export default [
    {
        actionType: "eosforumdapp::propose",
        effect: logPropose,
    },
    {
        actionType: "eosforumdapp::unpropose",
        effect: logUnpropose,
    },
]
