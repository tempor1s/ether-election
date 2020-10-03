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
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // New truffle contract 
      App.contracts.Election = TruffleContract(election);

      // Connect provider to contract
      App.contracts.Election.setProvider(App.web3Provider);

      return App.render();
    });
  },

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
        $('form').hide();
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  castVote: function() {
      const candidateId = $('#candidatesSelect').val();
      App.contracts.Election.deployed().then(function(instance) {
        return instance.vote(candidateId, { from: App.account });
      }).then(function(result) {
        $("#content").hide();
        $("#loader").show();
      }).catch(function(err) {
        console.error(err);
    });
  },

  createCandidate: function() {
      const inputCandidate = $('#inputCandidate').val();
      App.contracts.Election.deployed().then(function(instance) {
        console.log("fired");
        instance.addCandidate(inputCandidate);
      })
  }
};


$(function() {
  $(window).load(function() {
    App.init();
  });
});