import { LevelUpBase, Batch } from "levelup"
import { NodeosBlock, NodeosActionReader } from "../demux-js-eos"
import request from "request-promise-native"

/**
 * Reads from an EOSIO nodeos node to get blocks of actions.
 * It is important to note that deferred transactions will not be included,
 * as these are currently not accessible without the use of plugins.
 */
export class LevelDBActionReader extends NodeosActionReader {
  protected nodeosEndpoint: string
  constructor(
    protected db: LevelUpBase<Batch>,
    nodeosEndpoint: string = "http://localhost:8888",
    public startAtBlock: number = 1,
    protected onlyIrreversible: boolean = false,
    protected maxHistoryLength: number = 600,
    protected requestInstance: any = request,
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
    const rawBlock = await this.httpRequest("post", {
      url: `${this.nodeosEndpoint}/v1/chain/get_block`,
      json: { block_num_or_id: blockNumber },
    });

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
