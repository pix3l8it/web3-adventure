const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
// const { expectRevert } = require('@openzeppelin/test-helpers');
const { getContractAddress } = require("@ethersproject/address");

describe("Game", function () {
  let Game;
  let GameItems;
  let game;
  let gameItems;
  let owner;
  let account2;
  let account3;
  let account4;

  beforeEach(async function () {
    [owner, account2, account3, account4] = await ethers.getSigners();

    const transactionCount = await owner.getTransactionCount();

    const gameItemsAddress = getContractAddress({
      from: owner.address,
      nonce: transactionCount
    });

    const gameAddress = getContractAddress({
      from: owner.address,
      nonce: transactionCount+1
    });

    GameItems = await ethers.getContractFactory("GameItems");
    gameItems = await GameItems.deploy(gameAddress);
    
    Game = await ethers.getContractFactory("Game");
    game = await Game.deploy(gameItemsAddress, owner.address);
  });

  describe("Deployment", function() {
    //GameItems contract deployment tests
    it("GameItems should receive the correct Game address", async function () {
      expect(await gameItems.gameAddress()).to.equal(game.address);
    });

    it("Should assign the total supply of gold to game address", async function () {
      const gameBalance = await gameItems.balanceOf(game.address, gameItems.GOLD());
      expect(await gameItems.totalSupply(gameItems.GOLD())).to.equal(gameBalance);
    });

    it("Should assign the total supply of key to game address", async function () {
      const gameBalance = await gameItems.balanceOf(game.address, gameItems.KEY());
      expect(await gameItems.totalSupply(gameItems.KEY())).to.equal(gameBalance);
    });

    it("Should assign the total supply of treasure to game address", async function () {
      const gameBalance = await gameItems.balanceOf(game.address, gameItems.TREASURE());
      expect(await gameItems.totalSupply(gameItems.TREASURE())).to.equal(gameBalance);
    });

    //Game contract deployment tests
    it("Game should should set the correct owner", async function () {
      expect(await game.owner()).to.equal(owner.address);
    });

    it("Game should receive the correct GameItems address", async function () {
      expect(await game.gameItemsAddress()).to.equal(gameItems.address);
    });
  });

  describe("Game Setup", function () {
    it("Should be not in game by default", async function () {
      const isInGame = await game.isInGame(account2.address);
      expect(isInGame).to.equal(false);
    });

    it("Should be able to start a game", async function () {
      await game.startGame();
      await game.connect(account4).startGame();
      const isInGame = await game.isInGame(owner.address);
      const isInGame2 = await game.isInGame(account2.address);
      const isInGame3 = await game.isInGame(account3.address);
      const isInGame4 = await game.isInGame(account4.address);
      expect(isInGame && !isInGame2 && !isInGame3 && isInGame4).to.equal(true);
    });

    it("Should start game with default initial paths", async function () {
      await game.connect(account3).startGame();
      const pathData = await game.fetchNextPathChoice(account3.address);
      expect(pathData[0].pathType).to.equal(0);
      expect(pathData[1].pathType).to.equal(1);
      expect(pathData[2].pathType).to.equal(2);
    });
  });

  describe("Gameplay", function () {
    it("Player should receive gold while playing", async function () {
      await game.connect(account2).startGame();
      await game.connect(account2).choosePath(1);
      const gold = await game.getBalanceOfGold(account2.address);
      assert.isAbove(gold, 0, "Gold > 0");
    });
  });
});
