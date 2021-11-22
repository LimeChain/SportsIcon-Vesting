const hre = require('hardhat')
const fs = require('fs')

async function verifyToken() {
    const sportsIconTokenJSON = JSON.parse(
        fs.readFileSync(`./TOKEN.json`, 'utf-8')
    );
    
    console.log(sportsIconTokenJSON)

    if (sportsIconTokenJSON.network != hre.network.name) {
        throw new Error(
            'Contracts are not deployed on the same network, that you are trying to verify!'
        );
    }

    //verify SportIcon token contract
    try {
        await hre.run('verify:verify', {
            address: sportsIconTokenJSON.sportsIconToken,
            constructorArguments: [
                sportsIconTokenJSON.name,
                sportsIconTokenJSON.symbol,
                sportsIconTokenJSON.totalSupply,
                sportsIconTokenJSON.owner
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