import { State, PayloadPropose } from "./types"

function logPropose(state: State, payload: PayloadPropose, blockInfo: any, context: any) {
    console.info("Propose updated:\n", JSON.stringify(state, null, 2))
}

export default [
    {
        actionType: "eosforumdapp::propose",
        effect: logPropose,
    },
]
