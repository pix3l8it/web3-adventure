// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract GameItems is ERC1155, ERC1155Supply {
    uint256 public constant GOLD = 0;
    uint256 public constant KEY = 1;
    uint256 public constant TREASURE = 2;

    address public gameAddress;

    constructor(address _gameAddress) ERC1155("ipfs://bafybeigrsadirdhydy6sqo4aintqy2uyhp5rqrteoyjfnmvhadc3yjdbxe/{id}.json") {
        gameAddress = _gameAddress;

        _mint(gameAddress, GOLD, 10**18, "");
        _mint(gameAddress, KEY, 10**18, "");
        _mint(gameAddress, TREASURE, 10**18, "");

        setApprovalForAll(gameAddress, true);
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}