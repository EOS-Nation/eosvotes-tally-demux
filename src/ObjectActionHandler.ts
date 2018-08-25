import { AbstractActionHandler, Block } from "../demux-js"
import { state } from "./state";

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
        console.log("ERASE BLOCK", blockNumber)
    }
}
