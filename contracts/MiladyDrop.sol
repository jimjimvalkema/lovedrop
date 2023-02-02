// SPDX-License-Identifier: TBD
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MiladyDrop {
    IERC20 public airdropToken; //public?
    IERC721 public requiredNFT;
    uint256 airdropAmount;

    constructor(address requiredNFTAddress, address airdropTokenAddress, uint256 amount) {
        requiredNFT = IERC721(requiredNFTAddress);
        airdropToken = IERC20(airdropTokenAddress);
        airdropAmount = amount;
        airdropToken.approve(address(this), 1000000000000);
        }

    mapping(uint256 => bool) public claimedIds; //TODO tight packing and getter

    function claim(uint256[] memory ids) public {
        uint256 currentId;
        for (uint i=0; i < ids.length; i++) {
            currentId = ids[i];
            require(requiredNFT.ownerOf(currentId) == msg.sender, "you dont own one or more of these nfts"); //msg.esender bad?
            require(claimedIds[currentId] == false, "oops already claimed");
            claimedIds[currentId] = true;
            airdropToken.transfer(address(msg.sender), airdropAmount);
        }
    }

}