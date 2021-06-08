const chai = require("chai");
const expect = chai.expect;
const { ethers, waffle, network } = require("hardhat");
chai.use(waffle.solidity);

describe("Token contract", function () {
	it("Deployment should assign the total supply of tokens to the owner", async function () {
		const [owner] = await ethers.getSigners();

		const name = "ICONS"
		const symbol = "$ICONS"
		const initialSupply = ethers.utils.parseEther("30000000")

		const Token = await ethers.getContractFactory("SportsIcon");

		const hardhatToken = await Token.deploy(name, symbol, initialSupply, owner.address);

		const ownerBalance = await hardhatToken.balanceOf(owner.address);
		expect(await hardhatToken.totalSupply()).to.equal(initialSupply);
	});
});