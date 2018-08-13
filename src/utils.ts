import axios from "axios";
import chalk from "chalk";
import * as config from "../config";
import { GetAccount } from "../types";

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
 * @param {string} message Message
 * @returns {void}
 * @example
 * logInfo("eosforumdapp::propose", "eoscanadacom:havefunornot")
 */
export function logInfo(actionType: string, message: string) {
    const time = new Date().toLocaleString();
    console.info(chalk.green(`${time}    ${actionType}    ${message}`))
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

// (async () => {
//     const data = await getAccountStaked("eosnationftw")
//     console.log(data);
// })()