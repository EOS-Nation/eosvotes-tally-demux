import { Vote, Propose, Unpropose } from "./eosforumdapp"

export interface PayloadUnpropose {
    data: Unpropose,
}

export interface PayloadVote {
    data: Vote
}

export interface PayloadPropose {
    data: Propose
}