import * as utils from "./utils";
import test from "tape";

test("getTableRows", async (t) => {
    const data = await utils.getTableRows("eosforumdapp", "eoscanadacom", "proposal")
    t.assert(data.rows)
    t.end();
})

test("getTableRows", async (t) => {
    const data = await utils.getAccountStaked("eosnationftw")
    t.assert(data)
    t.end();
})

// test("parseProposalHash", async (t) => {
//     t.equal(utils.parseProposalHash(
//         "The fun dilemma",
//         {"type": "bps-proposal-v1", "content": "# The question\n\nShould we have fun?\n\n# The context\n\nIt's all about fun, all around the world, at the same time.\n\n# The vote\n\nAnswering `true` means we should have fun, answering `false` means we should *not* have fun.\n\nFor your vote to be valid, you must include a SHA-256 hash of the `title` concatenated with the `proposal_json` of this proposal.\n\n# The tally\n\nVotes will be tallied according to the principle of Archimedes, which will be tweaked until it makes sense.\n\n# The timing\n\nThe voting period ends at block 8,000,000 (inclusively). Any votes cast after that will not be counted. You also need to fill in the whole circle with your pen.\n"}
//     ), "e4b00c58d12cc674209861f7cca95f47ad8e7a9c435d4e166f7ac2dbcf5dc05d");

//     t.equal(utils.parseProposalHash(
//         "The fun dilemma",
//         "{\"type\": \"bps-proposal-v1\", \"content\": \"# The question\\n\\nShould we have fun?\\n\\n# The context\\n\\nIt's all about fun, all around the world, at the same time.\\n\\n# The vote\\n\\nAnswering `true` means we should have fun, answering `false` means we should *not* have fun.\\n\\nFor your vote to be valid, you must include a SHA-256 hash of the `title` concatenated with the `proposal_json` of this proposal.\\n\\n# The tally\\n\\nVotes will be tallied according to the principle of Archimedes, which will be tweaked until it makes sense.\\n\\n# The timing\\n\\nThe voting period ends at block 8,000,000 (inclusively). Any votes cast after that will not be counted. You also need to fill in the whole circle with your pen.\\n\"}"
//     ), "e4b00c58d12cc674209861f7cca95f47ad8e7a9c435d4e166f7ac2dbcf5dc05d");
//     t.end();

//     t.equal(utils.parseProposalHash(
//         "Do you support proposal to lower minimal BP payout threshold to 50 EOS per day?",
//         {"type": "bps-proposal-v1", "content":"We propose to lower current minimum Block Producer payout threshold from 100 EOS/day to 50 EOS/day. This will instantly include about 20 additional BP teams into paid status and create incentive for them to keep their infrastructure running and continue to contribute into EOS community. We have many talented teams who actively participated in Testnet effort and preparation for the EOS launch that are not compensated currently and continue to cover the costs of running their infrastructure. If EOS community is to remain an inclusive and innovative environment - we need to put right incentives in place and retain good talent in a community. "}
//     ), "0c3b4f41b925682c5e08ae429fd5836527bb84564ed48e292c2ae7c5a441f01f");

//     t.equal(utils.parseProposalHash(
//         "EOSIO Vote Tally",
//         "{\"type\": \"bps-proposal-v1\", \"content\": \"Testing EOSIO Vote Tally\"}"
//     ), "0c3b4f41b925682c5e08ae429fd5836527bb84564ed48e292c2ae7c5a441f01f");
//     t.end();
// })
