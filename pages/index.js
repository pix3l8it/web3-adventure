import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'

import { _getProvider, _getSigner, _requestAccount } from '../utils/utils.js';
import { _inGame, _isDead, _getGold, _getKey, _getTreasure } from '../utils/gameutils.js';

import GameItems from './artifacts/contracts/GameItems.sol/GameItems.json';
import Game from './artifacts/contracts/Game.sol/Game.json';

export default function Home() {
  const [currentPath, setCurrentPath ] = useState([]);
  const [nextPaths, setNextPaths ] = useState([]);
  const [inGame, setInGame] = useState(undefined);
  const [isDead, setIsDead] = useState(undefined);
  const [gold, setGold] = useState(0);
  const [key, setKey] = useState(0);
  const [treasure, setTreasure] = useState(0);
  const [goldImage, setGoldImage] = useState(null);
  const [keyImage, setKeyImage] = useState(null);
  const [treasureImage, setTreasureImage] = useState(null);

  useEffect(() => {
    const init = async () => {
      await checkInGameAndLoad();
      await loadGameItems();
    };
    init();
  }, []);

  async function loadGameImage(contract, tokenId, setImage) {
    let ipfsProviderUrl = 'https://ipfs.io/ipfs/'
    let itemUri = await contract.uri(tokenId);
    let itemUrl = itemUri.replace('ipfs://', ipfsProviderUrl).replace('{id}', '' + tokenId);
    let itemData = await axios.get(itemUrl);
    let itemMeta = itemData.data;

    setImage(itemMeta.image.replace('ipfs://', ipfsProviderUrl));
  }

  async function loadGameItems() {
    const signer = await _getSigner();
    const gameItemsContract = new ethers.Contract(process.env.NEXT_PUBLIC_GAME_ITEMS_ADDR, GameItems.abi, signer);

    await loadGameImage(gameItemsContract, 0, setGoldImage);
    await loadGameImage(gameItemsContract, 1, setKeyImage);
    await loadGameImage(gameItemsContract, 2, setTreasureImage);
  }

  async function checkInGameAndLoad() {
    const provider = await _getProvider();
    const inGame = await _inGame(provider);
    const isDead = await _isDead(provider);
    const gold = await _getGold(provider);
    const key = await _getKey(provider);
    const treasure = await _getTreasure(provider);
    setInGame(inGame);
    setIsDead(isDead);
    setGold(gold);
    setKey(key);
    setTreasure(treasure);
    if (inGame || isDead) {
      await loadGameData();
    }
  }

  async function startGame() {
    const signer = await _getSigner();
    const gameContract = new ethers.Contract(process.env.NEXT_PUBLIC_GAME_ADDR, Game.abi, signer);
    let pathTx = await gameContract.startGame();
    await pathTx.wait();
    await checkInGameAndLoad();
  }

  async function choosePath(choice) {
    const signer = await _getSigner();
    const gameContract = new ethers.Contract(process.env.NEXT_PUBLIC_GAME_ADDR, Game.abi, signer);
    let pathTx = await gameContract.choosePath(choice);
    let tx = await pathTx.wait();
    // let event = tx.events[0];
    await checkInGameAndLoad();
  }

  async function loadGameData() {
    const provider = await _getProvider();
    const gameContract = new ethers.Contract(process.env.NEXT_PUBLIC_GAME_ADDR, Game.abi, provider);
    const player = await _requestAccount();
    let pathData = await gameContract.fetchCurrentPath(player);

    await setAllPathData(pathData, gameContract);
  }

  async function setAllPathData(pathData, gameContract) {
    let currentPath = {
      pathName: pathData.pathName,
      pathDescription: pathData.pathDescription,
      deathDescription: pathData.deathDescription
    };
    setCurrentPath(currentPath);

    let nextPathTypes = pathData.nextPathTypes;
    const nextPaths = await Promise.all(nextPathTypes.map(async pathType => {
      let name = await gameContract.getPathNameFromType(pathType);
      let path = {
        pathName: name,
      };
      return path;
    }));
    setNextPaths(nextPaths);
  }

  if (isDead) return (
    <section className="bg-gray-800 container mx-auto flex flex-wrap items-center">
      <div className="flex-wrap w-full pt-2 content-center">
        <div className="pt-10 justify-left text-2xl text-gray-300 font-extrabold">{currentPath.pathName}</div>
        <div className="py-10 justify-left text-lg text-gray-300 font-medium">{currentPath.deathDescription}</div>
        <div className="pb-10 justify-left text-lg text-gray-300 font-extrabold text-red-600">Game over!</div>
        <button type="button" onClick={startGame} className="p-4 font-extrabold text-gray-300 justify-center bg-gradient-to-tr from-gray-900 to-green-900 hover:from-gray-900 hover:to-green-800 rounded-md shadow-lg shadow-indigo-500/40 hover:shadow-none">
          {'>'} Restart Game
        </button>
      </div>
    </section>
  );
  if (!inGame && !currentPath.length && !nextPaths.length) return (
    <section className="bg-gray-800 container mx-auto flex flex-wrap items-center">
      <div className="flex-wrap w-full pt-2 content-center">
        <div className="p-10 flex justify-center text-2xl text-gray-300 font-extrabold">Start a Game!</div>
        <button type="button" onClick={startGame} className="p-4 font-extrabold text-gray-300 justify-center bg-gradient-to-tr from-gray-900 to-green-900 hover:from-gray-900 hover:to-green-800 rounded-md shadow-lg shadow-indigo-500/40 hover:shadow-none">
          {'>'} Start Game
        </button>
      </div>
    </section>
  );
  return (
    <section className="bg-gray-800 container mx-auto flex flex-wrap items-center">
      <div className="p-10 font-bold sm:grid md:grid-cols-3 xl:grid-cols-3 3xl:flex flex-wrap w-full content-center">
        <div className="my-5 text-gray-300 flex items-center justify-center">
          <img src={goldImage} alt='' className='h-10 w-10 rounded-lg' />
          <p className="ml-2">Gold: {gold}</p>
        </div>
        <div className="my-5 text-gray-300 flex items-center justify-center">
          <img src={keyImage} alt='' className='h-10 w-10 rounded-lg' />
          <p className="ml-2">Key: {key}</p>
        </div>
        <div className="my-5 text-gray-300 flex items-center justify-center">
          <img src={treasureImage} alt='' className='h-10 w-10 rounded-lg' />
          <p className="ml-2">Treasure: {treasure}</p>
        </div>
      </div>
      <div className="px-10 py-6 text-lg text-gray-300">{currentPath.pathDescription}</div>
      <div className="px-10 pb-16 w-full text-lg text-gray-300">Current path: <span className="font-extrabold">{currentPath.pathName}</span></div>
      <div className="px-10 pb-4 w-full text-lg text-gray-300">Here are the adjacent paths:</div>
      <div className="mx-10 w-full flex flex-col">
        <div className="flex flex-col items-center justify-center md:flex-row">
          <div className="px-5 my-6 gap-4 sm:grid md:grid-cols-3 xl:grid-cols-3 3xl:flex flex-wrap justify-center">
            {nextPaths.map((path, i) => (
              <button type="button" onClick={async () => {await choosePath(i);}} key={i} className="bg-gradient-to-tr from-gray-900 to-green-900 hover:from-gray-900 hover:to-green-800 rounded-md shadow-lg shadow-indigo-500/40 hover:shadow-none">
                <div className="max-w-xs h-full text-white hover:text-black">
                  <div className="p-5 text-left">
                    <p className="text-lg text-gray-300 font-bold">{'>'} {path.pathName}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};