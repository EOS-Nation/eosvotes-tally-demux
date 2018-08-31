import { Batch, LevelUpBase } from "levelup";
import * as config from "./config";
const levelup = require("levelup");
const leveldown = require("leveldown");

// LevelDB to improve local caching
export const db: LevelUpBase<Batch> = levelup(leveldown(config.DEMUX_LEVELDB));
