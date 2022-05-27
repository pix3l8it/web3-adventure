## Full stack Web3 Adventure game built with Solidity, React, IPFS, & Next.js

![Header](/screenshots/web3-adventure-0.png)

This project was inspired by classic text based games. You collect gold, keys, and treasure that are transferred to your wallet in the form of ERC-1155 tokens. Your game state is stored on the blockchain at each path decision, and will reload when you come back. You can play the game here: https://web3-adventure.netlify.app/

To run this project locally, follow these steps.

1. Clone the project locally, change into the directory, and install the dependencies:

```sh
git clone https://github.com/pix3l8it/web3-adventure.git
cd web3-adventure
# install using NPM
npm install
```

2. Start the local Hardhat node

```sh
npx hardhat node
```

3. With the network running, deploy the contracts to the local network in a separate terminal window

```sh
npx hardhat run scripts/deploy.js --network localhost
```

4. Start the app

```
npm run dev
```

### Configuration

You will need to configure a .env file for some environment variables to work. You can have separate files for local vs development networks, using .env.local and .env.development, as well as other options.

```
RINKEBY_ALCHEMY_URL=https://eth-rinkeby.alchemyapi.io/v2/{Your alchemy API key}
RINKEBY_PRIVATE_KEY={Your private key}

NEXT_PUBLIC_GAME_ITEMS_ADDR={Contract address of GameItems once deployed}
NEXT_PUBLIC_GAME_ADDR={Contract address of Game once deployed
```

### Screenshots

Needs to connect to a Metamask wallet to play. Might add more ways to connect later.

![Header](/screenshots/web3-adventure-1.png)

There are many ways the player can die in game. Whether the player dies is determined by a random number (using keccak256) and a death rate percentage that is defined for each path. Using Chainlink VRF would make this unpredictable, and is a feature I would like to implement.

![Header](/screenshots/web3-adventure-2.png)

Here you can see the previous paths that you have taken from all of your games, and their outcomes.

![Header](/screenshots/web3-adventure-3.png)
