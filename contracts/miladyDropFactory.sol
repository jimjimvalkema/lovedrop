// SPDX-License-Identifier: TBD
pragma solidity 0.8.18;

import {MiladyDrop} from "./MiladyDrop.sol";


contract MiladyDropFactory {
   //Its possible to use etherscan/archive node to get this data without the list
   struct DeployedDrop {
      address deployerAddress;
      address dropAddress;
   }
   //DeployedDrop[] public DeployedDrops; //TODO make nft drop version 
   //DeployedDrop[] public DeployedDrops; //TODO make nft drop version 
   //MiladyDrop[] public DeployedDrops;
   DeployedDrop[] public DeployedDrops;


   event CreateNewDrop(address indexed deployerAddress, address dropAddress);

   //TODO do with proxy to save on deployement cost
   function createNewDrop(address _requiredNFTAddress, address _airdropTokenAddress, bytes32 _merkleRoot, string memory _claimDataIpfs) public {
      MiladyDrop newMiladyDrop = new MiladyDrop(_requiredNFTAddress,_airdropTokenAddress, _merkleRoot, _claimDataIpfs);
      
      address dropAddress = address(newMiladyDrop); //TODO check if this cheaper
      address deployerAddress = msg.sender;

      DeployedDrops.push(DeployedDrop(deployerAddress, dropAddress)); //to not do this could save 52969 gas ~0.0053 ETH ~8.50 USD at 100 gwei
      emit CreateNewDrop(deployerAddress, dropAddress);
   }
}