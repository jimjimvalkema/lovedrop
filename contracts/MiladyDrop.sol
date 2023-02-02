// SPDX-License-Identifier: TBD
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MiladyDrop {
    IERC20 private airdropToken;
    IERC721 private requiredNFT;
    address public requiredNFTAddress;
    address public airdropTokenAddress;

    uint256 airdropAmount;
    mapping(uint256 => bool) public claimedIds; //TODO tight packing and getter


    constructor(address _requiredNFTAddress, address _airdropTokenAddress, uint256 _amount) {
        requiredNFT = IERC721(_requiredNFTAddress);
        airdropToken = IERC20(_airdropTokenAddress);
        airdropAmount = _amount;

        //store addresses for easier acces
        requiredNFTAddress = _requiredNFTAddress;
        airdropTokenAddress = _airdropTokenAddress;
        }

    function claim(uint256[] memory _ids) public {
        uint256 currentId;
        for (uint i=0; i < _ids.length; i++) {
            currentId = _ids[i];
            require(requiredNFT.ownerOf(currentId) == msg.sender, "you dont own one or more of these nfts"); //msg.esender bad?
            require(claimedIds[currentId] == false, "one or more of these ids is already claimed");
            claimedIds[currentId] = true;
            airdropToken.transfer(address(msg.sender), airdropAmount);
        }
    }
}