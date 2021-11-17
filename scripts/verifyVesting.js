const hre = require('hardhat')
const fs = require('fs')

async function verifyVesting() {
    const sportsIconVestingJSON = JSON.parse(
        fs.readFileSync(`./vesting.json`, 'utf-8')
    );

    if (sportsIconVestingJSON.network != hre.network.name) {
        throw new Error(
            'Contracts are not deployed on the same network, that you are trying to verify!'
        );
    }

    //verify Vesting contract
    try {
        await hre.run('verify:verify', {
            address: sportsIconVestingJSON.vesting,
            constructorArguments: [
                sportsIconVestingJSON.sportsIconToken,
                sportsIconVestingJSON.members,
                sportsIconVestingJSON.balances,
            ],
        });
    } catch (error) {
        logError('SportsIconPrivateVesting', error.message);
    }
}

function logError(contractName, msg) {
    console.log(
        `\x1b[31mError while trying to verify contract: ${contractName}!`
    );
    console.log(`Error message: ${msg}`);
    resetConsoleColor();
}

function resetConsoleColor() {
    console.log('\x1b[0m');
}

module.exports = {
    verifyVesting
}