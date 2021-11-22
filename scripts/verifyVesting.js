const hre = require('hardhat')
const fs = require('fs')

async function verifyVesting() {

    //verify Vesting contract
    const contracts = ["PRE_SEED", "SEED", "SEED_PLUS"];

    for (let i = 0; i < contracts.length; i++) {

        const sportsIconVestingJSON = JSON.parse(
            fs.readFileSync(`./VESTING_${contracts[i]}.json`, 'utf-8')
        );
    
        if (sportsIconVestingJSON.network != hre.network.name) {
            throw new Error(
                'Contracts are not deployed on the same network, that you are trying to verify!'
            );
        }

        console.log("Verifying contract instance: ", contracts[i]);

        try {

            await hre.run('verify:verify', {
                address: sportsIconVestingJSON.vesting,
                constructorArguments: [
                    sportsIconVestingJSON.sportsIconToken,
                    sportsIconVestingJSON.holders,
                    sportsIconVestingJSON.balances,
                    sportsIconVestingJSON.privilegedHolders,
                    sportsIconVestingJSON.privilegedBalances,
                    sportsIconVestingJSON.vestingPeriod,
                ],
            });

        } catch (error) {
            logError('SportIcon', error.message);
        }
        
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