import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import axios from 'axios';

import { _getProvider, _getSigner, _requestAccount } from '../utils/utils.js';
import { _loadPathDescriptors, _inGame, _isDead, _hasWon, _getGold, _getKey, _getTreasure } from '../utils/gameutils.js';

import GameItems from './artifacts/contracts/GameItems.sol/GameItems.json';
import Game from './artifacts/contracts/Game.sol/Game.json';

export default function Home() {
  const [player, setPlayer] = useState(undefined);
  const [gold, setGold] = useState(0);
  const [key, setKey] = useState(0);
  const [treasure, setTreasure] = useState(0);
  const [goldImage, setGoldImage] = useState(null);
  const [keyImage, setKeyImage] = useState(null);
  const [treasureImage, setTreasureImage] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const player = await _requestAccount();
        setPlayer(player);

        if (player) {
          await checkGameItems();
        }
      } catch (error) {
        console.log(error);
      }
    };
    init();
  }, []);
  
  async function loadGameImage(contract, tokenId, setImage) {
    const ipfsProvider = '.ipfs.nftstorage.link'
    const itemUri = await contract.uri(tokenId);
    const itemUrl = itemUri.replace(/ipfs:\/\/([a-zA-Z0-9]*)\//, 'https://$1' + ipfsProvider + '/').replace('{id}', '' + tokenId);
    const itemData = await axios.get(itemUrl);

    const img = new Image();
    img.src = itemData.data.image.replace(/ipfs:\/\/([a-zA-Z0-9]*)\//, 'https://$1' + ipfsProvider + '/');

    setImage(img.src);
  }

  async function loadGameItems() {
    const provider = await _getProvider();
    const gameItemsContract = new ethers.Contract(process.env.NEXT_PUBLIC_GAME_ITEMS_ADDR, GameItems.abi, provider);

    await loadGameImage(gameItemsContract, 0, setGoldImage);
    await loadGameImage(gameItemsContract, 1, setKeyImage);
    await loadGameImage(gameItemsContract, 2, setTreasureImage);
  }

  async function checkGameItems() {
    const provider = await _getProvider();
    const gold = await _getGold(provider);
    const key = await _getKey(provider);
    const treasure = await _getTreasure(provider);
    setGold(gold);
    setKey(key);
    setTreasure(treasure);

    if (!goldImage || !keyImage || !treasureImage) {
      loadGameItems();
    }
  }

  async function openTreasure() {
    const signer = await _getSigner();
    const gameContract = new ethers.Contract(process.env.NEXT_PUBLIC_GAME_ADDR, Game.abi, signer);
    const pathTx = await gameContract.openTreasureWithKey();
    await pathTx.wait();
    await checkGameItems();
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
      { key > 0 && treasure > 0 ?
      <div className="pt-2 w-full grid grid-cols-1 place-items-center">
        <div className="p-10 text-2xl text-gray-300 font-extrabold">You can open one Treasure with one Key.</div>
        <button type="button" onClick={openTreasure} className="p-4 font-extrabold text-gray-300 bg-gradient-to-tr from-gray-900 to-green-900 hover:from-gray-900 hover:to-green-800 rounded-md shadow-lg shadow-indigo-500/40 hover:shadow-none">
          {'>'} Open Treasure!
        </button>
      </div>
      :
      <div className="pt-2 w-full grid grid-cols-1 place-items-center">
        <div className="p-10 text-2xl text-gray-300 font-extrabold">You can open one Treasure with one Key. Go play more games and see what you can find!</div>
      </div>
      }
    </section>
  );
};