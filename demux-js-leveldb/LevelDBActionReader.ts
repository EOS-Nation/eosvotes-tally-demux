import axios from "axios";
import { LevelUpBase, Batch } from "levelup";
import { NodeosBlock, NodeosActionReader } from "../demux-js-eos";
import { RawBlock } from "../demux-js-eos/RawBlock";

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
    protected contractWhitelist: string[],
  ) {
    super(nodeosEndpoint, startAtBlock, onlyIrreversible, maxHistoryLength)
    // Remove trailing slashes
    this.nodeosEndpoint = nodeosEndpoint.replace(/\/+$/g, "")
  }

  /**
   * Returns a promise for a `NodeosBlock`.
   */
  public async getBlock(blockNumber: number): Promise<NodeosBlock> {
    // console.log('getBlock', blockNumber);

    // Query LevelDB first
    const block = await this.getLevelBlock(blockNumber)
    if (block) { return block; }

    // API HTTP request for block
    const url = `${this.nodeosEndpoint}/v1/chain/get_block`;
    const data = { block_num_or_id: blockNumber };
    const options = { responseType: "json" }

    let rawBlock: RawBlock;
    try {
      const response = await this.axiosInstance.post<RawBlock>(url, data, options);
      rawBlock = response.data;
    } catch (e) {
      // Restart getBlock HTTP request
      console.error(e);
      return await this.getBlock(blockNumber);
    }

    // Apply Action Filters
    if (this.contractBlacklist.length) filterContractBlacklist(rawBlock, this.contractBlacklist)
    if (this.contractWhitelist.length) filterContractWhitelist(rawBlock, this.contractWhitelist)

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
  rawBlock.transactions = rawBlock.transactions.filter(transaction => {
    if (!transaction.trx.transaction) return false;

    transaction.trx.transaction.actions = transaction.trx.transaction.actions.filter(action => {
      // Filter out action if exists in Contract Blacklist
      if (contractBlacklist.indexOf(action.account) !== -1) {
        return false
      }
      return true
    })
    // Filter transactions with ZERO actions
    return transaction.trx.transaction.actions.length > 0
  });
}

/**
 * Filter Contract Whitelist
 */
function filterContractWhitelist(rawBlock: RawBlock, contractWhitelist: string[]) {
  rawBlock.transactions = rawBlock.transactions.filter(transaction => {
    if (!transaction.trx.transaction) return false;

    transaction.trx.transaction.actions = transaction.trx.transaction.actions.filter(action => {
      // Filter out action if exists in Contract Whitelist
      if (contractWhitelist.indexOf(action.account) !== -1) {
        return true
      }
      return false
    })
    // Filter transactions with ZERO actions
    return transaction.trx.transaction.actions.length > 0
  });
}
