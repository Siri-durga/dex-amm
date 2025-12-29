const { ethers } = require("hardhat");

async function main() {
  const Token = await ethers.getContractFactory("MockERC20");

  const tokenA = await Token.deploy("TokenA", "TKA");
  await tokenA.deployed();

  const tokenB = await Token.deploy("TokenB", "TKB");
  await tokenB.deployed();

  const DEX = await ethers.getContractFactory("DEX");
  const dex = await DEX.deploy(tokenA.address, tokenB.address);
  await dex.deployed();

  console.log("TokenA:", tokenA.address);
  console.log("TokenB:", tokenB.address);
  console.log("DEX:", dex.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
