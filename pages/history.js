import { ethers } from 'ethers'
import { useEffect, useState } from 'react'

import { _getProvider, _getSigner, _requestAccount } from '../utils/utils.js';

import Game from './artifacts/contracts/Game.sol/Game.json';

export default function Home() {
  const [player, setPlayer] = useState(null);
  const [paths, setPaths] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        const player = await _requestAccount();
        setPlayer(player);

        if (player) {
          await loadPathHistory();
        }
      } catch (error) {
        console.log(error);
      }
    };
    init();
  }, []);

  async function loadPathHistory() {
    const provider = await _getProvider();
    const gameContract = new ethers.Contract(process.env.NEXT_PUBLIC_GAME_ADDR, Game.abi, provider);
    const player = await _requestAccount();
    const data = await gameContract.fetchPathHistory(player);
    
    const items = await Promise.all(data.map(async i => {
      const pathData = await gameContract.getPathDataFromType(i.pathType);
      const item = {
        pathName: pathData.pathName,
        gold: i.gold.toNumber(),
        key: i.key,
        treasure: i.treasure,
        death: i.death
      };
      return item;
    }));
    setPaths(items);
  }

  if (!player) return ( <h1 className="p-20 text-4xl text-gray-300">Connect with Metamask to play this game.</h1> );
  if (!paths.length) return ( <h1 className="p-20 text-4xl text-gray-300">No game history! Go start your first game.</h1> );
  return (
    <section className="bg-gray-800 px-auto w-full py-12">
      <div className="flex flex-col">
        <div className="flex flex-col items-center justify-center md:flex-row">
          <div className="px-10 my-6 gap-4 sm:grid md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 3xl:flex flex-wrap justify-center">
            {paths.map((path, i) => (
              <div key={i} className="bg-gradient-to-tr from-gray-900 to-green-900 hover:from-gray-900 hover:to-green-800 rounded-md shadow-lg shadow-indigo-500/40 hover:shadow-none">
                <div className="max-w-xs text-gray-300">
                  <div className="p-3 text-left">
                    <p className="text-l mb-4 font-bold">{path.pathName}</p>
                    <p className="text-xs">
                      {path.gold ? <span className="block">Received <span className="font-bold text-yellow-400">{path.gold}</span> gold!</span> : ''}
                      {path.key ? <span className="block">Received <span className="font-bold text-green-600">key</span></span> : ''}
                      {path.treasure ? <span className="block">Received <span className="font-bold text-blue-400">treasure</span></span> : ''}
                      {path.death ? <span className="font-bold text-red-600">You died!</span> : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};