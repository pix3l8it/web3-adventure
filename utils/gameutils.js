import { ethers } from 'ethers'

import { _requestAccount } from './utils.js';

import Game from '../artifacts/contracts/Game.sol/Game.json';

const _inGame = async provider => {
    console.log(process.env.NEXT_PUBLIC_GAME_ADDR);
    const gameContract = new ethers.Contract(process.env.NEXT_PUBLIC_GAME_ADDR, Game.abi, provider);
    const player = await _requestAccount();
    const inGame = await gameContract.isInGame(player);
    return inGame;
};

const _isDead = async provider => {
    const gameContract = new ethers.Contract(process.env.NEXT_PUBLIC_GAME_ADDR, Game.abi, provider);
    const player = await _requestAccount();
    const isDead = await gameContract.isDead(player);
    return isDead;
};

const _getGold = async provider => {
    const gameContract = new ethers.Contract(process.env.NEXT_PUBLIC_GAME_ADDR, Game.abi, provider);
    const player = await _requestAccount();
    const gold = await gameContract.getBalanceOfGold(player);
    return gold.toNumber();
};

const _getKey = async provider => {
    const gameContract = new ethers.Contract(process.env.NEXT_PUBLIC_GAME_ADDR, Game.abi, provider);
    const player = await _requestAccount();
    const key = await gameContract.getBalanceOfKey(player);
    return key.toNumber();
};

const _getTreasure = async provider => {
    const gameContract = new ethers.Contract(process.env.NEXT_PUBLIC_GAME_ADDR, Game.abi, provider);
    const player = await _requestAccount();
    const treasure = await gameContract.getBalanceOfTreasure(player);
    return treasure.toNumber();
};

export { _inGame, _isDead, _getGold, _getKey, _getTreasure };