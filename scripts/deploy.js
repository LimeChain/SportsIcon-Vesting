const hre = require('hardhat')
const ethers = hre.ethers;

async function deployVesting(members, balances, totalBalance, tokenAddress) {

	await hre.run('compile');
	const [deployer] = await ethers.getSigners();

	console.log('Deploying contracts with the account:', deployer.address);
	console.log('Account balance:', (await deployer.getBalance()).toString());

	const name = "ICONS"
	const symbol = "$ICONS"
	const initialSupply = ethers.utils.parseEther("30000000")
	const sportsIconTokenFactory = await ethers.getContractFactory("SportsIcon");

	let sportsIconToken;
	if (tokenAddress != "") {
		sportsIconToken = await sportsIconTokenFactory.attach(tokenAddress);
	} else {
		sportsIconToken = await sportsIconTokenFactory.deploy(name, symbol, initialSupply, deployer.address);
		console.log('Waiting for SportsIcon token deployment...');
		await sportsIconToken.deployed();
	}

	const vestingFactory = await ethers.getContractFactory("SportsIconPrivateVesting");
	const vesting = await vestingFactory.deploy(sportsIconToken.address, members, balances);
	console.log('Waiting for Vesting deployment...');
	await vesting.deployed();

	console.log('Sending tokens to vesting...');
	await (await sportsIconToken.transfer(vesting.address, totalBalance)).wait();

	console.log('SportsIcon Token: ', sportsIconToken.address);
	console.log('Vesting: ', vesting.address);
	console.log('Done!');

}

module.exports = deployVesting;