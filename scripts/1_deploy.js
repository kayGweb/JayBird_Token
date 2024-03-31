async function main() {
	//fetch contract to deply
	const Token = await ethers.getContractFactory("Token");

	// deploy contract
	const token = await Token.deploy("JayBird Token", "JBT", 1000000);
	await token.deployed();
	console.log("Token deployed to:", token.address);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
