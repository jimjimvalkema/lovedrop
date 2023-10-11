// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.5.0;

// Allows anyone to claim a token if they exist in a merkle root.
interface ILoveDrop {
    function claimDataIpfs() external view returns (string calldata);

    //TODO interface for the public mappings
    //function getRequiredNFTAddresses() external view returns (address);

    // Returns the address of the token distributed by this contract.
    function airdropTokenAddress() external view returns (address);
    // Returns the merkle root of the merkle tree containing balances of all nft ids available to claim.
    function merkleRoot() external view returns (bytes32);
    // Returns true if the index has been marked claimed.
    function isClaimed(address nftAddress, uint256 id) external view returns (bool);
    // Claim the given amount of the token to the given address if it owns that nft id. Reverts if the inputs are invalid.
    function claim(bytes32[] calldata merkleProof, uint256 id, uint256 amount, address nftAddress) external;

    // Claim the given amount of multiple ids to the given address if it owns that nft ids. Reverts if the inputs are invalid.
    function claimMultiple(bytes32[] calldata _proof,bool[] calldata _proofFlags,uint256[] calldata ids,uint256[] calldata amounts,address[] calldata nftAddresses) external;

    // This event is triggered whenever a call to #claim succeeds.
    event Claimed(uint256 id, uint256 amount, address nftAddress);
    event ClaimedMulti(uint256[] ids, uint256[] amounts,address[] nftAddresses);
}