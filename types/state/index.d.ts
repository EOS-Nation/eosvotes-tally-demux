import { EOSForumProposeJSON } from "../eosforumdapp"
import { Tally } from "./tally"
import { Voter } from "./voter"
export * from "./tally"
export * from "./voter"

export interface Proposals {
    /**
     * proposal_key = "proposer:proposal_name"
     */
    [proposal_key: string]: EOSForumProposeJSON
}

export interface Tallies {
    /**
     * proposal_key = "proposer:proposal_name"
     */
    [proposal_key: string]: Tally
}

export interface Voters {
    /**
     * Voter Account Name
     */
    [account_name: string]: Voter
}

export interface State {
    /**
     * Status of vote tallies
     */
    tallies: Tallies,
    /**
     * Status of all proposals
     */
    proposals: Proposals,
    /**
     * Status of Voters
     *
     * Used to track which proposals to update when undelegatebw & delegatebw actions occur
     */
    voters: Voters
    /**
     * Demux Index State
     */
    indexState: {
        blockNumber: number,
        blockHash: string,
    }
}
