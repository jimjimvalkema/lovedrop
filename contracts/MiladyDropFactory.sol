// SPDX-License-Identifier: TBD
pragma solidity >=0.8.0;

import {MiladyDrop} from "./MiladyDrop.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
// import "forge-std/console.sol";


contract MiladyDropFactory {
   address public implementation = address(new MiladyDrop());
   event CreateNewDrop(address indexed deployerAddress, address dropAddress);
   

   //TODO do with proxy to save on deployement cost
   function createNewDrop(address _airdropTokenAddress, bytes32 _merkleRoot, string memory _claimDataIpfs) public {
      // MiladyDrop newMiladyDrop = new MiladyDrop(_requiredNFTAddresses, _airdropTokenAddress, _merkleRoot, _claimDataIpfs);
      
      // address dropAddress = address(newMiladyDrop); //TODO check if this cheaper
      address deployerAddress = msg.sender;

      address instance = Clones.clone(implementation);
      MiladyDrop(instance).initialize(_airdropTokenAddress, _merkleRoot, _claimDataIpfs);
      emit CreateNewDrop(deployerAddress, instance);
   }
}