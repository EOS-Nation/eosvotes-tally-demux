import { default as request, RequestPromise, RequestPromiseOptions } from "request-promise-native";
import axios from "axios"
import { AbstractActionReader } from "../demux-js"
import { NodeosBlock } from "./NodeosBlock"
import { RawBlock } from "./rawBlock";
import { GetInfo } from "./getInfo";

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
    protected axiosInstance = axios,
  ) {
    super(startAtBlock, onlyIrreversible, maxHistoryLength)
    // Remove trailing slashes
    this.nodeosEndpoint = nodeosEndpoint.replace(/\/+$/g, "")
  }

  /**
   * Returns a promise for the head block number.
   */
  public async getHeadBlockNumber(): Promise<number> {
    const url = `${this.nodeosEndpoint}/v1/chain/get_info`;
    const options = { responseType: "json" };
    const response = await this.axiosInstance.get<GetInfo>(url, options);
    const getInfo = response.data;

    if (this.onlyIrreversible) {
      return getInfo.last_irreversible_block_num
    }
    return getInfo.head_block_num
  }

  /**
   * Returns a promise for a `NodeosBlock`.
   */
  public async getBlock(blockNumber: number): Promise<NodeosBlock> {
    const url = `${this.nodeosEndpoint}/v1/chain/get_block`;
    const data = { block_num_or_id: blockNumber };
    const options = { responseType: "json" };
    const response = await this.axiosInstance.post<RawBlock>(url, data, options)
    const rawBlock = response.data;
    return new NodeosBlock(rawBlock)
  }
}
