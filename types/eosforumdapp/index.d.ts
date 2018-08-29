export interface EOSForumVoteBase {
    voter: string
    proposer: string
    proposal_name: string
    proposal_hash?: string
    vote: number
}

export interface EOSForumVote extends EOSForumVoteBase {
    vote_json?: string
}

export interface EOSForumVoteJSON extends EOSForumVoteBase {
    vote_json?: object
}

export interface EOSForumProposeBase {
    proposer: string,
    proposal_name: string,
    title: string,
}

export interface EOSForumPropose extends EOSForumProposeBase {
    proposal_json: string,
}

export interface EOSForumProposeJSON extends EOSForumProposeBase  {
    proposal_json: object,
}

export interface EOSForumUnpropose {
    proposer: string,
    proposal_name: string,
}

export interface EOSForumTableProposal {
    proposal_name: string,
    title: string,
    proposal_json: string,
}