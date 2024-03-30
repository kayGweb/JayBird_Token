const { ethers } = require("hardhat");
const { expect } = require("chai");

const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Token", () => {
	let token;

	beforeEach(async () => {
		//Fetch Token from blockchain
		const Token = await ethers.getContractFactory("Token");
		token = await Token.deploy("JayBird Token", "JBT", 1000000);
	});

	describe("Deployment", async () => {
		const name = "JayBird Token";
		const symbol = "JBT";
		const totalSupply = tokens(1000000);
		const decimals = 18;

		it("Has a correct name", async () => {
			//Check that the name is correct
			expect(await token.name()).to.be.eq(name);
		});

		it("Has a correct symbol", async () => {
			//Check that the symbol is correct
			expect(await token.symbol()).to.be.eq(symbol);
		});

		it("Has a correct decimals", async () => {
			//Check that the decimals is correct
			expect(await token.decimals()).to.be.eq(decimals);
		});

		it("Has a correct totalSupply", async () => {
			//Check that the totalSupply is correct
			expect(await token.totalSupply()).to.be.eq(totalSupply);
		});
	});
});
