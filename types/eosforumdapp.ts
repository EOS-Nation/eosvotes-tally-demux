export interface VoteBase {
    voter: string
    proposer: string
    proposal_name: string
    proposal_hash?: string
    vote: boolean
}

export interface Vote extends VoteBase {
    vote_json?: string
}

export interface VoteJSON extends VoteBase {
    vote_json?: object
}

export interface ProposeBase {
    proposer: string,
    proposal_name: string,
    title: string,
}

export interface Propose extends ProposeBase {
    proposal_json: string,
}

export interface ProposeJSON extends ProposeBase  {
    proposal_json: object,
}

export interface Unpropose {
    proposer: string,
    proposal_name: string,
}
