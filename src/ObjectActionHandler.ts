import { AbstractActionHandler, Block } from "../demux-js"
import { state } from "./state";
import { db } from "./db";

export default class ObjectActionHandler extends AbstractActionHandler {
    async handleWithState(handle: any) {
        await handle(state)
    }

    async loadIndexState() {
        return state.indexState
    }

    async updateIndexState(state: any, block: Block, isReplay: boolean, context: any) {
        state.indexState.blockNumber = block.blockInfo.blockNumber
        state.indexState.blockHash = block.blockInfo.blockHash
    }
    /**
     * Will run when a rollback block number is passed to handleActions. Implement this method to
     * handle reversing actions full blocks at a time, until the last applied block is the block
     * number passed to this method.
     */
    async rollbackTo(blockNumber: number) {
        try {
            await db.del(blockNumber)
        } catch (e) {
            // NotFoundError: Key not found in database [9000718]
        }
        console.log("ERASE BLOCK", blockNumber)
    }
}
