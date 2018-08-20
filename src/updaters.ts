import { logError } from "./logging";
import { getAccountStaked, parseJSON, createProposalKey } from "./utils";
import { State, Payload, Propose, Unpropose, BlockInfo, ProposeJSON, Vote, Tally, Voter } from "../types";
import { EOSVOTES_CODE } from "../config"

/**
 * Propose - creation of new proposal based on proposer + proposal_name
 */
function updatePropose(state: State, payload: Payload<Propose>, blockInfo: BlockInfo, context: any) {
    const proposal_key = createProposalKey(payload.data);
    const proposal_json = parseJSON(payload.data.proposal_json);
    const { proposer, proposal_name, title } = payload.data;
    const { blockHash, blockNumber } = blockInfo;

    // Define Proposal with JSON proposal
    const proposal: ProposeJSON = {
        proposer,
        proposal_name,
        title,
        proposal_json
    }

    // Set default tally
    const tally: Tally = {
        active: true,
        blockNumber,
        blockHash,
        totalVoters: {},
        totalStaked: {},
        voters: {}
    }

    // Update proposals
    if (!state.proposals[proposal_key]) { state.proposals[proposal_key] = proposal }
    if (!state.tally[proposal_key]) { state.tally[proposal_key] = tally }

    // Update Index State
    state.indexState.blockHash = blockHash
    state.indexState.blockNumber = blockNumber
}

/**
 * Unpropose - removal of proposal based on proposer + proposal_name
 */
function updateUnpropose(state: State, payload: Payload<Unpropose>, blockInfo: BlockInfo, context: any) {
    const proposal_key = createProposalKey(payload.data);

    // Delete proposal
    if (state.proposals[proposal_key]) { delete state.proposals[proposal_key] }

    // Disable tally
    if (state.tally[proposal_key]) { state.tally[proposal_key].active = false }
}

/**
 * Vote - voter casts registers his vote on proposal
 */
async function updateVote(state: State, payload: Payload<Vote>, blockInfo: BlockInfo, context: any) {
    const {voter, vote} = payload.data;
    const proposal_key = createProposalKey(payload.data);
    const staked = await getAccountStaked(voter);
    const vote_json = parseJSON(payload.data.vote_json)

    // Add proposal to voter
    if (state.voters[voter]) {
        // Add proposal key to array of proposal
        if (state.voters[voter].proposals.indexOf(proposal_key) === -1) {
            state.voters[voter].proposals.push(proposal_key)
        }
    } else {
        state.voters[voter] = {
            proposals: [proposal_key]
        }
    }

    // Add voter to Tally
    const tally = state.tally[proposal_key]
    if (tally) {
        tally.blockNumber = blockInfo.blockNumber
        tally.blockHash = blockInfo.blockHash
        tally.voters[voter] = {staked, vote, vote_json}

        // To-Do
        // update => tally.totalVoters
        // update => tally.totalStaked
    } else {
        logError("eosforumdapp::vote", blockInfo.blockNumber, `tally missing proposal_key [${proposal_key}]`)
    }
}

export default [
    {
        actionType: `${EOSVOTES_CODE}::propose`,
        updater: updatePropose,
    },
    {
        actionType: `${EOSVOTES_CODE}::unpropose`,
        updater: updateUnpropose,
    },
    {
        actionType: `${EOSVOTES_CODE}::vote`,
        updater: updateVote,
    },
]