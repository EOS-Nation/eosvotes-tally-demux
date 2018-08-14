#!/usr/bin/env bash

cleos push action eosforumdapp propose '["voter1", "eosvotetally", "EOSIO Vote Tally", "{\"type\": \"bps-proposal-v1\", \"content\": \"Testing EOSIO Vote Tally\"}"]' -p voter1@active
cleos push action eosforumdapp vote '["voter1", "voter1", "eosvotetally", "366cefa04e47b233f4fe07e3fa7aad0f882688f012423d0ae98ce067f9fcb352", 1, ""]' -p voter1@active
