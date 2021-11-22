const hre = require('hardhat')
const ethers = hre.ethers;
const fs = require('fs');
require('dotenv').config();

const GAS_LIMIT = '8000000'

async function deployToken() {

    await hre.run('compile');
    const [deployer] = await ethers.getSigners();

    console.log('Deploying contract with the account:', deployer.address);
    console.log('Account balance:', (await deployer.getBalance()).toString());

    const name = '$ICONS Token'
    const symbol = '$ICONS'
    const totalSupply = ethers.utils.parseEther("30000000")
  
    const sportsIconTokenFactory = await ethers.getContractFactory("SportsIcon");
    const sportsIconToken = await sportsIconTokenFactory.deploy(
        name,
        symbol,
        totalSupply,
        deployer.address,
        { gasLimit: ethers.BigNumber.from(GAS_LIMIT) });

    console.log('Waiting for SportsIcon token deployment...');
    await sportsIconToken.deployed();

    console.log('SportsIcon Token: ', sportsIconToken.address);

    fs.writeFileSync('./TOKEN.json', JSON.stringify({
        network: hre.network.name,
        sportsIconToken: sportsIconToken.address,
        name,
        symbol,
        totalSupply: totalSupply.toString(),
        owner: deployer.address
    }, null, 2));

    console.log('Done!');

}

module.exports = deployToken;