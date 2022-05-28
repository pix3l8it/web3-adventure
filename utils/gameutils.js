import { ethers } from 'ethers'
import axios from 'axios';

import { _requestAccount } from './utils.js';

import Game from '../pages/artifacts/contracts/Game.sol/Game.json';

const _loadPathDescriptors = async (contract, pathType) => {
    const ipfsProvider = '.ipfs.nftstorage.link'
    const itemUri = await contract.uri(pathType);
    const itemUrl = itemUri.replace(/ipfs:\/\/([a-zA-Z0-9]*)\//, 'https://$1' + ipfsProvider + '/').replace('{id}', '' + pathType);
    const itemData = await axios.get(itemUrl);

    const currentPath = {
        pathName: itemData.data.pathName,
        pathDescription: itemData.data.pathDescription,
        deathDescription: itemData.data.deathDescription
    };
    return currentPath;
};

const _inGame = async provider => {
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

const _hasWon = async provider => {
    const gameContract = new ethers.Contract(process.env.NEXT_PUBLIC_GAME_ADDR, Game.abi, provider);
    const player = await _requestAccount();
    const hasWon = await gameContract.hasWon(player);
    return hasWon;
}

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

export { _loadPathDescriptors, _inGame, _isDead, _hasWon, _getGold, _getKey, _getTreasure };