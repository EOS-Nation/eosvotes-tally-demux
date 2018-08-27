import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

// parse .env file
const envPath = path.join(__dirname, "..", ".env")
dotenv.config({path: envPath})

// EOSIO configurations
export const EOSIO_API = process.env.EOSIO_API || "http://localhost:8888"

// EOS Votes configurations
export const EOSVOTES_FIRST_BLOCK = Number(process.env.EOSVOTES_FIRST_BLOCK || 9304569)
export const EOSVOTES_CODE = process.env.EOSVOTES_CODE || "eosforumdapp"
export const EOSVOTES_ONLY_IRREVERSIBLE = process.env.EOSVOTES_ONLY_IRREVERSIBLE ? JSON.parse(process.env.EOSVOTES_ONLY_IRREVERSIBLE) : true

// DemuxJS
export const DEMUX_LEVELDB = process.env.DEMUX_LEVELDB || "./mydb";
export const DEMUX_CONTRACT_BLACKLIST = process.env.DEMUX_CONTRACT_BLACKLIST ? process.env.DEMUX_CONTRACT_BLACKLIST.split(",") : ["blocktwitter"];
export const DEMUX_CONTRACT_WHITELIST = process.env.DEMUX_CONTRACT_WHITELIST ? process.env.DEMUX_CONTRACT_WHITELIST.split(",") : [""];

// Save .env if does not exist
if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, `# EOSIO
EOSIO_API="${EOSIO_API}"

# EOS Votes
EOSVOTES_FIRST_BLOCK=${EOSVOTES_FIRST_BLOCK}
EOSVOTES_CODE="${EOSVOTES_CODE}"
EOSVOTES_ONLY_IRREVERSIBLE=${EOSVOTES_ONLY_IRREVERSIBLE}

# DemuxJS
DEMUX_LEVELDB="${DEMUX_LEVELDB}"
DEMUX_CONTRACT_BLACKLIST="${DEMUX_CONTRACT_BLACKLIST}"
DEMUX_CONTRACT_WHITELIST="${DEMUX_CONTRACT_WHITELIST}"
`)
}