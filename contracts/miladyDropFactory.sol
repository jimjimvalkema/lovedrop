// SPDX-License-Identifier: TBD
pragma solidity 0.8.18;

import {MiladyDrop} from "./MiladyDrop.sol";


contract MiladyDropFactory {
   MiladyDrop[] public MiladyDrops;
   event CreateNewDrop(address dropAddress);

   function createNewDrop(address _requiredNFTAddress, address _airdropTokenAddress, bytes32 _merkleRoot, string memory _claimDataIpfs) public {
      MiladyDrop miladyDrop = new MiladyDrop(_requiredNFTAddress,_airdropTokenAddress, _merkleRoot, _claimDataIpfs);
      MiladyDrops.push(miladyDrop);
      emit CreateNewDrop(address(miladyDrop));
   }
}