require("@nomiclabs/hardhat-waffle");
require('@nomiclabs/hardhat-ethers');
require('dotenv').config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 module.exports = {
  defaultNetwork: "localhost",
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_ALCHEMY_URL,
      accounts: [process.env.RINKEBY_PRIVATE_KEY],
      chainId: 4,
      gasPrice: 20e9,
      gas: 25e6
    },
    hardhat: {
      chainId: 31337,
      gasPrice: 20e9,
      gas: 25e6
    }
  },
  solidity: {
    version: "0.8.13",
    settings: {
      optimizer: {
        enabled: process.env.DEBUG ? false : true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    artifacts: './pages/artifacts'
  }
};