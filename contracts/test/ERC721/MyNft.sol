// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNft is ERC721, Ownable(msg.sender) {
    constructor() ERC721("MyNft", "MNFT") {}

    function safeMint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }
    function safeMintBulk(address to, uint256[] calldata tokenIds) public onlyOwner {
        for (uint256 index = 0; index < tokenIds.length; index++) {
            _safeMint(to, tokenIds[index]);
        }

    }
}
