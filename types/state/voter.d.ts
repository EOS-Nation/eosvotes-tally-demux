import { VoterInfo } from "../eosio/chain/get_account"

export interface Vote {
    /**
     * eosio.forum Vote value
     */
    vote: number
    /**
     * eosio.forum Vote JSON
     */
    vote_json: object
}

export interface Voter extends VoterInfo {
    /**
     * proposal_key = "proposer:proposal_name"
     */
    proposals: {
        [proposal_key: string]: Vote
    }
}
