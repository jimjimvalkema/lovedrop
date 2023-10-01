// SPDX-License-Identifier: TBD
pragma solidity >=0.8.0;

import "forge-std/console.sol";

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC20, SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {IMiladyDrop} from "./interfaces/IMiladyDrop.sol";


error AlreadyClaimed();
error InvalidProof();

contract MiladyDrop is IMiladyDrop {
    using SafeERC20 for IERC20;

    address public immutable override requiredNFTAddress;
    address public immutable override airdropTokenAddress;
    //immutable is not supported yet on strings
    string public override claimDataIpfs; //TODO do with bytes32: https://docs.ipfs.tech/concepts/content-addressing/#cid-conversion

    //bytes32 public immutable override merkleRoot;
    bytes32 public immutable override merkleRoot;

    // This is a packed array of booleans.
    mapping(uint256 => uint256) private claimedBitMap;

    constructor(address _requiredNFTAddress, address _airdropTokenAddress, bytes32 _merkleRoot, string memory _claimDataIpfs) {
        merkleRoot = _merkleRoot;

        //store addresses for easier acces
        requiredNFTAddress = _requiredNFTAddress;
        airdropTokenAddress = _airdropTokenAddress;
        claimDataIpfs = _claimDataIpfs;
        }

    function isClaimed(uint256 index) public view override returns (bool) {
        uint256 claimedWordIndex = index / 256;
        uint256 claimedBitIndex = index % 256;
        uint256 claimedWord = claimedBitMap[claimedWordIndex];
        uint256 mask = (1 << claimedBitIndex);
        return claimedWord & mask == mask;
    }

    function _setClaimed(uint256 index) private {
        uint256 claimedWordIndex = index / 256;
        uint256 claimedBitIndex = index % 256;
        claimedBitMap[claimedWordIndex] = claimedBitMap[claimedWordIndex] | (1 << claimedBitIndex);
    }

    function verifyClaim(uint256 id, uint256 amount, bytes32[] calldata merkleProof) private view {
        if (isClaimed(id)) revert AlreadyClaimed();
        require(IERC721(requiredNFTAddress).ownerOf(id) == msg.sender,"nft isnt owned by claimant"); //msg.sender bad?

        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(id, amount))));
        require(MerkleProof.verifyCalldata(merkleProof, merkleRoot, leaf), "Invalid proof");
    }

    function claim(uint256 id, uint256 amount, bytes32[] calldata merkleProof)
        public
        virtual
        override
    {
        verifyClaim(id, amount, merkleProof);

        // Mark it claimed and send the token.
        _setClaimed(id);
        IERC20(airdropTokenAddress).transfer(address(msg.sender), amount);
        emit Claimed(id, amount);
    }

    function _buildLeavesAndTotalAmount(uint256[] calldata ids, uint256[] calldata amounts ) private returns (bytes32[] memory, uint256) {
        uint256 idsLenght = ids.length;
        //not strictly necessary since it would just fail later with amounts going out of bounds
        //but this is safer and saves gas on a edge case if it fails here
        require(idsLenght==amounts.length, "length of ids and amounts array is not the same");
        uint256 totalAmount = 0;
        bytes32[] memory leaves = new bytes32[](idsLenght);
        
        for (uint256 index = 0; index < idsLenght; index++) {
            uint256 amount = amounts[index];
            uint256 id = ids[index];
            //TODO keep claiming even if 1 fails (idk might be bad for gas though)
            if (isClaimed(id)) revert AlreadyClaimed();

            require(IERC721(requiredNFTAddress).ownerOf(id) == msg.sender, "one or more of these nfts isnt owned by claimant"); //msg.sender bad?
            _setClaimed(id); //TODO is it save to use id as index? is that gas efficient? 
            leaves[index] = keccak256(bytes.concat(keccak256(abi.encode(id,amount))));
            //TODO prevent overflow. if thats neccesarry? cant the ui prevent it since noone should want to make a airdrop that is larger then the overflow value?
            totalAmount += amount;
        }

        return (leaves, totalAmount);
        
    }

    function claimMultiple(
        bytes32[] calldata _proof,
        bool[] calldata _proofFlags,
        uint256[] calldata ids,
        uint256[] calldata amounts  
    ) public {
        //apparently doing this in a function adds 82 gas :(
        //_buildLeavesAndTotalAmount also checks if msg.sender == ownerOf(id) + isClaimed(id)
        (bytes32[] memory leaves, uint256 totalAmount) = _buildLeavesAndTotalAmount(ids, amounts);
        if (!MerkleProof.multiProofVerifyCalldata(_proof, _proofFlags, merkleRoot, leaves)) revert InvalidProof();

        IERC20(airdropTokenAddress).transfer(address(msg.sender), totalAmount);
        emit ClaimedMulti(ids, amounts);
    }
}