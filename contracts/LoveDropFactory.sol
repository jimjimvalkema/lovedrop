// SPDX-License-Identifier: TBD
pragma solidity >=0.8.0;

import {LoveDrop} from "./LoveDrop.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
// import "forge-std/console.sol";


contract LoveDropFactory {
   address public implementation = address(new LoveDrop());
   event CreateNewDrop(address indexed deployerAddress, address dropAddress);
   

   //TODO do with proxy to save on deployement cost
   function createNewDrop(address _airdropTokenAddress, bytes32 _merkleRoot, string memory _claimDataIpfs) public {
      // LoveDrop new LoveDrop = new LoveDrop(_requiredNFTAddresses, _airdropTokenAddress, _merkleRoot, _claimDataIpfs);
      
      // address dropAddress = address(newLoveDrop); //TODO check if this cheaper
      address deployerAddress = msg.sender;

      address instance = Clones.clone(implementation);
      LoveDrop(instance).initialize(_airdropTokenAddress, _merkleRoot, _claimDataIpfs);
      emit CreateNewDrop(deployerAddress, instance);
   }
}