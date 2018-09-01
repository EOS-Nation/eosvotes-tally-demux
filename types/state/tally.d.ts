import { EOSForumProposeJSON } from "../eosforumdapp";

export interface TallySummary {
    /**
     * total amount of votes
     */
    votes: {
        [vote: number]: number
        total: number,
    };
    /**
     * total `staked` votes (divide by 10000 for EOS precision)
     */
    staked: {
        [vote: number]: number
        total: number,
    };
    /**
     * total `last_vote_weight` votes
     */
    last_vote_weight: {
        [vote: number]: number
        total: number,
    };
}

export interface Tally extends EOSForumProposeJSON, TallySummary {
    /**
     * Proposal active or not
     */
    active: boolean;
    /**
     * Last Block Number
     */
    blockNumber: number;
    /**
     * Last Block Hash
     */
    blockHash: string;
    /**
     * First Block Number
     */
    firstBlockNumber: number;
    /**
     * First Block Hash
     */
    firstBlockHash: string;
    /**
     * Vote Participation: Percentage (Proposal EOS staked / 1B EOS)
     *
     * > token holders with no less than 15% vote participation
     */
    voteParticipation: number
}
