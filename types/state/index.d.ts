import { EOSForumProposeJSON } from "../eosforumdapp";
import { Tally } from "./tally";
import { Voter } from "./voter";
export * from "./tally";
export * from "./voter";

export interface Global {
    /**
     * Current EOS supply from `eosio.token`
     */
    supply: string
}

export interface Proposals {
    /**
     * proposer => proposal_name
     */
    [proposer: string]: {
        [proposal_name: string]: Tally,
    };
}

export interface Voters {
    /**
     * Voter Account Name
     */
    [account_name: string]: Voter;
}

export interface State {
    /**
     * Status of all proposals
     */
    proposals: Proposals;
    /**
     * Status of Voters
     *
     * Used to track which proposals to update when undelegatebw & delegatebw actions occur
     */
    voters: Voters;
    /**
     * Demux Index State
     */
    indexState: {
        blockNumber: number,
        blockHash: string,
    };
    /**
     * Global
     */
    global: Global;
}
