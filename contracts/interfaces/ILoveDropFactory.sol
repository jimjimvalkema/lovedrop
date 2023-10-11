// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.5.0;

// Allows anyone to claim a token if they exist in a merkle root.
interface ILoveDropFactory {
    //the address that contains the implementation of new drops
    function implementation() external view returns (address);

    // creates a new drop contract as a immuttable proxy clone with the implementation of the factory contract
    function createNewDrop(address _airdropTokenAddress, bytes32 _merkleRoot, string memory _claimDataIpfs) external;

    // This event is triggered whenever a new drop is deployed
    event CreateNewDrop(address indexed deployerAddress, address dropAddress);
}