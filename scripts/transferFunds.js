const hre = require('hardhat')
const fs = require('fs')

const GAS_LIMIT = '8000000'

async function transferFunds() {

    const sportsIconTokenJSON = JSON.parse(fs.readFileSync(`./TOKEN.json`, 'utf-8'));
    const tokenAddress = sportsIconTokenJSON.sportsIconToken;

    if (sportsIconTokenJSON.network != hre.network.name) {
        throw new Error(
            'Contracts are not deployed on the same network, that you are trying to verify!'
        );
    }

    const contracts = ["PRE_SEED", "SEED", "SEED_PLUS"];

    let leftovers = sportsIconTokenJSON.totalSupply

    const sportsIconTokenFactory = await ethers.getContractFactory("SportsIcon");
    const sportsIconToken = await sportsIconTokenFactory.attach(tokenAddress, { gasLimit: ethers.BigNumber.from(GAS_LIMIT) });

    for (let i = 0; i < contracts.length; i++) {
        const contract = JSON.parse(fs.readFileSync(`./VESTING_${contracts[i]}.json`, 'utf-8'));
        console.log('contract.contractFunds: ', contract.contractFunds);
        leftovers = hre.ethers.BigNumber.from(leftovers).sub(hre.ethers.BigNumber.from(hre.ethers.utils.parseEther(contract.contractFunds)))
    }

    // transfer funds left to Gnosis multisig
    try {
        console.log(`Sending ${leftovers} tokens to Gnosis multisig with address of ${process.env.GNOSIS_SAFE_WALLET}...`);
        const transferTx = await sportsIconToken.transfer(process.env.GNOSIS_SAFE_WALLET, leftovers, { gasLimit: ethers.BigNumber.from(GAS_LIMIT) });
        await transferTx.wait();

    } catch (error) {
        logError('SportIcon', error.message);
    }
}

function logError(contractName, msg) {
    console.log(
        `\x1b[31mError while trying to transfer funds: ${contractName}!`
    );
    console.log(`Error message: ${msg}`);
    resetConsoleColor();
}

function resetConsoleColor() {
    console.log('\x1b[0m');
}

module.exports = {
    transferFunds
}