// SPDX-License-Identifier: TBD
pragma solidity 0.8.18;

import {MiladyDrop} from "./MiladyDrop.sol";


contract MiladyDropFactory {
   //Its possible to use etherscan/archive node to get this data without the list
   struct DeployedDrop {
      address dropAddress;
      address deployer;
   }
   DeployedDrop[] public DeployedDrops;

   event CreateNewDrop(address indexed deployer, address dropAddress);

   function createNewDrop(address _requiredNFTAddress, address _airdropTokenAddress, bytes32 _merkleRoot, string memory _claimDataIpfs) public {
      MiladyDrop miladyDrop = new MiladyDrop(_requiredNFTAddress,_airdropTokenAddress, _merkleRoot, _claimDataIpfs);
      
      address dropAddress = address(miladyDrop); //TODO check if this cheaper
      address deployerAddress = msg.sender;
      
      DeployedDrops.push(DeployedDrop(dropAddress, deployerAddress));
      emit CreateNewDrop(deployerAddress, dropAddress);
   }
}