require("@nomiclabs/hardhat-waffle");
const { types } = require("hardhat/config")

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("deploy-vesting", "Deploys a Vesting contract")
  .addParam("members", "Members of this vesting account")
  .addParam("balances", "Balances of the vested accounts")
  .addParam("totalbalance", "Total vested balance")
  .addOptionalParam("token", "The address of the token", "")
  .setAction(async taskArgs => {
    const deployVesting = require("./scripts/deploy");
    await deployVesting(taskArgs.members.split(','), taskArgs.balances.split(','), taskArgs.totalbalance, taskArgs.token);
  });

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    hardhat: {},
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
  }
};
