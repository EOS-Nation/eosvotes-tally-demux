import dotenv from "dotenv"

// parse .env file
dotenv.config()

// EOSIO configurations
export const EOSIO_API = process.env.EOSIO_API || "https://api.eosn.io"

// EOS Votes configurations
export const EOSVOTES_FIRST_BLOCK = Number(process.env.EOSVOTES_FIRST_BLOCK || 7813566)
