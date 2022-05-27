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
        string pathName;
        string pathDescription;
        string deathDescription;
        uint256 minGold;
        uint256 maxGold;
        uint256 percentKey;
        uint256 percentTreasure;
        uint256 percentDeath;
        PathType[3] nextPathTypes;
    }

    PathData private initialPath;
    mapping(PathType => PathData) private pathTypeToData;

    constructor() {
        pathTypeToData[PathType.CHASM] = PathData(
            PathType.CHASM,
            "The Chasm",
            "You awaken at the bottom of a deep unscalable chasm with caves in all directions. Silence fills the space around you. You can see city lights atop the surface. It will be a long journey to find your way back up.",
            "Error: cannot die at the starting area",
            0, 0, 0, 0, 0,
            [PathType.FRAGILE_CAVE, PathType.BROKEN_TRACK, PathType.MINE_TUNNEL]
        );
        pathTypeToData[PathType.FRAGILE_CAVE] = PathData(
            PathType.FRAGILE_CAVE,
            "Fragile cave",
            "\'Sure, I\'ll check out this fragile looking cave.\' you say, as sharp rocks fall around you like spiky death rain. Somehow you manage your way through unscathed.",
            "The rocks above look sharp and fragile. One falls to the ground ahead of you, shattering as it hits the ground. You look up as one comes crackling down, and it's the last thing you see.",
            400, 500, 15, 10, 50,
            [PathType.OLD_LADDER, PathType.MINE_TUNNEL, PathType.NARROW_CAVE]
        );
        pathTypeToData[PathType.BROKEN_TRACK] = PathData(
            PathType.BROKEN_TRACK,
            "Broken track",
            "You spot some broken mine cart tracks and think maybe they once led back to the surface. Unfortunately, the path has been weakened from erosion and as the ground gives way, you slide back to where you came from.",
            "You spot some broken mine cart tracks and think maybe they once led back to the surface. The tracks get heavily eroded as you climb higher... eventually collapsing. You fall off the side to the rocks below.",
            200, 400, 5, 10, 25,
            [PathType.LOOSE_PLANKS, PathType.FRAGILE_CAVE, PathType.BROKEN_TRACK]
        );
        pathTypeToData[PathType.MINE_TUNNEL] = PathData(
            PathType.MINE_TUNNEL,
            "Mine tunnel",
            "The mines here are old and abandoned now that their resources have been harvested. The tunnels stretch on for what seems like hours, but you make your way through the darkness. The mine opens up to what seems to be an open area of an underground prison.",
            "",
            50, 100, 25, 0, 0,
            [PathType.OLD_CORRIDOR, PathType.FRIENDLY_RAT, PathType.MURMURING]
        );
        pathTypeToData[PathType.NARROW_CAVE] = PathData(
            PathType.NARROW_CAVE,
            "Narrow cave",
            "This cave is partially boarded up and looks like it could collapse, but you manage to squeeze through. You round the corner and let out a terrified squeal as you come face to face with a giant spider. Luckily for you, it's asleep for now after a large meal. *gulp* You carefully sidestep the giant webs and make your way out the other side.",
            "The narrow cave gets thinner and thinner as you venture through. You squeeze your way through a turn and scrape your knee. It gets so narrow that you can turn your head. You try to reverse, but your foot is caught and the cave starts to fill with water. After failed attempts to struggle free, you drown in the cave.",
            100, 200, 25, 5, 15,
            [PathType.FRAGILE_CAVE, PathType.LOOSE_PLANKS, PathType.FRIENDLY_RAT]
        );
        pathTypeToData[PathType.SMELL_OF_FIRE] = PathData(
            PathType.SMELL_OF_FIRE,
            "Smell of fire",
            "The comforting smell of a cook's fire entices you. You find your way to a cave with a soft glow, and see a friendly woman cooking rat and root vegetables over the fire. She shares some food with you and talks, eventually pointing you in the right direction.",
            "The smell of smoke and sound of laughter gives you hope that there may be people nearby willing to help. Unfortunately, their laughter turns to cackling as you get closer and they decide you're their next target.",
            800, 1000, 70, 0, 30,
            [PathType.OLD_LADDER, PathType.FRAGILE_CAVE, PathType.LOOSE_PLANKS]
        );
        pathTypeToData[PathType.OLD_LADDER] = PathData(
            PathType.OLD_LADDER,
            "Old ladder",
            "The old ladder groans and squeaks as you climb up to continue on.",
            "Time has degraded this old ladder more than first perceived. \'Maybe it\'ll last until I reach the top?\' you hope, but then scream as it collapses beneath you.",
            400, 500, 15, 10, 30,
            [PathType.OLD_CORRIDOR, PathType.MINE_TUNNEL, PathType.SMELL_OF_FIRE]
        );
        pathTypeToData[PathType.OLD_CORRIDOR] = PathData(
            PathType.OLD_CORRIDOR,
            "Old corridor",
            "You walk through a long, dusty old corridor and pass through a sturdy door.",
            "",
            100, 200, 15, 10, 0,
            [PathType.SMELL_OF_FIRE, PathType.OLD_LADDER, PathType.DESERT]
        );
        pathTypeToData[PathType.MUSKY_SMELL] = PathData(
            PathType.MUSKY_SMELL,
            "Musky smell",
            "You follow a musky smell and arrive at some mushrooms growing in man-made boxes in a candle-lit section of a cave. An old prisoner politely offers you one. You take the sustenance and thank him, as he points you towards a hidden pathway.",
            "You follow a musky smell to some cave mushrooms, and your hunger gets the better of you. You regret it moments later as pain starts to shoot through your gut. Poison!",
            200, 300, 15, 50, 50,
            [PathType.SMELL_OF_FIRE, PathType.DESERT, PathType.PALACE]
        );
        pathTypeToData[PathType.LOOSE_PLANKS] = PathData(
            PathType.LOOSE_PLANKS,
            "Loose planks",
            "While exploring these large, mostly empty caves, you stumble upon some wooden planks. Some seem loose, and you pull one up to reveal a tunnel that leads out.",
            "While exploring these large, mostly empty caves, you stumble upon some wooden planks. One is warped at an angle so as to create a spring. You giggle as you jump up and down. Taking your largest jump yet, the wood gives way as you jump in the air with nothing but sharp rocks to break your fall.",
            400, 500, 15, 10, 35,
            [PathType.SMELL_OF_FIRE, PathType.DESERT, PathType.PALACE]
        );
        pathTypeToData[PathType.FRIENDLY_RAT] = PathData(
            PathType.FRIENDLY_RAT,
            "Friendly rat",
            "You hear a squeak and look down. A large, adorable rat seems to be trying to communicate with you. It turns and scuttles ahead, then stops to look at you and spins in a circle. You decide to follow it.",
            "You hear a squeak and look down. A large, adorable rat seems to be trying to communicate with you. You follow it down a pathway, but end up getting led into a pit trap. Who would have thought?",
            100, 200, 15, 60, 5,
            [PathType.SMELL_OF_FIRE, PathType.NARROW_CAVE, PathType.DESERT]
        );
        pathTypeToData[PathType.MURMURING] = PathData(
            PathType.MURMURING,
            "Sounds of murmuring",
            "You sneak around looking for the source of the murmuring, and see a group of ragged prisoners entertaining themselves with some kind of bone-tossing game. You sneak by undetected.",
            "You sneak around looking for the source of the murmuring, and find a group of guards playing dice. Not sneakily enough, as a guard in the lookout tower blows a horn and all the other guards turn towards you and draw their swords.",
            1000, 2500, 15, 10, 30,
            [PathType.NARROW_CAVE, PathType.DESERT, PathType.OLD_CORRIDOR]
        );
        pathTypeToData[PathType.DESERT] = PathData(
            PathType.DESERT,
            "Desert",
            "You walk along the desert for some time and eventually see a palace in the distance, and a city further ahead.",
            "You walk across the desert for hours and finally see a lake and palace in the distance. As you get closer, you realize the heat dancing off the sand has been playing tricks on you, but it is too late. You collapse from thirst.",
            1000, 2500, 15, 15, 30,
            [PathType.SMELL_OF_FIRE, PathType.DESERT, PathType.PALACE]
        );
        pathTypeToData[PathType.PALACE] = PathData(
            PathType.PALACE,
            "Palace",
            "You enter the palace",
            "You enter the palace, only to find it is overrun with cloaked figures chanting in a circle. All eyes turn towards you and the chanting gets louder. A number of large creatures form from the sand around you, and start charging, grabbing and smothering you. You try to breath, but can only inhale sand.",
            5000, 50000, 0, 100, 0,
            [PathType.PALACE, PathType.PALACE, PathType.PALACE]
        );

        initialPath = pathTypeToData[PathType.CHASM];
    }

    function getInitialPath() public view returns (PathData memory) {
        return initialPath;
    }

    function getPathDataFromType(PathType pathType) public view returns (PathData memory) {
        return pathTypeToData[pathType];
    }

    function getPathNameFromType(PathType pathType) public view returns (string memory) {
        return pathTypeToData[pathType].pathName;
    }
}