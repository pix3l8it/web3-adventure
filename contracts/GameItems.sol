// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";

contract GameItems is ERC1155, ERC1155Supply {
    uint256 public constant GOLD = 0;
    uint256 public constant KEY = 1;
    uint256 public constant TREASURE = 2;

    address public gameAddress;

    constructor(address _gameAddress) ERC1155("ipfs://bafybeigrsadirdhydy6sqo4aintqy2uyhp5rqrteoyjfnmvhadc3yjdbxe/{id}.json") {
        gameAddress = _gameAddress;

        setApprovalForAll(gameAddress, true);
    }

    function mintTokens(address to, uint256[] memory ids, uint256[] memory amounts) public {
        _mintBatch(to, ids, amounts, "");
    }

    function mintToken(address to, uint256 id, uint256 amount) public {
        _mint(to, id, amount, "");
    }

    function burnTokens(address to, uint256[] memory ids, uint256[] memory amounts) public {
        _burnBatch(to, ids, amounts);
    }

    function burnToken(address to, uint256 id, uint256 amount) public {
        _burn(to, id, amount);
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