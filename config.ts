import dotenv from "dotenv"

// parse .env file
dotenv.config()

// EOSIO configurations
export const EOSIO_API = process.env.EOSIO_API || "https://localhost:8888"

// EOS Votes configurations
export const EOSVOTES_FIRST_BLOCK = Number(process.env.EOSVOTES_FIRST_BLOCK || 7813566)
export const EOSVOTES_CODE = process.env.EOSVOTES_CODE || "eosforumdapp"
export const EOSVOTES_ONLY_IRREVERSIBLE = process.env.EOSVOTES_ONLY_IRREVERSIBLE ? JSON.parse(process.env.EOSVOTES_ONLY_IRREVERSIBLE) : true
