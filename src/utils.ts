import axios from "axios";
import chalk from "chalk";
import * as crypto from "crypto"
import * as config from "../config";
import { GetAccount, GetTableRows } from "../types";

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
 * Log Info
 *
 * @param {string} actionType ActionType
 * @param {number} blockNumber Block Number
 * @param {string} message Message
 * @returns {void}
 * @example
 * logInfo("eosforumdapp::propose", 50000, "eoscanadacom:havefunornot")
 */
export function logInfo(actionType: string, blockNumber: number, message: string) {
    const time = new Date().toLocaleString();
    console.info(`${time}    ${blockNumber}    ${actionType}    ${message}`)
}

/**
 * Log Info
 *
 * @param {string} actionType ActionType
 * @param {number} blockNumber Block Number
 * @param {string} message Message
 * @returns {void}
 * @example
 * logError("eosforumdapp::vote", 50000, "tally missing proposal_key")
 */
export function logError(actionType: string, blockNumber: number, message: string) {
    const time = new Date().toLocaleString();
    console.info(chalk.red(`${time}    ${blockNumber}    ${actionType}    ${message}`))
}

/**
 * Parse string to JSON
 * @param {string} str String
 * @returns {object} JSON
 * @example
 * parseJSON("{foo: 'bar'}") //=> {foo: "bar"}
 */
export function parseJSON(str: string) {
    // Try to parse JSON
    if (str) {
        try {
            return JSON.parse(str)
        } catch (e) {
            return  {}
        }
    } else { return {} }
}

/**
 * Get Account Staked EOS (voting weight)
 *
 * @param {string} account_name Account Name
 * @returns {number} total staked
 */
export async function getAccountStaked(account_name: string) {
    const url = config.EOSIO_API + '/v1/chain/get_account';
    const {data} = await axios.post<GetAccount>(url, {account_name})
    if (data.total_resources) {
        const {net_weight, cpu_weight} = data.total_resources;
        return parseTokenString(net_weight).amount + parseTokenString(cpu_weight).amount;
    } else { return 0; }
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
 * Parse Proposal hash
 * @param {string} title Title
 * @param {object|string} proposal_json Proposal JSON
 * @returns {string} Proposal Hash
 */
export function parseProposalHash(title: string, proposal_json: string | object) {
    if (typeof proposal_json === "object") {
        proposal_json = JSON.stringify(JSON.stringify(proposal_json));

        // Not sure if an issue with eosforumdapp hash, but need to prevent escaping of \n
        proposal_json = proposal_json.replace("\\n", "\n")
    }
    return crypto.createHash('sha256').update(title + proposal_json, 'utf8').digest().toString('hex')
}
