const chai = require("chai");
const expect = chai.expect;
const { ethers, waffle, network } = require("hardhat");
chai.use(waffle.solidity);

describe.only("SportsIconPrivateVesting contract", function () {

	let sportsIconToken;
	let sportsIconVesting;
	let owner;
	let alice;
	let bob;
	let balances = [ethers.utils.parseEther("300"), ethers.utils.parseEther("400"), ethers.utils.parseEther("500")]

	const advanceBlockchainTo = async function (timestamp) {
		await ethers.provider.send('evm_setNextBlockTimestamp', [timestamp]);
		await ethers.provider.send('evm_mine');
	}

	beforeEach(async () => {
		[owner, alice, bob] = await ethers.getSigners();
		const name = "ICONS"
		const symbol = "$ICONS"
		const initialSupply = ethers.utils.parseEther("30000000")

		const SportsIconToken = await ethers.getContractFactory("SportsIcon");

		sportsIconToken = await SportsIconToken.deploy(name, symbol, initialSupply, owner.address);
	})


	it("Should deploy Vesting", async function () {
		const SportsIconPrivateVesting = await ethers.getContractFactory("SportsIconPrivateVesting");

		sportsIconVesting = await SportsIconPrivateVesting.deploy(sportsIconToken.address, [owner.address, alice.address, bob.address], balances);

		expect(await sportsIconVesting.token()).to.equal(sportsIconToken.address);
		expect(await sportsIconVesting.vestedTokensOf(owner.address)).to.equal(balances[0]);
		expect(await sportsIconVesting.vestedTokensOf(alice.address)).to.equal(balances[1]);
		expect(await sportsIconVesting.vestedTokensOf(bob.address)).to.equal(balances[2]);
	});

	describe("Vesting Calculations", function () {

		beforeEach(async () => {

			const totalPool = ethers.utils.parseEther("1200")
			const SportsIconPrivateVesting = await ethers.getContractFactory("SportsIconPrivateVesting");

			sportsIconVesting = await SportsIconPrivateVesting.deploy(sportsIconToken.address, [owner.address, alice.address, bob.address], balances);
			await sportsIconToken.transfer(sportsIconVesting.address, totalPool);

			expect(await sportsIconToken.balanceOf(sportsIconVesting.address)).to.equal(totalPool);
		})

		it("Should calculate free tokens", async function () {

			expect(await sportsIconVesting.vestedTokensOf(alice.address)).to.equal(balances[1]);
			expect(await sportsIconVesting.claimedOf(alice.address)).to.equal(0);
			expect(await sportsIconVesting.freeTokens(alice.address)).to.equal(balances[1].div(10));

			const initialUnlock = balances[1].div(10)
			const monthlyUnlock = balances[1].sub(initialUnlock).div(12)

			const thirtyDays = 30 * 24 * 60 * 60;
			const time = (await ethers.provider.getBlock("latest")).timestamp

			await advanceBlockchainTo(time + thirtyDays) // 1 months
			expect(await sportsIconVesting.freeTokens(alice.address)).to.equal(initialUnlock.add(monthlyUnlock));

			await advanceBlockchainTo(time + (thirtyDays * 3)) // 3 months
			expect(await sportsIconVesting.freeTokens(alice.address)).to.equal(initialUnlock.add(monthlyUnlock.mul(3)));

			await advanceBlockchainTo(time + (thirtyDays * 100)) // more than 12 months
			expect(await sportsIconVesting.freeTokens(alice.address)).to.equal(initialUnlock.add(monthlyUnlock.mul(12)));

		});

		it("Should claim freely initial tokens", async function () {

			const initialUnlock = balances[1].div(10);

			expect(await sportsIconVesting.claimedOf(alice.address)).to.equal(0);

			await expect(sportsIconVesting.connect(alice).claim()).to.emit(sportsIconVesting, 'LogTokensClaimed').withArgs(alice.address, initialUnlock);

			expect(await sportsIconVesting.claimedOf(alice.address)).to.equal(initialUnlock);

		})

		it("Should claim freely initial tokens + monthly together", async function () {

			const thirtyDays = 30 * 24 * 60 * 60;
			const time = (await ethers.provider.getBlock("latest")).timestamp

			await advanceBlockchainTo(time + thirtyDays) // 1 months

			const initialUnlock = balances[1].div(10);
			const monthlyUnlock = balances[1].sub(initialUnlock).div(12)

			expect(await sportsIconVesting.claimedOf(alice.address)).to.equal(0);

			await expect(sportsIconVesting.connect(alice).claim()).to.emit(sportsIconVesting, 'LogTokensClaimed').withArgs(alice.address, initialUnlock.add(monthlyUnlock));

			expect(await sportsIconVesting.claimedOf(alice.address)).to.equal(initialUnlock.add(monthlyUnlock));

		})

		it("Should claim freely initial tokens and monthly separately", async function () {

			const initialUnlock = balances[1].div(10);
			const monthlyUnlock = balances[1].sub(initialUnlock).div(12)

			expect(await sportsIconVesting.claimedOf(alice.address)).to.equal(0);

			await expect(sportsIconVesting.connect(alice).claim()).to.emit(sportsIconVesting, 'LogTokensClaimed').withArgs(alice.address, initialUnlock);

			const thirtyDays = 30 * 24 * 60 * 60;
			const time = (await ethers.provider.getBlock("latest")).timestamp

			await advanceBlockchainTo(time + (thirtyDays * 6)) // 6 months

			await expect(sportsIconVesting.connect(alice).claim()).to.emit(sportsIconVesting, 'LogTokensClaimed').withArgs(alice.address, monthlyUnlock.mul(6));

			expect(await sportsIconVesting.claimedOf(alice.address)).to.equal(initialUnlock.add(monthlyUnlock.mul(6)));

		})

		it("Should claim all tokens in the end", async function () {

			const thirtyDays = 30 * 24 * 60 * 60;
			const time = (await ethers.provider.getBlock("latest")).timestamp

			await advanceBlockchainTo(time + (thirtyDays * 20)) // 20 months

			expect(await sportsIconVesting.claimedOf(alice.address)).to.equal(0);

			await expect(sportsIconVesting.connect(alice).claim()).to.emit(sportsIconVesting, 'LogTokensClaimed').withArgs(alice.address, balances[1]);

			expect(await sportsIconVesting.claimedOf(alice.address)).to.equal(balances[1]);

		})

		it("Should have no tokens after all claim", async function () {

			const thirtyDays = 30 * 24 * 60 * 60;
			const time = (await ethers.provider.getBlock("latest")).timestamp

			await advanceBlockchainTo(time + (thirtyDays * 20)) // 20 months

			await expect(sportsIconVesting.connect(owner).claim()).to.emit(sportsIconVesting, 'LogTokensClaimed').withArgs(owner.address, balances[0]);
			await expect(sportsIconVesting.connect(alice).claim()).to.emit(sportsIconVesting, 'LogTokensClaimed').withArgs(alice.address, balances[1]);
			await expect(sportsIconVesting.connect(bob).claim()).to.emit(sportsIconVesting, 'LogTokensClaimed').withArgs(bob.address, balances[2]);

			expect(await sportsIconToken.balanceOf(sportsIconVesting.address)).to.equal(0);
		})
	})
});