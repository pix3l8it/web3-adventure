// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

import "../contracts/GameData.sol";
import "../contracts/GameItems.sol";

contract Game is ReentrancyGuard, GameData, ERC1155Holder {
    using Counters for Counters.Counter;
    Counters.Counter private _pathIds;

    uint256 public constant PATHS_TO_CHOOSE = 3;
    PathType public constant NULL = PathType.CHASM;

    address public gameItemsAddress;
    address public owner;

    GameItems private gameItems;

    struct Path {
        uint256 pathId;
        PathType pathType;
        uint256 gold;
        address payable player;
        bool key;
        bool treasure;
        bool death;
    }

    mapping(uint256 => Path) private idToPath;
    mapping(address => PathData) private playerCurrentPaths;
    mapping(address => GameState) private playerStates;

    constructor(address _gameItemsAddress, address _owner) {
        gameItemsAddress = _gameItemsAddress;
        owner = _owner;

        gameItems = GameItems(gameItemsAddress);
    }

    function startGame() public payable nonReentrant notInGame() {
        playerCurrentPaths[msg.sender] = getInitialPath();
        playerStates[msg.sender] = GameState.STARTED;
    }

    function choosePath(uint choiceId) public payable nonReentrant inGame {
        require(choiceId < PATHS_TO_CHOOSE, "You must select a valid path");

        _pathIds.increment();
        uint256 pathId = _pathIds.current();
        PathType[PATHS_TO_CHOOSE] memory playerPathTypes = playerCurrentPaths[msg.sender].nextPathTypes;
        PathType pathType = playerPathTypes[choiceId];

        PathData memory _pathData = getPathDataFromType(pathType);

        uint256[] memory rndValues = generateRandoms(4);
        uint256 gold = 0;
        bool key = false;
        bool treasure = false;
        bool death = ((rndValues[0] % 100) < _pathData.percentDeath);

        if (death) {
            playerStates[msg.sender] = GameState.DIED;
        }
        else {
            // Only gets items if alive
            gold = (rndValues[1] % (_pathData.maxGold - _pathData.minGold)) + _pathData.minGold;
            key = ((rndValues[2] % 100) < _pathData.percentKey);
            treasure = ((rndValues[3] % 100) < _pathData.percentTreasure);

            // Convert to dynamic arrays to avoid implicit conversion error during safe transfer
            uint256[] memory _itemIds = new uint256[](3);
            _itemIds[0] = gameItems.GOLD();
            _itemIds[1] = gameItems.KEY();
            _itemIds[2] = gameItems.TREASURE();
            uint256[] memory _itemAmounts = new uint256[](3);
            _itemAmounts[0] = gold;
            _itemAmounts[1] = key ? 1 : 0;
            _itemAmounts[2] = treasure ? 1 : 0;
            gameItems.mintTokens(msg.sender, _itemIds, _itemAmounts);

            if (pathType == PathType.PALACE) {
                playerStates[msg.sender] = GameState.WON;
            }
        }

        playerCurrentPaths[msg.sender] = _pathData;

        idToPath[pathId] = Path(
            pathId,
            pathType,
            gold,
            payable(msg.sender),
            key,
            treasure,
            death
        );
    }

    function openTreasureWithKey() public payable nonReentrant {
        require(gameItems.balanceOf(msg.sender,gameItems.TREASURE()) > 0, "You have no Treasure to open");
        require(gameItems.balanceOf(msg.sender,gameItems.KEY()) > 0, "You have no Key to open your Treasure");

        // Burn one Key and one Treasure
        uint256[] memory _itemIds = new uint256[](2);
        _itemIds[0] = gameItems.KEY();
        _itemIds[1] = gameItems.TREASURE();
        uint256[] memory _itemAmounts = new uint256[](2);
        _itemAmounts[0] = 1;
        _itemAmounts[1] = 1;
        gameItems.burnTokens(msg.sender, _itemIds, _itemAmounts);

        // Mint Gold to player
        gameItems.mintToken(msg.sender, uint256(gameItems.GOLD()), uint256(10000));
    }

    function fetchCurrentPath(address player) public view returns (PathData memory) {
        return playerCurrentPaths[player];
    }

    function fetchPathHistory(address player) public view returns (Path[] memory) {
        uint totalPathCount = _pathIds.current();
        uint pathCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < totalPathCount; i++) {
            if (idToPath[i + 1].player == player) {
                pathCount += 1;
            }
        }

        // Get player paths in order
        Path[] memory paths = new Path[](pathCount);
        for (uint i = 0; i < totalPathCount; i++) {
            if (idToPath[i + 1].player == player) {
                uint currentId = idToPath[i + 1].pathId;
                Path storage currentItem = idToPath[currentId];
                paths[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return paths;
    }

    function isInGame(address player) public view returns(bool _isInGame) {
        return playerStates[player] == GameState.STARTED;
    }

    function isDead(address player) public view returns(bool _isDead) {
        return playerStates[player] == GameState.DIED;
    }

    function hasWon(address player) public view returns(bool _hasWon) {
        return playerStates[player] == GameState.WON;
    }

    function getBalanceOfGold(address player) public view returns(uint256 gold) {
        uint256 data = gameItems.balanceOf(player, gameItems.GOLD());
        return data;
    }

    function getBalanceOfKey(address player) public view returns(uint256 key) {
        uint256 data = gameItems.balanceOf(player, gameItems.KEY());
        return data;
    }

    function getBalanceOfTreasure(address player) public view returns(uint256 treasure) {
        uint256 data = gameItems.balanceOf(player, gameItems.TREASURE());
        return data;
    }
    
    function generateRandoms(uint256 n) private view returns (uint256[] memory rndValues) {
        rndValues = new uint256[](n);

        for (uint256 i = 0; i < n; i++) {
            rndValues[i] = uint256(keccak256(abi.encode(block.difficulty, block.timestamp, i)));
        }
        return rndValues;
    }

    modifier inGame() {
        require(playerStates[msg.sender] == GameState.STARTED, 'not in game');
        _;
    }

    modifier notInGame() {
        require(playerStates[msg.sender] != GameState.STARTED, 'already in game');
        _;
    }
}