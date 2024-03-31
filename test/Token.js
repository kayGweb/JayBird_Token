const { ethers } = require("hardhat");
const { expect } = require("chai");

const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Token", () => {
	let token;
	let deployer;
	let accounts;
	let receiver;
	let exchange;

	beforeEach(async () => {
		//Fetch Token from blockchain
		const Token = await ethers.getContractFactory("Token");
		token = await Token.deploy("JayBird Token", "JBT", 1000000);
		//get the accouts
		accounts = await ethers.getSigners();
		deployer = accounts[0];
		receiver = accounts[1];
		exchange = accounts[2];
	});

	describe("Deployment", async () => {
		const name = "JayBird Token";
		const symbol = "JBT";
		const totalSupply = tokens(1000000);
		const decimals = 18;

		it("has a correct name", async () => {
			//Check that the name is correct
			expect(await token.name()).to.be.eq(name);
		});

		it("has a correct symbol", async () => {
			//Check that the symbol is correct
			expect(await token.symbol()).to.be.eq(symbol);
		});

		it("has a correct decimals", async () => {
			//Check that the decimals is correct
			expect(await token.decimals()).to.be.eq(decimals);
		});

		it("has a correct totalSupply", async () => {
			//Check that the totalSupply is correct
			expect(await token.totalSupply()).to.be.eq(totalSupply);
		});

		it("assigns total supply to deployer", async () => {
			//Check that the balanceOf is assigned totalSupply
			expect(await token.balanceOf(deployer.address)).to.be.eq(totalSupply);
		});
	});

	describe("Sending Tokens", async () => {
		let amount, transaction, result;

		describe("Success", async () => {
			beforeEach(async () => {
				//transfer tokens to receiver
				amount = tokens(100);
				transaction = await token.connect(deployer).transfer(receiver.address, amount);
				result = await transaction.wait();
			});

			it("transfer tokens balances", async () => {
				//Ensure that tokens were transferred
				expect(await token.balanceOf(deployer.address)).to.be.eq(tokens(999900));
				expect(await token.balanceOf(receiver.address)).to.be.eq(amount);
			});

			it("emits Transfer event", async () => {
				//Ensure that the Transfer event was emitted
				const event = result.events[0];
				expect(event.event).to.be.eq("Transfer");

				const args = event.args;
				expect(args.from).to.be.eq(deployer.address);
				expect(args.to).to.be.eq(receiver.address);
				expect(args.value).to.be.eq(amount);
			});
		});

		describe("Failure", async () => {
			it("rejects insufficent balances", async () => {
				//Attempt to transfer more tokens than the balance
				const invalidAmount = tokens(100000000);
				await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted;
			});
			it("rejects invalid recipients", async () => {
				const amount = tokens(100);
				await expect(token.connect(deployer).transfer("0x0000000000000000000000000000000000000000", amount)).to.be.reverted;
			});
		});
	});

	describe("Approving Tokens", () => {
		let amount, transaction, result;

		beforeEach(async () => {
			//transfer tokens to receiver
			amount = tokens(100);
			transaction = await token.connect(deployer).approve(exchange.address, amount);
			result = await transaction.wait();
		});

		describe("success", () => {
			it("allocates an allowance for delegated token spending", async () => {
				expect(await token.allowance(deployer.address, exchange.address)).to.be.eq(amount);
			});

			it("emits Approval event", async () => {
				const event = result.events[0];
				expect(event.event).to.be.eq("Approval");

				const args = event.args;
				expect(args.owner).to.be.eq(deployer.address);
				expect(args.spender).to.be.eq(exchange.address);
				expect(args.value).to.be.eq(amount);
			});
		});

		describe("failure", () => {
			it("rejects invalid spenders", async () => {
				await expect(token.connect(deployer).approve("0x0000000000000000000000000000000000000000", amount)).to.be.reverted;
			});
		});
	});

	describe("Delegated Token Transfers", () => {
		let transaction, amount, result;

		beforeEach(async () => {
			amount = tokens(100);
			transaction = await token.connect(deployer).approve(exchange.address, amount);
			result = await transaction.wait();
		});

		describe("Success", () => {
			beforeEach(async () => {
				amount = tokens(100);
				transaction = await token.connect(exchange).transferFrom(deployer.address, receiver.address, amount);
				result = await transaction.wait();
			});

			it("transfer tokens balances", async () => {
				expect(await token.balanceOf(deployer.address)).to.be.eq(tokens(999900));
				expect(await token.balanceOf(receiver.address)).to.be.eq(amount);
			});

			it("reset the allowance", async () => {
				expect(await token.allowance(deployer.address, exchange.address)).to.be.eq(0);
			});

			it("emits Transfer event", async () => {
				const event = result.events[0];
				expect(event.event).to.be.eq("Transfer");

				const args = event.args;
				expect(args.from).to.be.eq(deployer.address);
				expect(args.to).to.be.eq(receiver.address);
				expect(args.value).to.be.eq(amount);
			});
		});

		describe("Failure", () => {
			it("rejects insufficient balances", async () => {
				const invalidAmount = tokens(100000000);
				await expect(token.connect(exchange).transferFrom(deployer.address, receiver.address, invalidAmount)).to.be.reverted;
			});
		});
	});
});
