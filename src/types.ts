export interface Proposal {
    proposer: string,
    proposal_name: string,
    title: string,
    proposal_json: string,
  }

export interface State {
    proposals: {
        [proposer: string]: {
            [proposal_name: string]: Proposal
        }
    },
    indexState: {
        blockNumber: number,
        blockHash: string,
    }
}

export interface PayloadPropose {
    data: {
        proposer: string,
        proposal_name: string,
        title: string,
        proposal_json: string,
    },
}

export interface BlockInfo {
    blockNumber: number
    blockHash: string
    previousBlockHash: string
}