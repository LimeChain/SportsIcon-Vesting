const hre = require('hardhat')
const fs = require('fs')

async function verifyToken() {
    const contracts = JSON.parse(
        fs.readFileSync(`./contracts.json`, 'utf-8')
    );
    console.log(contracts)

    if (contracts.network != hre.network.name) {
        throw new Error(
            'Contracts are not deployed on the same network, that you are trying to verify!'
        );
    }

    //verify SportIcon token contract
    try {
        await hre.run('verify:verify', {
            address: contracts.sportsIconToken,
            constructorArguments: [
                contracts.name,
                contracts.symbol,
                contracts.totalSupply,
                contracts.owner
            ],
        });
    } catch (error) {
        logError('SportIcon', error.message);
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
    verifyToken
}