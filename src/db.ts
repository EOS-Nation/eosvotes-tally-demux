import { Batch, LevelUpBase } from "levelup";
import * as config from "./config";
import levelup from "levelup";
import leveldown from "leveldown";

// LevelDB to improve local caching
const down: any = leveldown(config.DEMUX_LEVELDB);
export const db: LevelUpBase<Batch> = levelup(down);
