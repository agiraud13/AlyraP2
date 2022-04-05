const { BN, expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const Voting = artifacts.require("Voting");


contract("Voting", async accounts => {

    var votingInstance;
 
    const owner = accounts[0];
    const voter1, nonadmin = accounts[1];
    const voter2 = accounts[2];
    const nonvoter = accounts[3];

    beforeEach('Only the owner should be able to register voters', async () => {
        votingInstance = await Voting.new({from: owner});
    });

    it("Only the owner should be able to register voters", async () => {
        await expectRevert.unspecified(votingInstance.addVoter(owner, {from: nonadmin}));
    });

    it("An account is added by the owner", async function(){
        let res = await votingInstance.addVoter(voter1, {from: owner});
        let list = await votingInstance.getVoter();

        expect(list[0]).to.equal(voter1);
        await expectEvent(res, "VoterRegistrered", {voterAddress: voter1}, "VoterRegistrered incorrect");
        });

    it("An account can only be registered once by the owner", async function(){
        await votingInstance.addVoter(voter1, {from: owner});
        await expectRevert.unspecified(votingInstance.addVoter(voter1, {from: owner}));
        });

    it("Only the owner should be able to start the proposal registration session", async () => {
        await expectRevert.unspecified(votingInstance.startProposalsRegistering({from: nonvoter}));
    });

      it("Only the owner should be able to end the proposal registration session", async () => {
        await expectRevert.unspecified(votingInstance.endProposalsRegistering({from: voter1}));
    });

    it("Only the owner should be able to start the voting session", async () => {
        await expectRevert.unspecified(votingInstance.startVotingSession({from: voter1}));
    });

    it("Only the owner should be able to end the voting session", async () => {
        await expectRevert.unspecified(votingInstance.endVotingSession({from: voter1}));
    });

    it("A proposal is registered by a voter", async function(){
        await votingInstance.addVoter(voter1, {from: owner});
        await votingInstance.startProposalsRegistering({from: owner});
        let addprop = await votingInstance.addProposal("proposition1", {from: voter1}

        await expectEvent(addprop, "ProposalRegistred");

        });

    it("A proposal can't be registered by a non-voter", async function(){
        await votingInstance.addVoter(voter1, {from: owner});
        await votingInstance.startProposalsRegistering({from: owner});

        await expectRevert.unspecified(votingInstance.addProposal("Proposition2", {from: nonvoter}));

        });


    it("A proposal is not registered by a voter until after the owner has started the session", async function(){
        await votingInstance.addVoterToList(voter1, {from: owner});
        await expectRevert.unspecified(votingInstance.addProposal("Proposition2", {from: voter1}));
        });

    it("An elector may not vote until the voting session is authorized by the owner", async function(){
        await votingInstance.addVoter(voter1, {from: owner});
        await votingInstance.startProposalsRegistering({from: owner});
        await votingInstance.addProposal("Proposition2", {from: voter1});
        await votingInstance.endProposalsRegistering({from: owner});
        await votingInstance.startVotingSession({from: owner});
        await expectRevert.unspecified(votingInstance.setVote(0, {from: voter1}));
        
        });

     it("an elector can only vote once", async function(){
        await votingInstance.addVoter(voter1, {from: owner});
        await votingInstance.startProposalsRegistering({from: owner});
        await votingInstance.addProposal("Proposition1", {from: voter1});
        await votingInstance.endProposalsRegistering({from: owner});
        await votingInstance.startVotingSession({from: owner});
        await votingInstance.setVote(0, {from: voter1});

        await expectRevert.unspecified(votingInstance.setVote(0, {from: voter1}));
        
        });

        it("a non-elector cannot vote", async function(){
            await votingInstance.addVoter(voter1, {from: owner});
            await votingInstance.startProposalsRegistering({from: owner});
            await votingInstance.addProposal("Proposition1", {from: voter1});
            await votingInstance.endProposalsRegistering({from: owner});
            await votingInstance.startVotingSession({from: owner});
            await votingInstance.setVote(0, {from: voter1});
    
            await expectRevert.unspecified(votingInstance.setVote(0, {from: nonvoter}));
            
            });

        it("An elector may not vote after the owner has ended the session", async function(){
            await votingInstance.addVoter(voter1, {from: owner});
            await votingInstance.startProposalsRegistering({from: owner});
            await votingInstance.addProposal("Proposition1", {from: voter1});
            await votingInstance.endProposalsRegistering({from: owner});
            await votingInstance.startVotingSession({from: owner});
            await votingInstance.setVote(0, {from: voter1});
            await votingInstance.endVotingSession({from: owner});
    
            await expectRevert.unspecified(votingInstance.setVote(0, {from: voter1}));
            
            });

            it("Only the owner can end a voting session", async function(){
                await votingInstance.addVoter(voter1, {from: owner});
                await votingInstance.startProposalsRegistering({from: owner});
                await votingInstance.addProposal("Proposition1", {from: voter1});
                await votingInstance.endProposalsRegistering({from: owner});
                await votingInstance.startVotingSession({from: owner});
                await votingInstance.setVote(0, {from: voter1});
                
        
                await expectRevert.unspecified(votingInstance.endVotingSession({from: voter1}));
                
                });

            it("only the owner can count the votes", async function(){
                await votingInstance.addVoter(voter1, {from: owner});
                await votingInstance.startProposalsRegistering({from: owner});
                await votingInstance.addProposal("Proposition1", {from: voter1});
                await votingInstance.endProposalsRegistering({from: owner});
                await votingInstance.startVotingSession({from: owner});
                await votingInstance.setVote(0, {from: voter1});
                await votingInstance.endVotingSession({from: owner});
                await expectRevert.unspecified(votingInstance.tallyVotesDraw({from: voter1}));
                
                });



    }
  );
