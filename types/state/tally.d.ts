export interface Tally {
    /**
     * Proposal active or not
     */
    active: boolean;
    /**
     * total amount of voters based on Vote value
     */
    voters: {
        [value: number]: number
    },
    /**
     * total `staked` votes based on Voter value
     */
    staked: {
        [value: number]: number
    },
    /**
     * total `last_vote_weight` votes based on Vote value
     */
    last_vote_weight: {
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
     * First Block Number
     */
    firstBlockNumber: number
    /**
     * First Block Hash
     */
    firstBlockHash: string
}
