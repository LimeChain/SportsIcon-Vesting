require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config();

const { types } = require("hardhat/config")
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("deploy-vesting", "Deploys Vesting contract")
  .setAction(async taskArgs => {
    const deployVesting = require("./scripts/deployVesting");
    await deployVesting();
  });


task("verify-vesting", "Verify already deployed vesting contract")
  .setAction(async () => {
    const { verifyVesting } = require("./scripts/verifyVesting");
    await verifyVesting();
  })

task("deploy-token", "Deploys $ICONS token")
  .setAction(async taskArgs => {
    const deployVesting = require("./scripts/deployToken");
    await deployVesting();
  });

task("verify-token", "Verify already deployed token")
  .setAction(async () => {
    const { verifyToken } = require("./scripts/verifyToken");
    await verifyToken();
  })

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    hardhat: {},
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [`0x${process.env.ROPSTEN_PRIVATE_KEY}`]
    },
    mainnet: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [`0x${process.env.MAINNET_PRIVATE_KEY}`]
    }
  },
  solidity: {
    version: "0.7.5",
    settings: {
      optimizer: {
        enabled: true
      }
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  }
};
