import { State, PayloadPropose, PayloadUnpropose, PayloadVote, BlockInfo } from "../types"
import { createProposalKey, logInfo } from "./utils"
import { EOSVOTES_CODE } from "../config"

function logPropose(state: State, payload: PayloadPropose, blockInfo: BlockInfo, context: any) {
    const proposalKey = createProposalKey(payload.data);
    logInfo(`${EOSVOTES_CODE}::propose`, blockInfo.blockNumber, proposalKey)
}

function logUnpropose(state: State, payload: PayloadUnpropose, blockInfo: BlockInfo, context: any) {
    const proposalKey = createProposalKey(payload.data);
    logInfo(`${EOSVOTES_CODE}::unpropose`, blockInfo.blockNumber, proposalKey)
}

function logVote(state: State, payload: PayloadVote, blockInfo: BlockInfo, context: any) {
    const proposalKey = createProposalKey(payload.data);
    logInfo(`${EOSVOTES_CODE}::vote`, blockInfo.blockNumber, proposalKey)
}

export default [
    {
        actionType: `${EOSVOTES_CODE}::propose`,
        effect: logPropose,
    },
    {
        actionType: `${EOSVOTES_CODE}::unpropose`,
        effect: logUnpropose,
    },
    {
        actionType: `${EOSVOTES_CODE}::vote`,
        effect: logVote,
    },
]
