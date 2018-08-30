import { logError } from "./logging";
import { getAccount, parseJSON, createProposalKey, getProposal } from "./utils";
import { State, Payload, BlockInfo, Tally, Vote, TallySummary, Undelegatebw, Delegatebw } from "../types";
import { EOSForumPropose, EOSForumUnpropose, EOSForumProposeJSON, EOSForumVote } from "../types/eosforumdapp";
import { defaultTally } from "./state";
import { EOSVOTES_CODE } from "./config"

/**
 * Propose - creation of new proposal based on proposer + proposal_name
 */
function updatePropose(state: State, payload: Payload<EOSForumPropose>, blockInfo: BlockInfo, context: any) {
    const proposal_key = createProposalKey(payload.data);
    const proposal_json = parseJSON(payload.data.proposal_json);
    const { proposer, proposal_name, title } = payload.data;
    const { blockHash, blockNumber } = blockInfo;

    // Define Proposal with JSON proposal
    const proposal: EOSForumProposeJSON = {
        proposer,
        proposal_name,
        title,
        proposal_json
    }

    // Set default tally
    const tally: Tally = Object.assign(defaultTally(blockNumber, blockHash), proposal);

    // Reset or include proposals
    // If proposer pushes a proposal with the same name, reset tally
    state.proposals[proposal_key] = proposal
    state.tallies[proposal_key] = tally

    // Update Demux Index State
    state.indexState.blockHash = blockHash
    state.indexState.blockNumber = blockNumber
}

/**
 * Unpropose - removal of proposal based on proposer + proposal_name
 */
function updateUnpropose(state: State, payload: Payload<EOSForumUnpropose>, blockInfo: BlockInfo, context: any) {
    const proposal_key = createProposalKey(payload.data);

    // Delete proposals
    if (state.proposals[proposal_key]) { delete state.proposals[proposal_key] }

    // Disable tallies
    if (state.tallies[proposal_key]) { delete state.tallies[proposal_key] }
}

/**
 * Vote - voter casts registers his vote on proposal
 */
async function updateVote(state: State, payload: Payload<EOSForumVote>, blockInfo: BlockInfo, context: any) {
    const eosforumVote = payload.data;
    const proposal_key = createProposalKey(eosforumVote);
    const vote_json = parseJSON(payload.data.vote_json)

    // HTTP connection required to get account details
    const account = await getAccount(eosforumVote.voter);
    if (account === null) { return logError("getAccount", blockInfo.blockNumber, `error retrieving account [${eosforumVote.voter}]`) }

    // EOSVotes Vote
    const vote: Vote = Object.assign(eosforumVote, {vote_json})

    // Existing proposals
    const proposals = state.voters[eosforumVote.voter] ? state.voters[eosforumVote.voter].proposals : {}

    // Update Voter Info from EOSIO getAccount
    // Preserve existing proposals
    state.voters[eosforumVote.voter] = Object.assign(account.voter_info, {proposals})

    // Update vote details for target proposal
    state.voters[eosforumVote.voter].proposals[proposal_key] = vote

    // Update Tally Status
    updateTally(state, blockInfo)
}

/**
 * Updates Tally State
 */
async function updateTally(state: State, blockInfo: BlockInfo) {
    const { blockNumber, blockHash } = blockInfo;

    // Summary of Votes
    const summary: {
        [proposal_key: string]: TallySummary
    } = {};

    for (const account_name of Object.keys(state.voters)) {
        // Voter Information
        const voter = state.voters[account_name];

        // Iterate over each proposal
        for (const proposal_key of Object.keys(voter.proposals)) {
            const {vote} = voter.proposals[proposal_key]

            // Update Block Status
            if (state.tallies[proposal_key]) {
                state.tallies[proposal_key].blockNumber = blockNumber
                state.tallies[proposal_key].blockHash = blockHash
            } else {
                // Usually happens if EOSVotes tally started after the proposal
                logError("eosforumdapp::vote", blockNumber, `tally missing proposal_key [${proposal_key}]`)

                // UPDATE missing `proposals`
                const [proposer, proposal_name] = proposal_key.split(':')
                const proposal = await getProposal(EOSVOTES_CODE, proposer, proposal_name)

                if (proposal) {
                    // Set default tally
                    const tally: Tally = Object.assign(defaultTally(blockNumber, blockHash), proposal);

                    state.proposals[proposal_key] = proposal
                    state.tallies[proposal_key] = tally
                }
            }

            // Calculate Summary of Votes
            // Default Summary if not exist
            if (!summary[proposal_key]) {
                summary[proposal_key] = defaultTally(blockNumber, blockHash)
            }

            // Calculate Votes
            if (summary[proposal_key].votes[vote]) summary[proposal_key].votes[vote] += 1;
            else summary[proposal_key].votes[vote] = 1;
            summary[proposal_key].votes.total += 1;

            // Calculate Staked
            if (summary[proposal_key].staked[vote]) summary[proposal_key].staked[vote] += voter.staked;
            else summary[proposal_key].staked[vote] = voter.staked;
            summary[proposal_key].staked.total += voter.staked;

            // Calculate Last Vote Weight
            if (summary[proposal_key].last_vote_weight[vote]) summary[proposal_key].last_vote_weight[vote] += Number(voter.last_vote_weight);
            else summary[proposal_key].last_vote_weight[vote] = Number(voter.last_vote_weight);
            summary[proposal_key].last_vote_weight.total += Number(voter.last_vote_weight);
        }
    }

    // Save Tally Calculations
    for (const proposal_key of Object.keys(summary)) {
        // Save Votes
        state.tallies[proposal_key].votes = summary[proposal_key].votes;
        state.tallies[proposal_key].staked = summary[proposal_key].staked;
        state.tallies[proposal_key].last_vote_weight = summary[proposal_key].last_vote_weight;
    }
}

/**
 * Update Delegatebw & Undelegatebw
 */
async function updateDelegatebw(state: State, payload: Delegatebw, blockInfo: BlockInfo, context: any) {
    const { from, receiver } = payload.data;

    // Update Voter Delegated Resources
    if (state.voters[from]) await updateVoter(from, state, blockInfo)
    if (state.voters[receiver]) await updateVoter(receiver, state, blockInfo)
}

/**
 * Update Voter Delegated Resources
 */
async function updateVoter(account_name: string, state: State, blockInfo: BlockInfo) {
    // HTTP connection required to get account details
    const account = await getAccount(account_name);
    if (account === null) { return logError("getAccount", blockInfo.blockNumber, `error retrieving account [${account_name}]`) }

    // Update Voter Info from EOSIO getAccount
    state.voters[account_name] = Object.assign(state.voters[account_name], account.voter_info)
    // Update Tally Status
    await updateTally(state, blockInfo)
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
    {
        actionType: `eosio::delegatebw`,
        updater: updateDelegatebw,
    },
    {
        actionType: `eosio::undelegatebw`,
        updater: updateDelegatebw,
    },
]