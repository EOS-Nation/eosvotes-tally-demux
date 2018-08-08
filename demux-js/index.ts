export * from "./demux/handlers"
export * from "./demux/readers"
export * from "./demux/watchers"

export interface Block {
    actions: Action[]
    blockHash: string
    blockNumber: number
    previousBlockHash: string
  }

export interface IndexState {
    blockNumber: number
    blockHash: string
}

export interface BlockInfo {
    blockHash: string
    blockNumber: number
    previousBlockHash: string
}

export interface Action {
    type: string
    payload: any
}

export interface Updater {
    actionType: string
    updater: (state: any, payload: any, blockInfo: BlockInfo, context: any) => void
}

export interface Effect {
    actionType: string
    effect: (state: any, payload: any, blockInfo: BlockInfo, context: any) => void
}
