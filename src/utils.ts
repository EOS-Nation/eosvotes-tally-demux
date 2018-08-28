import axios from "axios";
import * as config from "./config";
import { Tallies, Voters, Proposals, State, GetAccount, GetTableRows } from "../types";

/**
 * Parse Token String
 *
 * @param {string} tokenString Token String (eg: "10.0 EOS")
 * @returns {object} Amount & Symbol
 * @example
 * parseTokenString("10.0 EOS") //=> {amount: 10.0, symbol: "EOS"}
 */
export function parseTokenString(tokenString: string) {
    const [amountString, symbol] = tokenString.split(" ")
    const amount = parseFloat(amountString)
    return {amount, symbol}
}

/**
 * Create Proposal Key
 *
 * @param {object} data Data Object
 * @return {string} Proposal Key
 */
export function createProposalKey(data: {proposer: string, proposal_name: string}) {
    return `${data.proposer}:${data.proposal_name}`;
}

/**
 * Parse string to JSON
 * @param {string} str String
 * @returns {object} JSON
 * @example
 * parseJSON("{foo: 'bar'}") //=> {foo: "bar"}
 */
export function parseJSON(str: string | undefined): object {
    // Try to parse JSON
    if (str) {
        try {
            return JSON.parse(str)
        } catch (e) {
            return  {}
        }
    }
    return {}
}

/**
 * Get Account
 *
 * @param {string} account_name Account Name
 * @returns {number} total staked
 */
export async function getAccount(account_name: string): Promise<GetAccount | null> {
    const url = config.EOSIO_API + '/v1/chain/get_account';
    try {
        const {data} = await axios.post<GetAccount>(url, {account_name})
        return data
    } catch (e) {
        return null
    }
}

/**
 * Get Table Rows
 *
 * @param {string} code Provide the smart contract name
 * @param {string} scope Provide the account name
 * @param {string} table Provide the table name
 * @param {object} [options={}] Optional parameters
 * @param {number} [options.lower_bound] Provide the lower bound
 * @param {number} [options.upper_bound] Provide the upper bound
 * @param {number} [options.limit] Provide the limit
 * @returns {object} Table Rows
 */
export async function getTableRows<T = any>(code: string, scope: string, table: string, options: {
    lower_bound?: number,
    upper_bound?: number,
    limit?: number,
} = {}) {
    const url = config.EOSIO_API + '/v1/chain/get_table_rows';
    const params: any = {code, scope, table, json: true};

    // optional parameters
    if (options.lower_bound) { params.lower_bound }
    if (options.upper_bound) { params.upper_bound }
    if (options.limit) { params.limit }

    try {
        const {data} = await axios.post<GetTableRows<T>>(url, params)
        return data
    } catch (e) {
        throw new Error(e);
    }
}

/**
 * voteWeightToday computes the stake2vote weight for EOS, in order to compute the decaying value.
 */
export function voteWeightToday(): number {
    const now = Date.now();
    const secondsInAWeek = 86400 * 7
    const weeksInAYear = 52
    const y2k = new Date(Date.UTC(2000, 0, 1, 0, 0, 0, 0)).getTime()

    const elapsedSinceY2K = (now - y2k) / 1000;
    const weeksSinceY2K = elapsedSinceY2K / secondsInAWeek // truncate to integer weeks
    const yearsSinceY2K = weeksSinceY2K / weeksInAYear
    return Math.pow(yearsSinceY2K, 2)
}

/**
 * Filter Proposals by Scope
 */
export function filterProposalsByScope(state: State, scope: string): Proposals {
    const proposals: Proposals = {}
    for (const proposal_key of Object.keys(state.proposals)) {
        const [proposer] = proposal_key.split(':')
        if (proposer === scope) proposals[proposal_key] = state.proposals[proposal_key];
    }
    return proposals;
}

/**
 * Filter Tallies by Scope
 */
export function filterTalliesByScope(state: State, scope: string): Tallies {
    const tallies: Tallies = {}
    for (const proposal_key of Object.keys(state.tallies)) {
        const [proposer] = proposal_key.split(':')
        if (proposer === scope) tallies[proposal_key] = state.tallies[proposal_key];
    }
    return tallies;
}

/**
 * Filter Voters by Scope
 */
export function filterVotersByScope(state: State, scope: string): Voters {
    const voters: Voters = {}
    for (const account_name of Object.keys(state.voters)) {
        const account = state.voters[account_name]
        for (const proposal_key of Object.keys(account.proposals)) {
            const [proposer] = proposal_key.split(':')
            if (proposer === scope) voters[account_name] = account
        }
    }
    return voters;
}