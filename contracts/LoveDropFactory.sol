// SPDX-License-Identifier: TBD
pragma solidity >=0.8.0;

import {LoveDrop} from "./LoveDrop.sol";
import {ILoveDropFactory} from "./interfaces/ILoveDropFactory.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";



contract LoveDropFactory is ILoveDropFactory {
   address public implementation = address(new LoveDrop());

   function createNewDrop(address _airdropTokenAddress, bytes32 _merkleRoot, string memory _claimDataIpfs) override public {
      address deployerAddress = msg.sender;

      address instance = Clones.clone(implementation);
      LoveDrop(instance).initialize(_airdropTokenAddress, _merkleRoot, _claimDataIpfs);
      emit CreateNewDrop(deployerAddress, instance);
   }
}