## Overview

Create a vesting smart contract for the private investors in the $ICONS token launch. The client will give us a list of addressees and how many tokens we should vest for each one of them. The list will look something like:
0x1c7b584166c0D53daBd447563331F0466EBE5976 - 12
0x9EFf806bA579EE2Bd51bd35B63CD19F6BD6dd0Bd - 423213

Every user (address) should have 10% immediately  of the sum unlocked. Over the next 12 months, 7.5% should be unlocked to be claimed monthly.

The user should have a function called claim that should enable them to get everything unlocked.

## How to build it

The heart of the system is calculating on the fly how much is owed until now and substract how much is claimed.

First of all have mappings for who is owed how much tokens. Have all addresses and amounts hardcoded in the constructor and put them in a mapping. Then note the deployment time - `startTime = block.now`. Once the contract is deployed ask the client to send the total amount of owed tokens to the contract address.

How much is owed can be calculated as `owedTokens = (vestedTokensAmount/10) + ((vestedTokenAmount - (vestedTokensAmount/10))/12)*((block.now - startTime)/30 days)`
(You can find a better way to write this as I am trying to write it in a line).

Every time the user claims something save how much they have claimed in a mapping `claimedTokens`

Then the next time the user claims, just give them the difference between the calculated `owedTokens`  and `claimedTokens` and set the `claimedTokens=owedTokens` 

Obviously use safeMath if not using Solidity 0.8.

---