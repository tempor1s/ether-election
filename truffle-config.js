require("dotenv").config()
const HDWalletProvider = require("@truffle/hdwallet-provider");
const MNEMOIC = process.env.WALLET_MNEMONIC;

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  compilers: {
    solc: {
      version: "^0.7.0"
    }
  },
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    develop: {
      port: 8545
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(MNEMOIC, `https://rinkeby.infura.io/v3/${process.env.INFURA_KEY}`)
      },
      network_id: 4
    }
  }
};
