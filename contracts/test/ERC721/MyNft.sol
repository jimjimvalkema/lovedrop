// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNft is ERC721, Ownable(msg.sender) {
    constructor() ERC721("MyNft", "MNFT") {}

    function safeMint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }
    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
     * by default, can be overridden in child contracts.
     */
    function _baseURI() pure internal override returns (string memory) {
        return "ipfs://bafybeiay2g62ppxbtgoklgh2cfoeosdw57roxmo3y67mcjnclntqknqh6e";
    }
    function safeMintBulk(address to, uint256[] calldata tokenIds) public onlyOwner {
        for (uint256 index = 0; index < tokenIds.length; index++) {
            _safeMint(to, tokenIds[index]);
            
        }

    }
}
