import { ProposeJSON } from "./eosforumdapp"

export interface Voter {
    /**
     * Total Staked EOS
     */
    staked: number
    /**
     * voter value
     */
    vote: number
    /**
     * voter JSON
     */
    vote_json: object
}

export interface Tally {
    /**
     * Proposal active or not
     */
    active: boolean;
    /**
     * total amount of voters based on value (integer)
     */
    totalVoters: {
        [value: number]: number
    },
    /**
     * total staked votes based on value (integer)
     */
    totalStaked: {
        [value: number]: number
    },
    /**
     * Last Block Number
     */
    blockNumber: number
    /**
     * Last Block Hash
     */
    blockHash: string
    /**
     * Array of Voters
     */
    voters: {
        [account_name: string]: Voter
    }
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
        blockHash: string,
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
            proposals: string[],
        }
    }
}
