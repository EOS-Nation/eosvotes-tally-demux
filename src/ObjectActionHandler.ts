import { AbstractActionHandler } from "../demux-js"
import { state } from "../state";

export default class ObjectActionHandler extends AbstractActionHandler {
    async handleWithState(handle: any) {
        await handle(state)
    }

    async loadIndexState() {
        return state.indexState
    }

    async updateIndexState(stateObj: any, block: any) {
        stateObj.indexState.blockNumber = block.blockNumber
        stateObj.indexState.blockHash = block.blockHash
    }
}
