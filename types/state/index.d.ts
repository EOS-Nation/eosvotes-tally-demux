import { EOSForumProposeJSON } from "../eosforumdapp"
import { Tally } from "./tally"
import { Voter } from "./voter"
export * from "./tally"
export * from "./voter"

export interface State {
    /**
     * Status of vote tally
     */
    tally: {
        /**
         * proposal_key = "proposer:proposal_name"
         */
        [proposal_key: string]: Tally
    }
    /**
     * Status of all proposals
     */
    proposals: {
        /**
         * proposal_key = "proposer:proposal_name"
         */
        [proposal_key: string]: EOSForumProposeJSON
    },
    /**
     * Status of Voters
     *
     * Used to track which proposals to update when undelegatebw & delegatebw actions occur
     */
    voters: {
        /**
         * Voter Account Name
         */
        [account_name: string]: Voter
    }
    /**
     * Demux Index State
     */
    indexState: {
        blockNumber: number,
        blockHash: string,
    }
}
