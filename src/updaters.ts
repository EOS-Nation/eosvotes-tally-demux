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
    if (!state.proposals[proposer]) state.proposals[proposer] = {}
    state.proposals[proposer][proposal_name] = tally

    // Update Demux Index State
    state.indexState.blockHash = blockHash
    state.indexState.blockNumber = blockNumber
}

/**
 * Unpropose - removal of proposal based on proposer + proposal_name
 */
function updateUnpropose(state: State, payload: Payload<EOSForumUnpropose>, blockInfo: BlockInfo, context: any) {
    const { proposer, proposal_name } = payload.data;

    // Delete proposals
    if (state.proposals[proposer] && state.proposals[proposer][proposal_name]) { delete state.proposals[proposer][proposal_name] }
}

/**
 * Vote - voter casts registers his vote on proposal
 */
async function updateVote(state: State, payload: Payload<EOSForumVote>, blockInfo: BlockInfo, context: any) {
    const eosforumVote = payload.data;
    const { proposer, proposal_name } = payload.data;
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
    if (!state.voters[eosforumVote.voter].proposals[proposer]) state.voters[eosforumVote.voter].proposals[proposer] = {}
    state.voters[eosforumVote.voter].proposals[proposer][proposal_name] = vote

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
        [proposer: string]: {
            [proposal_name: string]: TallySummary
        }
    } = {};

    for (const account_name of Object.keys(state.voters)) {
        // Voter Information
        const voter = state.voters[account_name];

        // Iterate over each proposal
        for (const proposer of Object.keys(voter.proposals)) {
            for (const proposal_name of Object.keys(voter.proposals[proposer])) {
                const {vote} = voter.proposals[proposer][proposal_name]

                // Update Block Status
                if (state.proposals[proposer] && state.proposals[proposer][proposal_name]) {
                    if (!state.proposals[proposer]) state.proposals[proposer] = {}
                    state.proposals[proposer][proposal_name].blockNumber = blockNumber
                    state.proposals[proposer][proposal_name].blockHash = blockHash
                } else {
                    // Usually happens if EOSVotes tally started after the proposal
                    logError("eosforumdapp::vote", blockNumber, `tally missing [${proposer}:${proposal_name}]`)

                    // UPDATE missing `proposals`
                    const proposal = await getProposal(EOSVOTES_CODE, proposer, proposal_name)

                    if (proposal) {
                        // Set default tally
                        const tally: Tally = Object.assign(defaultTally(blockNumber, blockHash), proposal);

                        if (!state.proposals[proposer]) state.proposals[proposer] = {}
                        state.proposals[proposer][proposal_name] = tally
                    }
                }

                // Calculate Summary of Votes
                // Default Summary if not exist
                if (!summary[proposer]) summary[proposer] = {}
                if (summary[proposer] && !summary[proposer][proposal_name]) {
                    summary[proposer][proposal_name] = defaultTally(blockNumber, blockHash)
                }

                // Calculate Votes
                if (summary[proposer][proposal_name].votes[vote]) summary[proposer][proposal_name].votes[vote] += 1;
                else summary[proposer][proposal_name].votes[vote] = 1;
                summary[proposer][proposal_name].votes.total += 1;

                // Calculate Staked
                if (summary[proposer][proposal_name].staked[vote]) summary[proposer][proposal_name].staked[vote] += voter.staked;
                else summary[proposer][proposal_name].staked[vote] = voter.staked;
                summary[proposer][proposal_name].staked.total += voter.staked;

                // Calculate Last Vote Weight
                if (summary[proposer][proposal_name].last_vote_weight[vote]) summary[proposer][proposal_name].last_vote_weight[vote] += Number(voter.last_vote_weight);
                else summary[proposer][proposal_name].last_vote_weight[vote] = Number(voter.last_vote_weight);
                summary[proposer][proposal_name].last_vote_weight.total += Number(voter.last_vote_weight);
            }
        }
    }

    // Save Tally Calculations
    for (const proposer of Object.keys(summary)) {
        for (const proposal_name of Object.keys(summary[proposer])) {
            // Save Votes
            state.proposals[proposer][proposal_name].votes = summary[proposer][proposal_name].votes;
            state.proposals[proposer][proposal_name].staked = summary[proposer][proposal_name].staked;
            state.proposals[proposer][proposal_name].last_vote_weight = summary[proposer][proposal_name].last_vote_weight;
        }
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