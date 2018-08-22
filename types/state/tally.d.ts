export interface Tally {
    /**
     * Proposal active or not
     */
    active: boolean;
    /**
     * total amount of votes
     */
    votes: {
        [vote: number]: number
    },
    /**
     * total `staked` votes (divide by 10000 for EOS precision)
     */
    staked: {
        [vote: number]: number
    },
    /**
     * total `last_vote_weight` votes
     */
    last_vote_weight: {
        [vote: number]: number
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
