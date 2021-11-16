const hre = require('hardhat')
const ethers = hre.ethers;
const { MEMBERS, BALANCES } = require('./deployConfig/index');
const fs = require('fs');

const GAS_LIMIT = '8000000'

async function deployVesting() {

	await hre.run('compile');
	const [deployer] = await ethers.getSigners();

	const sportsIconTokenJSON = JSON.parse(fs.readFileSync(`./sportsIconToken.json`, 'utf-8'));

	// Divide total supply into three parts for the three different instances
	const contractFunds = ethers.BigNumber.from(sportsIconTokenJSON.totalSupply).div(3);

	console.log('Deploying contracts with the account:', deployer.address);
	console.log('Account balance:', (await deployer.getBalance()).toString());

	const name = "ICONS";
	const symbol = "$ICONS";
	const initialSupply = ethers.utils.parseEther("30000000");
	const sportsIconTokenFactory = await ethers.getContractFactory("SportsIcon");

	let tokenAddress = sportsIconTokenJSON.sportsIconToken;
	let sportsIconToken;
	if (tokenAddress != "") {
		sportsIconToken = await sportsIconTokenFactory.attach(tokenAddress, { gasLimit: ethers.BigNumber.from(GAS_LIMIT) });
	} else {
		sportsIconToken = await sportsIconTokenFactory.deploy(name, symbol, initialSupply, deployer.address, { gasLimit: ethers.BigNumber.from(GAS_LIMIT) });
		console.log('Waiting for SportsIcon token deployment...');
		await sportsIconToken.deployed();
	}

	const vestingFactory = await ethers.getContractFactory("SportsIconPrivateVesting");
	const vesting = await vestingFactory.deploy(sportsIconToken.address, MEMBERS, BALANCES, { gasLimit: ethers.BigNumber.from(GAS_LIMIT) });
	console.log('Waiting for Vesting deployment...');

	await vesting.deployed();
	console.log('Vesting: ', vesting.address);

	console.log(`Sending ${contractFunds.toString() / 10 ** 18} tokens to vesting...`);
	await (await sportsIconToken.transfer(vesting.address, contractFunds, { gasLimit: ethers.BigNumber.from(GAS_LIMIT) })).wait();

	console.log('SportsIcon Token: ', sportsIconToken.address);

	fs.writeFileSync('./sportsIconVesting.json', JSON.stringify({
		network: hre.network.name,
		sportsIconToken: sportsIconToken.address,
		vesting: vesting.address,
		totalSupply: sportsIconTokenJSON.totalSupply,
		name,
		symbol,
		members: MEMBERS,
		balances: BALANCES,
		owner: deployer.address
	}, null, 2));

	console.log('Done!');

}

module.exports = deployVesting;;

