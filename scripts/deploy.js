// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const { getContractAddress } = require("@ethersproject/address");

async function main() {
  const [owner] = await hre.ethers.getSigners();

  const transactionCount = await owner.getTransactionCount();

  const gameItemsAddress = getContractAddress({
    from: owner.address,
    nonce: transactionCount
  });

  const gameAddress = getContractAddress({
    from: owner.address,
    nonce: transactionCount+1
  });

  const GameItems = await hre.ethers.getContractFactory("GameItems");
  const gameItems = await GameItems.deploy(gameAddress);
  await gameItems.deployed();
  console.log("GameItems deployed to:", gameItems.address);
  
  const Game = await hre.ethers.getContractFactory("Game");
  const game = await Game.deploy(gameItemsAddress, owner.address);
  await game.deployed();
  console.log("Game deployed to:", game.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
