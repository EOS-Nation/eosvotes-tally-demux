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

## API

## State

**HTTP**
- [https://api.eosvotes.io](https://api.eosvotes.io)
- [https://api.eosvotes.io/{scope}](https://api.eosvotes.io/eostribeprod)

**Schema**
- [types/state/index.d.ts](types/state/index.d.ts)

## Tallies

**HTTP**
- [https://api.eosvotes.io/tallies.json](https://api.eosvotes.io/tallies.json)
- [https://api.eosvotes.io/{scope}/tallies.json](https://api.eosvotes.io/eostribeprod/tallies.json)

**Schema**
- [types/state/tally.d.ts](types/state/tally.d.ts)

## Voters

**HTTP**
- [https://api.eosvotes.io/voters.json](https://api.eosvotes.io/voters.json)
- [https://api.eosvotes.io/{scope}/voters.json](https://api.eosvotes.io/eostribeprod/voters.json)

**Schema**
- [types/state/voter.d.ts](types/state/voter.d.ts)

## Proposals

**HTTP**
- [https://api.eosvotes.io/proposals.json](https://api.eosvotes.io/proposals.json)
- [https://api.eosvotes.io/{scope}/proposals.json](https://api.eosvotes.io/eostribeprod/proposals.json)

**Schema**
- [types/eosforumdapp.d.ts](types/eosforumdapp.d.ts)