App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  // Connect to web3
  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      ethereum.enable()
      web3 = new Web3(web3.currentProvider);
    } else {
      ethereum.enable()
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      // App.web3Provider = new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/f173b90385c04a5b9eae3237216d15b3');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  // Init the contract.
  initContract: function() {
    // const abi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"_candidateId","type":"uint256"}],"name":"votedEvent","type":"event"},{"inputs":[{"internalType":"string","name":"_name","type":"string"}],"name":"addCandidate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"candidate","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"candidates","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"voteCount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"candidatesCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_candidateId","type":"uint256"}],"name":"vote","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"voters","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}];

    // App.contracts.Election = TruffleContract({
    //   abi: abi,
    //   address: "0x231D819e710169fCE1E3382d593e3BfBd82f74C2",
    // });

    // App.contracts.Election.setProvider(App.web3Provider);
    // return App.render();
    $.getJSON("Election.json", function(election) {
      // New truffle contract 
      App.contracts.Election = TruffleContract(election);

      // Connect provider to contract
      App.contracts.Election.setProvider(App.web3Provider);

      return App.render();
    });
  },

  // Handles displaying candidate names and votes.
  render: function() {
    let electionInstance;
    const loader = $("#loader");
    const content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {
      
      // Grab candidate results
      const candidatesResults = $("#candidatesResults");
      candidatesResults.empty();
      
      // Grab candidate selection
      const candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();

      for (let i = 1; i <= candidatesCount; i++) {
        electionInstance.candidates(i).then(function(candidate) {
          const id = candidate[0];
          const name = candidate[1];
          const voteCount = candidate[2];

          // Render results
          const candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);
          
          // render candidate options
          const candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          candidatesSelect.append(candidateOption);
        });
      }
      return electionInstance.voters(App.account);
    }).then(function(hasVoted) {
      // Check if the user has already voted
      if(hasVoted) {
        $('#voting').hide();
      }
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  // Allow a user to vote for a candidate.
  castVote: function() {
      const candidateId = $('#candidatesSelect').val();
      App.contracts.Election.deployed().then(function(instance) {
        return instance.vote(candidateId, { from: App.account });
      }).then(function() {
        // Refresh after payment
        location.reload();
      }).catch(function(err) {
        console.error(err);
    });
  },


  // Allow a user to elect a candidate.
  createCandidate: function() {
      const inputCandidate = $('#inputCandidate').val();
      App.contracts.Election.deployed().then(function(instance) {
        return instance.addCandidate(inputCandidate);
      }).then(function() {
        // Refresh after payment
        location.reload();
      }).catch(function(err) {
        console.error(err);
      });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});