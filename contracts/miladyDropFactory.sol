// SPDX-License-Identifier: TBD
pragma solidity >=0.8.0;

import {MiladyDrop} from "./MiladyDrop.sol";


contract MiladyDropFactory {
   //Its possible to use etherscan/archive node to get this data without the list
   struct DeployedDrop {
      address deployerAddress;
      address dropAddress;
   }

   event CreateNewDrop(address indexed requiredNFTAddress, address indexed deployerAddress, address dropAddress);

   //TODO do with proxy to save on deployement cost
   function createNewDrop(address _requiredNFTAddress, address _airdropTokenAddress, bytes32 _merkleRoot, string memory _claimDataIpfs) public {
      MiladyDrop newMiladyDrop = new MiladyDrop(_requiredNFTAddress,_airdropTokenAddress, _merkleRoot, _claimDataIpfs);
      
      address dropAddress = address(newMiladyDrop); //TODO check if this cheaper
      address deployerAddress = msg.sender;

      emit CreateNewDrop(_requiredNFTAddress, deployerAddress, dropAddress);
   }
}