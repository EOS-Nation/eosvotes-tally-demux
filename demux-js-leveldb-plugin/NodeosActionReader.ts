import { AbstractActionReader } from "../demux-js/demux/readers/AbstractActionReader"
import { NodeosBlock } from "../demux-js/demux/readers/eos/NodeosBlock"

import { LevelUpBase, Batch } from "levelup"
import request from "request-promise-native"

/**
 * Reads from an EOSIO nodeos node to get blocks of actions.
 * It is important to note that deferred transactions will not be included,
 * as these are currently not accessible without the use of plugins.
 */
export class NodeosActionReader extends AbstractActionReader {
  protected nodeosEndpoint: string
  constructor(
    nodeosEndpoint: string = "http://localhost:8888",
    public startAtBlock: number = 1,
    protected onlyIrreversible: boolean = false,
    protected maxHistoryLength: number = 600,
    protected requestInstance: any = request,
    protected db: LevelUpBase<Batch>
  ) {
    super(startAtBlock, onlyIrreversible, maxHistoryLength)
    // Remove trailing slashes
    this.nodeosEndpoint = nodeosEndpoint.replace(/\/+$/g, "")
  }

  /**
   * Returns a promise for the head block number.
   */
  public async getHeadBlockNumber(): Promise<number> {
    const blockInfo = await this.httpRequest("get", {
      url: `${this.nodeosEndpoint}/v1/chain/get_info`,
      json: true,
    })
    if (this.onlyIrreversible) {
      return blockInfo.last_irreversible_block_num
    }
    return blockInfo.head_block_num
  }

  /**
   * Returns a promise for a `NodeosBlock`.
   */
  public async getBlock(blockNumber: number): Promise<NodeosBlock> {
    // Query LevelDB first
    try {
        const cachedBlock = await this.db.get(blockNumber)
        if (cachedBlock) { return JSON.parse(cachedBlock) }
    } catch (e) {
        // not caching
    }
    while (true) {
        try {
            // Query EOSIO API
            const rawBlock = await this.httpRequest("post", {
                url: `${this.nodeosEndpoint}/v1/chain/get_block`,
                json: { block_num_or_id: blockNumber },
            })
            const block = new NodeosBlock(rawBlock)

            // Store in LevelDB for caching
            await this.db.put(blockNumber, JSON.stringify(block))
            return block
        } catch (e) {
            // connection issue
        }
    }
  }

  protected async httpRequest(method: string, requestParams: any): Promise<any> {
    if (method === "get") {
      return await this.requestInstance.get(requestParams)
    } else if (method === "post") {
      return await this.requestInstance.post(requestParams)
    }
  }
}
