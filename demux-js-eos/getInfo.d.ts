// Generated by https://quicktype.io
//
// To change quicktype's target language, run command:
//
//   "Set quicktype target language"

export interface GetInfo {
    server_version:              string;
    chain_id:                    string;
    head_block_num:              number;
    last_irreversible_block_num: number;
    last_irreversible_block_id:  string;
    head_block_id:               string;
    head_block_time:             string;
    head_block_producer:         string;
    virtual_block_cpu_limit:     number;
    virtual_block_net_limit:     number;
    block_cpu_limit:             number;
    block_net_limit:             number;
}