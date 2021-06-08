// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.5;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./interfaces/ISportsIconPrivateVesting.sol";

contract SportsIconPrivateVesting is ISportsIconPrivateVesting {
	using SafeMath for uint256;

	mapping(address => uint256) public override vestedTokensOf;
	mapping(address => uint256) public override claimedOf;
	IERC20 public override token;
	uint256 private startTime;

	constructor(address _tokenAddress, address[] memory holders, uint256[] memory balances) {
		require(holders.length == balances.length, "Constructor :: Holders and balances differ");
		require(_tokenAddress != address(0x0), "Constructor :: Invalid token address");
		token = IERC20(_tokenAddress);
		uint256 length = holders.length;
		for (uint256 i = 0; i < length; i++) {
			vestedTokensOf[holders[i]] = balances[i];
		}
		startTime = block.timestamp;
	}

	function freeTokens(address user) public view override returns(uint256) {
		uint256 owed = calculateOwed(user);
		return owed.sub(claimedOf[user]);
	}

	function claim() external override returns(uint256) {
		uint256 tokens = freeTokens(msg.sender);
		claimedOf[msg.sender] = claimedOf[msg.sender].add(tokens);

		token.transfer(msg.sender, tokens);

		emit LogTokensClaimed(msg.sender, tokens);

		return tokens;
	}

	function calculateOwed(address user) internal view returns(uint256 owed) {
		uint256 periodsPassed = ((block.timestamp.sub(startTime)).div(30 days));
		if (periodsPassed > 12) {
			periodsPassed = 12;
		}
		uint256 vestedTokens = vestedTokensOf[user];
		uint256 initialUnlock = vestedTokens.div(10);
		uint256 remainder = vestedTokens.sub(initialUnlock);
		uint256 monthlyUnlock = periodsPassed.mul(remainder).div(12);
		return initialUnlock.add(monthlyUnlock);
	}
}