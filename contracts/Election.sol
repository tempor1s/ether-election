// SPDX-License-Identifier: MIT
pragma solidity 0.7;

contract Election {
    // Candidate struct represents a candidiate.
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    // votedEvent is an event that gets fired whenever a user votes
    event votedEvent (
        uint indexed _candidateId
    );

    // A map of all the candidiates in the current election.
    mapping(uint => Candidate) public candidates;

    // A map of all the voters for the election.
    mapping(address => bool) public voters;

    // A count of the candidates in the election.
    uint public candidatesCount;

    // A candidate.
    string public candidate;

    // Create 2 candidiates when the contract is first initialized.
    constructor() {
        addCandidate("Omar Sagoo");
        addCandidate("Audi Blades");
    }

    // addCandidate will add a candidate to the current election
    function addCandidate(string memory _name) public {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    // allow a user to vote! only 1 vote per address :)
    function vote (uint _candidateId) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);

        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote Count
        candidates[_candidateId].voteCount++;

        // trigger voted event
        emit votedEvent(_candidateId);
    }
}