import { AbstractActionHandler } from "../demux-js"

const state = { volumeBySymbol: {}, totalTransfers: 0, indexState: { blockNumber: 0, blockHash: "" } } // Initial state

class ObjectActionHandler extends AbstractActionHandler {
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

export default ObjectActionHandler