const hre = require('hardhat')
const ethers = hre.ethers;
const config = require('./deployConfig/index');
const fs = require('fs');

const GAS_LIMIT = '8000000'

async function deployVesting() {

	await hre.run('compile');
	const [deployer] = await ethers.getSigners();

	const sportsIconTokenJSON = JSON.parse(fs.readFileSync(`./token.json`, 'utf-8'));

	console.log(`Deploying vesting ${process.env.CONTRACT} with the account:`, deployer.address);
	console.log('Account balance:', (await deployer.getBalance()).toString());

	const sportsIconTokenFactory = await ethers.getContractFactory("SportsIcon");

	const tokenAddress = sportsIconTokenJSON.sportsIconToken;

	let sportsIconToken;

	if (tokenAddress != "") {
		sportsIconToken = await sportsIconTokenFactory.attach(tokenAddress, { gasLimit: ethers.BigNumber.from(GAS_LIMIT) });
	} else {
		throw new Error("Invalid sports icon token address")
	}

	const CONTRACT_INSTANCE = config[process.env.CONTRACT];

	for (let i = 0; i < CONTRACT_INSTANCE.HOLDERS.length; i++) {
		if (CONTRACT_INSTANCE.PRIVILEGED_HOLDERS.includes(CONTRACT_INSTANCE.HOLDERS[i])) throw new Error("Address of user repeats in both 'HOLDERS' array and 'PRIVILEGED_HOLDERS'")
	}

	const vestingPeriod = CONTRACT_INSTANCE.PERIOD;
	let balances = [];
	let privilegedBalances = [];
	let contractFunds = 0;

	for (let i = 0; i < CONTRACT_INSTANCE.BALANCES.length; i++) {
		const balance = ethers.utils.parseEther(CONTRACT_INSTANCE.BALANCES[i]);

		if (i <= CONTRACT_INSTANCE.PRIVILEGED_BALANCES.length - 1) {
			const privilegedBalance = ethers.utils.parseEther(CONTRACT_INSTANCE.PRIVILEGED_BALANCES[i]);
			contractFunds += Number(CONTRACT_INSTANCE.PRIVILEGED_BALANCES[i]);
			privilegedBalances.push(privilegedBalance);
		}

		contractFunds += Number(CONTRACT_INSTANCE.BALANCES[i]);
		balances.push(balance);

	}

	const vestingFactory = await ethers.getContractFactory("SportsIconPrivateVesting");
	const vesting = await vestingFactory.deploy(
		sportsIconToken.address,
		CONTRACT_INSTANCE.HOLDERS,
		balances,
		CONTRACT_INSTANCE.PRIVILEGED_HOLDERS,
		privilegedBalances,
		vestingPeriod,
		{ gasLimit: ethers.BigNumber.from(GAS_LIMIT) }
	);

	console.log('Waiting for Vesting deployment...');

	await vesting.deployed();
	console.log('Vesting: ', vesting.address);

	console.log(`Sending ${contractFunds} tokens to vesting...`);
	const contractFundsWei = ethers.utils.parseEther(contractFunds.toString());
	const transferTx = await sportsIconToken.transfer(vesting.address, contractFundsWei, { gasLimit: ethers.BigNumber.from(GAS_LIMIT) })
	await transferTx.wait();

	console.log('SportsIcon Token: ', sportsIconToken.address);

	fs.writeFileSync(`./VESTING_${process.env.CONTRACT}.json`, JSON.stringify({
		network: hre.network.name,
		sportsIconToken: sportsIconToken.address,
		vesting: vesting.address,
		holders: CONTRACT_INSTANCE.HOLDERS,
		contractFunds: contractFunds.toString(),
		balances,
		privilegedHolders: CONTRACT_INSTANCE.PRIVILEGED_HOLDERS,
		privilegedBalances,
		vestingPeriod,
		deployer: deployer.address
	}, null, 2));

	console.log('Done!');

}

module.exports = deployVesting;;

