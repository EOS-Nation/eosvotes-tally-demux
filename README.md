# EOSVotes Demux Tally

[![Build Status](https://travis-ci.org/EOS-Nation/eosvotes-demux-tally.svg?branch=master)](https://travis-ci.org/EOS-Nation/eosvotes-demux-tally)
[![npm version](https://badge.fury.io/js/eosvotes-demux-tally.svg)](https://badge.fury.io/js/eosvotes-demux-tally)
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/EOS-Nation/eosvotes-demux-tally/master/LICENSE)

EOS Votes tally based on DemuxJS, quickly retrieve all proposals and total votes tally on [`eosforumdapp`](https://github.com/eoscanada/eosio.forum).

## Install

```bash
$ git clone https://github.com/EOS-Nation/eosvotes-demux-tally.git
$ cd eosvotes-demux-tally
$ npm install
```

## Quickstart

```bash
$ npm start
```

## To-Do

- [ ] Expose State using GraphQL
- [ ] Improve DemuxJS Error Handling
  - [ ] Handle forks
  - [ ] Handle connection issue
- [ ] Improve Logging
  - [ ] Average Speed Block/second
- [x] Dockerize
- [ ] Clear definition of State JSON schema
- [ ] Host JSON blobs on api.eosvotes.io
- [ ] Output scoped JSON file
- [ ] Host JSON files on AWS
- [ ] Include vote decay `last_vote_weight`
- [ ] Reverse vote weight into EOS

## UI Filters

- Proposer name
- Newest
- Sort By Votes