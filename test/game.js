const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { getContractAddress } = require("@ethersproject/address");

// Game paths
const CHASM = 0;
const FRAGILE_CAVE = 1;
const BROKEN_TRACK = 2;
const MINE_TUNNEL = 3;
const NARROW_CAVE = 4;
const SMELL_OF_FIRE = 5;
const OLD_LADDER = 6;
const OLD_CORRIDOR = 7;
const MUSKY_SMELL = 8
const LOOSE_PLANKS = 9;
const FRIENDLY_RAT = 10;
const MURMURING = 11;
const DESERT = 12;
const PALACE = 13;

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

    it("Should start game with default initial path", async function () {
      await game.connect(account3).startGame();
      const pathData = await game.fetchCurrentPath(account3.address);
      const initialPath = await game.getInitialPath();
      expect(pathData.pathType).to.equal(initialPath.pathType);
    });
  });

  describe("Gameplay", function () {
    it("Player should receive gold while playing", async function () {
      await game.connect(account2).startGame();
      await game.connect(account2).choosePath(2); // Cannot die in MINE_TUNNEL
      const gold = await game.getBalanceOfGold(account2.address);
      assert.isAbove(gold, 0, "Gold > 0");
    });

    it("Player can get accurate path history", async function () {
      await game.connect(account2).startGame();
      await game.connect(account2).choosePath(2);
      await game.connect(account2).choosePath(0);
      await game.connect(account2).choosePath(2);

      const pathHistory = await game.fetchPathHistory(account2.address);
      expect(pathHistory[0].pathType).to.equal(MINE_TUNNEL);
      expect(pathHistory[1].pathType).to.equal(OLD_CORRIDOR);
      expect(pathHistory[2].pathType).to.equal(MURMURING);
    });

    it ("Player can die", async function () {
      let hasDied = false;
      let safeCounter = 100;
      while (!hasDied && safeCounter > 0) {
        let inGame = await game.isInGame(account3.address);
        if (!inGame) {
          await game.connect(account3).startGame();
        }
        else {
          await game.connect(account3).choosePath(0);
          hasDied = await game.isDead(account3.address);
        }
        safeCounter--;
      }
      assert.isTrue(hasDied);
    });

    it ("Player can win", async function () {
      let hasWon = false;
      let bestPath = [1,0,2]; // Fastest path to PALACE
      let safeCounter = 100;
      while (!hasWon && safeCounter > 0) {
        let hasDied = false;
        await game.connect(account3).startGame();

        for (let i = 0; i < bestPath.length; i++) {
          await game.connect(account3).choosePath(bestPath[i]);
          hasWon = await game.hasWon(account3.address);
          hasDied = await game.isDead(account3.address);

          if (hasWon || hasDied) break;
        }
        safeCounter--;
      }
      assert.isTrue(hasWon);
    });
  });
});
