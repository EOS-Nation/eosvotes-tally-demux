import { State, PayloadPropose } from "./types";

function updatePropose(state: State, payload: PayloadPropose, blockInfo: any, context: any) {
    const proposal = payload.data
    const { proposer, proposal_name } = proposal

    // Try to parse JSON
    try {
        proposal.proposal_json = JSON.parse(proposal.proposal_json)
    } catch (e) {
        console.log(e)
    }

    // First time proposer
    if (!state.proposals[proposer]) {
        state.proposals[proposer] = {}
        state.proposals[proposer][proposal_name] = proposal
    // 2nd time proposer
    } else {
        state.proposals[proposer][proposal_name] = proposal
    }
}

export default [
    {
        actionType: "eosforumdapp::propose",
        updater: updatePropose,
    },
]