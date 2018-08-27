import * as config from "./config"
import { LevelUpBase, Batch } from "levelup";
const levelup = require("levelup");
const leveldown = require("leveldown");

// LevelDB to improve local caching
export const db: LevelUpBase<Batch> = levelup(leveldown(config.DEMUX_LEVELDB));
