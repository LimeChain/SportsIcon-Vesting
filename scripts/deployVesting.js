const hre = require('hardhat')
const ethers = hre.ethers;
const { MEMBERS, BALANCES } = require('./deployConfig/index');
const fs = require('fs');

const GAS_LIMIT = '8000000'

// TODO to be implemented after exact parameters are available
const config = {
	vestingPreSeed: {
		tokenCap: ethers.utils.parseEther('10000000'), //todo to be changed as per request
		period: 18, //months
		members: [], //todo to be provided on 1711
		balances: [], //todo to be provided on 1711
	},
	vestingSeed: {
		tokenCap: ethers.utils.parseEther('10000000'), //todo to be changed as per request
		period: 14, //months
		members: [], //todo to be provided on 1711
		balances: [], //todo to be provided on 1711
	},
	vestingSeedPlus: {
		tokenCap: ethers.utils.parseEther('10000000'), //todo to be changed as per request
		period: 12, //months
		members: [], //todo to be provided on 1711
		balances: [], //todo to be provided on 1711
	}
}

async function deployVesting() {

	await hre.run('compile');
	const [deployer] = await ethers.getSigners();

	// TEST
	const vestingPeriod = 14;

	const sportsIconTokenJSON = JSON.parse(fs.readFileSync(`./token.json`, 'utf-8'));

	// Divide total supply into three parts for the three different instances
	const contractFunds = ethers.BigNumber.from(sportsIconTokenJSON.totalSupply).div(3);

	console.log('Deploying contracts with the account:', deployer.address);
	console.log('Account balance:', (await deployer.getBalance()).toString());

	const sportsIconTokenFactory = await ethers.getContractFactory("SportsIcon");

	const tokenAddress = sportsIconTokenJSON.sportsIconToken;

	let sportsIconToken;

	if (tokenAddress != "") {
		sportsIconToken = await sportsIconTokenFactory.attach(tokenAddress, { gasLimit: ethers.BigNumber.from(GAS_LIMIT) });
	} else {
		throw new Error("Invalid sports icon token address")
	}

	let balances = [];
	let totalBalance = 0;

	for (let i = 0; i < BALANCES.length; i++) {
		const balance = ethers.utils.parseEther(BALANCES[i]);
		totalBalance += Number(balance);
		balances.push(balance);
	}
	
	if (totalBalance !== Number(contractFunds)) throw new Error("Sum of all balances does not match with the balance of the contract");

	const vestingFactory = await ethers.getContractFactory("SportsIconPrivateVesting");
	const vesting = await vestingFactory.deploy(sportsIconToken.address, MEMBERS, balances, vestingPeriod, { gasLimit: ethers.BigNumber.from(GAS_LIMIT) });
	console.log('Waiting for Vesting deployment...');

	await vesting.deployed();
	console.log('Vesting: ', vesting.address);

	console.log(`Sending ${contractFunds.toString() / 10 ** 18} tokens to vesting...`);
	await (await sportsIconToken.transfer(vesting.address, contractFunds, { gasLimit: ethers.BigNumber.from(GAS_LIMIT) })).wait();

	console.log('SportsIcon Token: ', sportsIconToken.address);

	fs.writeFileSync('./vesting.json', JSON.stringify({
		network: hre.network.name,
		sportsIconToken: sportsIconToken.address,
		vesting: vesting.address,
		members: MEMBERS,
		balances,
		vestingPeriod,
		deployer: deployer.address
	}, null, 2));

	console.log('Done!');

}

module.exports = deployVesting;;

