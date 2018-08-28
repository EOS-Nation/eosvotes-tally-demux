// import * as path from "path";
// import * as write from "write-json-file";
// import { CronJob } from "cron";
import axios from "axios"
import express from "express";
import { BaseActionWatcher } from "./demux-js"
import { LevelDBActionReader } from "./demux-js-leveldb"
import { state } from "./src/state"
import updaters from "./src/updaters"
import effects from "./src/effects"
import ObjectActionHandler from "./src/ObjectActionHandler"
import * as config from "./src/config"
import { filterProposalsByScope, filterVotersByScope, filterTalliesByScope } from "./src/utils"
import { db } from "./src/db"

const actionHandler = new ObjectActionHandler(
    updaters,
    effects,
)

const actionReader = new LevelDBActionReader(
    config.EOSIO_API, // Locally hosted node needed for reasonable indexing speed
    config.EOSVOTES_FIRST_BLOCK, // First actions relevant to this dapp happen at this block
    config.EOSVOTES_ONLY_IRREVERSIBLE, // Only irreversible blocks
    600, // Max History Length
    axios, // Axios Instance
    db, // LevelDB Instance
    config.DEMUX_CONTRACT_BLACKLIST, // Demux Contract Blacklist
    config.DEMUX_CONTRACT_WHITELIST, // Demux Contract Whitelist
)

const actionWatcher = new BaseActionWatcher(
    actionReader,
    actionHandler,
    500, // Poll at twice the block interval for less latency
)

actionWatcher.watch() // Start watch loop

// // Save State to JSON
// new CronJob('* * * * *', async () => {
//     const name = `${state.indexState.blockNumber}.json`

//     // Save Proposals
//     write.sync(path.join(__dirname, "aws", "proposals", "eosvotes-proposals-" + name), state.proposals)
//     write.sync(path.join(__dirname, "aws", "proposals", "latest.json"), state.proposals)

//     // Save Tally
//     write.sync(path.join(__dirname, "aws", "tally", "eosvotes-tally-" + name), state.tally)
//     write.sync(path.join(__dirname, "aws", "tally", "latest.json"), state.tally)

//     // Save Voters
//     write.sync(path.join(__dirname, "aws", "voters", "eosvotes-voters-" + name), state.voters)
//     write.sync(path.join(__dirname, "aws", "voters", "latest.json"), state.voters)
// }, () => {}, true, 'America/Toronto')

// Expose State via simple HTTP express app
const app = express()
app.set('json spaces', 2)

// Full State
app.get('/', (req, res) => res.json(state))
app.get('/proposals.json', (req, res) => res.json(state.proposals))
app.get('/tallies.json', (req, res) => res.json(state.tallies))
app.get('/voters.json', (req, res) => res.json(state.voters))

// Scoped State
app.get('/:scope', (req, res) => {
    res.json({
        proposals: filterProposalsByScope(state, req.params.scope),
        tallies: filterTalliesByScope(state, req.params.scope),
        voters: filterVotersByScope(state, req.params.scope)
    })
})
app.get('/:scope/proposals.json', (req, res) => res.json(filterProposalsByScope(state, req.params.scope)))
app.get('/:scope/tallies.json', (req, res) => res.json(filterTalliesByScope(state, req.params.scope)))
app.get('/:scope/voters.json', (req, res) => res.json(filterVotersByScope(state, req.params.scope)))

app.listen(3000, () => console.log('Example app listening on port 3000!'))
