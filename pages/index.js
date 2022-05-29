import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import axios from 'axios';

import { _getProvider, _getSigner, _requestAccount } from '../utils/utils.js';
import { _loadPathDescriptors, _inGame, _isDead, _hasWon, _getGold, _getKey, _getTreasure } from '../utils/gameutils.js';

import GameItems from './artifacts/contracts/GameItems.sol/GameItems.json';
import Game from './artifacts/contracts/Game.sol/Game.json';

export default function Home() {
  const [player, setPlayer] = useState(undefined);
  const [currentPath, setCurrentPath] = useState([]);
  const [currentPathImage, setCurrentPathImage] = useState(null);
  const [nextPaths, setNextPaths] = useState([]);
  const [inGame, setInGame] = useState(undefined);
  const [isDead, setIsDead] = useState(undefined);
  const [hasWon, setHasWon] = useState(undefined);
  const [gold, setGold] = useState(0);
  const [key, setKey] = useState(0);
  const [treasure, setTreasure] = useState(0);
  const [goldImage, setGoldImage] = useState(null);
  const [keyImage, setKeyImage] = useState(null);
  const [treasureImage, setTreasureImage] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const init = async () => {
      try {
        const player = await _requestAccount();
        setPlayer(player);

        if (player) {
          await checkInGameAndLoad();
          await loadGameItems();
        }
      } catch (error) {
        console.log(error);
      }
    };
    init();
  }, []);

  function changeIpfsUrl(itemUri) {
    const ipfsProvider = '.ipfs.nftstorage.link';
    const itemUrl = itemUri.replace(/ipfs:\/\/([a-zA-Z0-9]*)\//, 'https://$1' + ipfsProvider + '/');
    return itemUrl;
  }
  
  async function loadGameImage(contract, tokenId, setImage) {
    const itemUri = await contract.uri(tokenId);
    const itemUrl = changeIpfsUrl(itemUri).replace('{id}', '' + tokenId);
    const itemData = await axios.get(itemUrl);

    const img = new Image();
    img.src = changeIpfsUrl(itemData.data.image);

    setImage(img.src);
  }

  async function loadGameItems() {
    const provider = await _getProvider();
    const gameItemsContract = new ethers.Contract(process.env.NEXT_PUBLIC_GAME_ITEMS_ADDR, GameItems.abi, provider);

    await loadGameImage(gameItemsContract, 0, setGoldImage);
    await loadGameImage(gameItemsContract, 1, setKeyImage);
    await loadGameImage(gameItemsContract, 2, setTreasureImage);
  }

  async function checkInGameAndLoad() {
    const provider = await _getProvider();
    const inGame = await _inGame(provider);
    const isDead = await _isDead(provider);
    const hasWon = await _hasWon(provider);
    const gold = await _getGold(provider);
    const key = await _getKey(provider);
    const treasure = await _getTreasure(provider);
    setInGame(inGame);
    setIsDead(isDead);
    setHasWon(hasWon);
    setGold(gold);
    setKey(key);
    setTreasure(treasure);
    if (inGame || isDead || hasWon) {
      await loadGameData();
    }
  }

  async function startGame() {
    const signer = await _getSigner();
    const gameContract = new ethers.Contract(process.env.NEXT_PUBLIC_GAME_ADDR, Game.abi, signer);
    const pathTx = await gameContract.startGame();
    await pathTx.wait();
    await checkInGameAndLoad();
  }

  async function choosePath(choice) {
    const signer = await _getSigner();
    const gameContract = new ethers.Contract(process.env.NEXT_PUBLIC_GAME_ADDR, Game.abi, signer);
    const pathTx = await gameContract.choosePath(choice);
    await pathTx.wait();
    await checkInGameAndLoad();
  }

  async function loadGameData() {
    const provider = await _getProvider();
    const gameContract = new ethers.Contract(process.env.NEXT_PUBLIC_GAME_ADDR, Game.abi, provider);
    const player = await _requestAccount();
    const pathData = await gameContract.fetchCurrentPath(player);

    await setAllPathData(pathData, gameContract);
  }

  async function setAllPathData(pathData, gameContract) {
    window.scrollTo(0, 0);
    const currentPath = await _loadPathDescriptors(gameContract, pathData.pathType);
    setCurrentPath(currentPath);

    const img = new Image();
    img.src = changeIpfsUrl(currentPath.image);
    console.log(img.src);
    setCurrentPathImage(img.src);

    const nextPathTypes = pathData.nextPathTypes;
    const nextPaths = await Promise.all(nextPathTypes.map(async pathType => {
      const path = await _loadPathDescriptors(gameContract, pathType);
      return path;
    }));
    setNextPaths(nextPaths);
  }

  if (!player) return ( <h1 className="p-20 text-4xl text-gray-300">Connect with Metamask to play this game.</h1> );
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
      { !inGame && !currentPath.length && !nextPaths.length ?
      <div className="pt-2 w-full grid grid-cols-1 place-items-center">
        <div className="p-10 text-2xl text-gray-300 font-extrabold">Start a Game!</div>
        <button type="button" onClick={startGame} className="p-4 font-extrabold text-gray-300 bg-gradient-to-tr from-gray-900 to-green-900 hover:from-gray-900 hover:to-green-800 rounded-md shadow-lg shadow-indigo-500/40 hover:shadow-none">
          {'>'} Start Game
        </button>
      </div>
      :
      <div className="flex-wrap w-full pt-2 px-10 content-center">
        <div className="pb-6 w-full text-lg text-gray-300">Current path: <span className="font-extrabold">{currentPath.pathName}</span></div>
        <img src={currentPathImage} alt='' className='rounded-lg' />
        { !isDead ?
          <div className="py-6 text-lg text-gray-300">{currentPath.pathDescription}</div>
          :
          <div className="py-6 justify-left text-lg text-gray-300 font-medium">{currentPath.deathDescription}</div>
        }
        
        { isDead ? <div className="pb-10 justify-left text-lg text-gray-300 font-extrabold text-red-600">Game over!</div> : <div></div> }
        { hasWon ? <div className="pb-10 justify-left text-lg text-gray-300 font-extrabold text-purple-600">You won!</div> : <div></div> }
        { isDead || hasWon ?
        <button type="button" onClick={startGame} className="p-4 mb-10 font-extrabold text-gray-300 justify-center bg-gradient-to-tr from-gray-900 to-green-900 hover:from-gray-900 hover:to-green-800 rounded-md shadow-lg shadow-indigo-500/40 hover:shadow-none">
          {'>'} Restart Game
        </button>
        :
        <div>
          <div className="py-4 w-full text-lg text-gray-300">Here are the adjacent paths:</div>
          <div className="w-full flex flex-col">
            <div className="flex flex-col items-center justify-center md:flex-row">
              <div className="px-5 mt-4 mb-10 gap-4 sm:grid md:grid-cols-3 xl:grid-cols-3 3xl:flex flex-wrap justify-center">
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
        </div>
        }
      </div>
      }
    </section>
  );
};