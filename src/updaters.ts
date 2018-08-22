import { logError } from "./logging";
import { getAccount, parseJSON, createProposalKey } from "./utils";
import { State, Payload, BlockInfo, Tally, Vote } from "../types";
import { EOSForumPropose, EOSForumUnpropose, EOSForumProposeJSON, EOSForumVote } from "../types/eosforumdapp";
import { EOSVOTES_CODE } from "./config"
import { log } from "util";

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
    const tally: Tally = {
        active: true,
        blockNumber,
        blockHash,
        firstBlockNumber: blockNumber,
        firstBlockHash: blockHash,
        votes: {},
        staked: {},
        last_vote_weight: {},
    }

    // Reset or include proposals
    // If proposer pushes a proposal with the same name, reset tally
    state.proposals[proposal_key] = proposal
    state.tally[proposal_key] = tally

    // Update Demux Index State
    state.indexState.blockHash = blockHash
    state.indexState.blockNumber = blockNumber
}

/**
 * Unpropose - removal of proposal based on proposer + proposal_name
 */
function updateUnpropose(state: State, payload: Payload<EOSForumUnpropose>, blockInfo: BlockInfo, context: any) {
    const proposal_key = createProposalKey(payload.data);

    // Delete proposal
    if (state.proposals[proposal_key]) { delete state.proposals[proposal_key] }

    // Disable tally
    if (state.tally[proposal_key]) { delete state.tally[proposal_key] }
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
 *
 * @param {object} state EOSVotes State
 * @param {object} blockInfo Block Info
 * @param {string} proposal_key EOSVotes Proposal Key
 * @returns {void}
 */
function updateTally(state: State, blockInfo: BlockInfo) {
    const { blockNumber, blockHash } = blockInfo;

    // Summary of Votes
    const summary: {
        [vote_key: string]: {
            votes: {
                [vote: number]: number
            }
            staked: {
                [vote: number]: number
            }
            last_vote_weight: {
                [vote: number]: number
            }
        }
    } = {}

    for (const account_name of Object.keys(state.voters)) {
        // Voter Information
        const voter = state.voters[account_name];

        // Iterate over each proposal
        for (const proposal_key of Object.keys(voter.proposals)) {
            const {vote} = voter.proposals[proposal_key]

            // Update Block Status
            if (state.tally[proposal_key]) {
                state.tally[proposal_key].blockNumber = blockNumber
                state.tally[proposal_key].blockHash = blockHash
            } else {
                // Usually happens if EOSVotes tally started after the proposal
                logError("eosforumdapp::vote", blockNumber, `tally missing proposal_key [${proposal_key}]`)

                // ************
                // TO-DO
                // ************
                // UPDATE missing `proposals`

                // Set default tally
                const tally: Tally = {
                    active: true,
                    blockNumber,
                    blockHash,
                    firstBlockNumber: blockNumber,
                    firstBlockHash: blockHash,
                    votes: {},
                    staked: {},
                    last_vote_weight: {},
                }
                state.tally[proposal_key] = tally
            }

            // Calculate Summary of Votes
            const vote_key = `${proposal_key}:${vote}`

            // Default Summary if not exist
            if (!summary[vote_key]) {
                summary[vote_key] = {
                    votes: {},
                    staked: {},
                    last_vote_weight: {},
                }
            }

            if (summary[vote_key].votes[vote]) summary[vote_key].votes[vote] += 1;
            else summary[vote_key].votes[vote] = 1;

            if (summary[vote_key].staked[vote]) summary[vote_key].staked[vote] += voter.staked;
            else summary[vote_key].staked[vote] = voter.staked;

            if (summary[vote_key].last_vote_weight[vote]) summary[vote_key].last_vote_weight[vote] += Number(voter.last_vote_weight);
            else summary[vote_key].last_vote_weight[vote] = Number(voter.last_vote_weight);
        }
    }

    // Save Tally Calculations
    for (const vote_key of Object.keys(summary)) {
        const [scope, proposal, vote] = vote_key.split(':')
        const proposal_key = `${scope}:${proposal}`

        state.tally[proposal_key].votes[Number(vote)] = summary[vote_key].votes[Number(vote)];
        state.tally[proposal_key].staked[Number(vote)] = summary[vote_key].staked[Number(vote)];
        state.tally[proposal_key].last_vote_weight[Number(vote)] = summary[vote_key].last_vote_weight[Number(vote)];
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