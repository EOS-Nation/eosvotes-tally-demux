import { State, PayloadPropose, PayloadUnpropose, PayloadVote, BlockInfo } from "../types"
import { createProposalKey, logInfo } from "./utils"

function logPropose(state: State, payload: PayloadPropose, blockInfo: BlockInfo, context: any) {
    const proposalKey = createProposalKey(payload.data);
    logInfo("eosforumdapp::propose", blockInfo.blockNumber, proposalKey)
}

function logUnpropose(state: State, payload: PayloadUnpropose, blockInfo: BlockInfo, context: any) {
    const proposalKey = createProposalKey(payload.data);
    logInfo("eosforumdapp::unpropose", blockInfo.blockNumber, proposalKey)
}

function logVote(state: State, payload: PayloadVote, blockInfo: BlockInfo, context: any) {
    const proposalKey = createProposalKey(payload.data);
    logInfo("eosforumdapp::vote", blockInfo.blockNumber, proposalKey)
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
    {
        actionType: "eosforumdapp::vote",
        effect: logVote,
    },
]
