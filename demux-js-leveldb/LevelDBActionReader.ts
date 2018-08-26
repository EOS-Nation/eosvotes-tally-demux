import request from "request-promise-native";
import axios from "axios";
import { LevelUpBase, Batch } from "levelup";
import { NodeosBlock, NodeosActionReader } from "../demux-js-eos";
import { RawBlock, Action, TransactionElement } from "../demux-js-eos/rawBlock";

/**
 * Reads from an EOSIO nodeos node to get blocks of actions.
 * It is important to note that deferred transactions will not be included,
 * as these are currently not accessible without the use of plugins.
 */
export class LevelDBActionReader extends NodeosActionReader {
  protected nodeosEndpoint: string
  constructor(
    nodeosEndpoint: string = "http://localhost:8888",
    public startAtBlock: number = 1,
    protected onlyIrreversible: boolean = false,
    protected maxHistoryLength: number = 600,
    protected axiosInstance = axios,
    protected db: LevelUpBase<Batch>,
    protected contractBlacklist: string[],
  ) {
    super(nodeosEndpoint, startAtBlock, onlyIrreversible, maxHistoryLength)
    // Remove trailing slashes
    this.nodeosEndpoint = nodeosEndpoint.replace(/\/+$/g, "")
  }

  /**
   * Returns a promise for a `NodeosBlock`.
   */
  public async getBlock(blockNumber: number): Promise<NodeosBlock> {
    // Query LevelDB first
    const block = await this.getLevelBlock(blockNumber)
    if (block) { return block; }

    // API HTTP request for block
    const url = `${this.nodeosEndpoint}/v1/chain/get_block`;
    const data = { block_num_or_id: blockNumber };
    const options = { responseType: "json" }
    const response = await this.axiosInstance.post<RawBlock>(url, data, options);
    const rawBlock = response.data;

    // Filter actions based on blacklist contracts
    const blocktwitter = JSON.stringify(rawBlock.transactions).includes("blocktwitter")
    if (blocktwitter) console.log("before", rawBlock.transactions[0].trx.transaction.actions.length)
    filterContractBlacklist(rawBlock, this.contractBlacklist)
    if (blocktwitter) console.log("after", rawBlock.transactions[0].trx.transaction.actions.length)

    // Save rawBlock to LevelDB as string
    await this.db.put(blockNumber, JSON.stringify(rawBlock));

    // Parse NodeosBlock
    return new NodeosBlock(rawBlock);
  }

  /**
   * Query LevelDB to receive Nodeos rawBlock
   */
  public async getLevelBlock(blockNumber: number): Promise<NodeosBlock|null> {
    let rawBlock
    try {
      // Retrieve string rawBlock from LevelDB
      rawBlock = await this.db.get(blockNumber)
    } catch (e) {
      // NotFoundError: Key not found in database [9000718]
      return null
    }

    if (rawBlock) {
      try {
        // Convert rawBlock string to NodeosBlock
        rawBlock = JSON.parse(rawBlock)
        return new NodeosBlock(rawBlock);
      } catch (e) {
        // Corrupt block
        await this.db.del(blockNumber)
        return null
      }
    }
    return null
  }
}

/**
 * Filter Contract Blacklist
 */
function filterContractBlacklist(rawBlock: RawBlock, contractBlacklist: string[]) {
  // Zero transactions
  if (!rawBlock.transactions.length) { return rawBlock }

  // const transactions: TransactionElement[] = [];

  // rawBlock.transactions.forEach(transaction => {
  //   const actions: Action[] = [];

  //   transaction.trx.transaction.actions.forEach(action => {
  //     if (contractBlacklist.indexOf(action.account) !==1) {
  //       actions.push(action);
  //     }
  //   })
  //   if (actions.length) {
  //     transaction.trx.transaction.actions = actions
  //   }
  // });
  return rawBlock
}