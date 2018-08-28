import { State, Tally } from "../types"

/**
 * Initial State
 */
export const state: State = {
    tallies: {},
    proposals: {},
    voters: {},
    indexState: {
        blockNumber: 0,
        blockHash: ""
    },
}

/**
 * Default Tally
 */
export function defaultTally(blockNumber: number, blockHash: string): Tally {
    return {
        proposer: "",
        proposal_name: "",
        title: "",
        proposal_json: {},
        active: true,
        blockNumber,
        blockHash,
        firstBlockNumber: blockNumber,
        firstBlockHash: blockHash,
        votes: {
            total: 0
        },
        staked: {
            total: 0
        },
        last_vote_weight: {
            total: 0
        },
    }
}
