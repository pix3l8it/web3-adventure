// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract GameData {
    enum PathType {
        CHASM,
        FRAGILE_CAVE,
        BROKEN_TRACK,
        MINE_TUNNEL,
        NARROW_CAVE,
        SMELL_OF_FIRE,
        OLD_LADDER,
        OLD_CORRIDOR,
        MUSKY_SMELL,
        LOOSE_PLANKS,
        FRIENDLY_RAT,
        MURMURING,
        DESERT,
        PALACE
    }

    enum GameState {
        NOT_STARTED,
        STARTED,
        DIED,
        WON
    }

    struct PathData {
        PathType pathType;
        uint256 minGold;
        uint256 maxGold;
        uint256 percentKey;
        uint256 percentTreasure;
        uint256 percentDeath;
        PathType[3] nextPathTypes;
    }

    string private pathUri;
    PathData private initialPath;
    mapping(PathType => PathData) private pathTypeToData;

    constructor() {
        pathTypeToData[PathType.CHASM] = PathData(
            PathType.CHASM,
            0, 0, 0, 0, 0,
            [PathType.FRAGILE_CAVE, PathType.BROKEN_TRACK, PathType.MINE_TUNNEL]
        );
        pathTypeToData[PathType.FRAGILE_CAVE] = PathData(
            PathType.FRAGILE_CAVE,
            400, 500, 15, 10, 50,
            [PathType.MUSKY_SMELL, PathType.OLD_LADDER, PathType.NARROW_CAVE]
        );
        pathTypeToData[PathType.BROKEN_TRACK] = PathData(
            PathType.BROKEN_TRACK,
            200, 400, 5, 10, 25,
            [PathType.LOOSE_PLANKS, PathType.FRAGILE_CAVE, PathType.MUSKY_SMELL]
        );
        pathTypeToData[PathType.MINE_TUNNEL] = PathData(
            PathType.MINE_TUNNEL,
            50, 100, 25, 0, 0,
            [PathType.OLD_CORRIDOR, PathType.FRIENDLY_RAT, PathType.MURMURING]
        );
        pathTypeToData[PathType.NARROW_CAVE] = PathData(
            PathType.NARROW_CAVE,
            100, 200, 25, 5, 15,
            [PathType.FRAGILE_CAVE, PathType.LOOSE_PLANKS, PathType.FRIENDLY_RAT]
        );
        pathTypeToData[PathType.SMELL_OF_FIRE] = PathData(
            PathType.SMELL_OF_FIRE,
            800, 1000, 70, 0, 30,
            [PathType.LOOSE_PLANKS, PathType.FRAGILE_CAVE, PathType.OLD_LADDER]
        );
        pathTypeToData[PathType.OLD_LADDER] = PathData(
            PathType.OLD_LADDER,
            400, 500, 15, 10, 30,
            [PathType.OLD_CORRIDOR, PathType.MINE_TUNNEL, PathType.SMELL_OF_FIRE]
        );
        pathTypeToData[PathType.OLD_CORRIDOR] = PathData(
            PathType.OLD_CORRIDOR,
            100, 200, 15, 10, 0,
            [PathType.SMELL_OF_FIRE, PathType.OLD_LADDER, PathType.MURMURING]
        );
        pathTypeToData[PathType.MUSKY_SMELL] = PathData(
            PathType.MUSKY_SMELL,
            200, 300, 15, 50, 50,
            [PathType.SMELL_OF_FIRE, PathType.DESERT, PathType.PALACE]
        );
        pathTypeToData[PathType.LOOSE_PLANKS] = PathData(
            PathType.LOOSE_PLANKS,
            400, 500, 70, 10, 35,
            [PathType.MUSKY_SMELL, PathType.MURMURING, PathType.PALACE]
        );
        pathTypeToData[PathType.FRIENDLY_RAT] = PathData(
            PathType.FRIENDLY_RAT,
            100, 200, 15, 60, 5,
            [PathType.SMELL_OF_FIRE, PathType.NARROW_CAVE, PathType.DESERT]
        );
        pathTypeToData[PathType.MURMURING] = PathData(
            PathType.MURMURING,
            1000, 2500, 15, 10, 30,
            [PathType.NARROW_CAVE, PathType.DESERT, PathType.OLD_CORRIDOR]
        );
        pathTypeToData[PathType.DESERT] = PathData(
            PathType.DESERT,
            1000, 2500, 15, 15, 40,
            [PathType.SMELL_OF_FIRE, PathType.DESERT, PathType.PALACE]
        );
        pathTypeToData[PathType.PALACE] = PathData(
            PathType.PALACE,
            5000, 50000, 0, 100, 25,
            [PathType.PALACE, PathType.PALACE, PathType.PALACE]
        );

        initialPath = pathTypeToData[PathType.CHASM];
        pathUri = "ipfs://bafybeia3hrdjiiotqsy5isksgcriemoiddqpal4phdp5zeygrzb6xwnqre/{id}.json";
    }

    function uri(uint256) public view returns (string memory) {
        return pathUri;
    }

    function getInitialPath() public view returns (PathData memory) {
        return initialPath;
    }

    function getPathDataFromType(PathType pathType) public view returns (PathData memory) {
        return pathTypeToData[pathType];
    }
}