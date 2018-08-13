import { ProposeJSON } from "./eosforumdapp"

export interface Voter {
    /**
     * Total Staked EOS
     */
    staked: number
    /**
     * voter's decision (true/false)
     */
    vote: boolean
}

export interface Tally {
    /**
     * Proposal active or not
     */
    active: boolean;
    /**
     * First Vote
     */
    firstVote: {
        blockNumber: number
        blockHash: string
    },
    /**
     * Last Vote
     */
    lastVote: {
        totalVoters: {
            /**
             * total amount of voters using true
             */
            true: number
            /**
             * total amount of voters using false
             */
            false: number
        },
        totalStaked: {
            /**
             * total staked votes using true
             */
            true: number
            /**
             * total staked votes using false
             */
            false: number
        },
        blockNumber: number
        blockHash: string
    },
    /**
     * Array of Voters
     */
    voters: Map<string, Voter>
}

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
        [proposal_key: string]: ProposeJSON
    },
    /**
     * Demux Index State
     */
    indexState: {
        blockNumber: number,
        blockHash: string
    }
    /**
     * Status of Voters
     *
     * Used to track which proposals to update when undelegatebw & delegatebw actions occur
     */
    voters: {
        /**
         * Voter Account Name
         */
        [account_name: string]: {
            /**
             * proposal_key = "proposer:proposal_name"
             */
            proposals: Set<string>
        }
    }
}
