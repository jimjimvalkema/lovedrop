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

    address public requiredNFTAddress;
    address public airdropTokenAddress;
    string public claimDataIpfs; //TODO do with bytes32: https://docs.ipfs.tech/concepts/content-addressing/#cid-conversion

    //bytes32 public immutable override merkleRoot;
    bytes32 public immutable merkleRoot;

    // This is a packed array of booleans.
    mapping(uint256 => uint256) private claimedBitMap;

    struct ClaimData {
        uint256 index;
        uint256 id;
        uint256 amount;
        bytes32[] merkleProof;
    }    


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

    function verifyClaim(uint256 index, uint256 id, uint256 amount, bytes32[] calldata merkleProof) private view {
        if (isClaimed(index)) revert AlreadyClaimed();
        require(IERC721(requiredNFTAddress).ownerOf(id) == msg.sender, "you dont own one or more of these nfts"); //msg.sender bad?

        // Verify the merkle proof.
        bytes32 node = keccak256(abi.encodePacked(index, id, amount));
        if (!MerkleProof.verify(merkleProof, merkleRoot, node)) revert InvalidProof();
    }

    function claim(uint256 index, uint256 id, uint256 amount, bytes32[] calldata merkleProof)
        public
        virtual
        override
    {
        verifyClaim(index, id, amount, merkleProof);

        // Mark it claimed and send the token.
        _setClaimed(index);
        //IERC20(airdropTokenAddress).safeTransfer(account, amount);
        IERC20(airdropTokenAddress).transfer(address(msg.sender), amount);

        emit Claimed(index, id, amount);
    }

    function claimMultiple(
        bytes32[] calldata _proof,
        bool[] calldata _proofFlags,
        bytes32 _root,
        uint256[] calldata ids,
        uint256[] calldata amounts  
    ) public virtual returns (bool) {
        uint256 idsLenght =  ids.length;
        uint256 totalAmount = 0;
        bytes32[] memory leaves = new bytes32[](idsLenght);
        
        for (uint256 index = 0; index < idsLenght; index++) {
            uint256 amount = amounts[index];
            uint256 id = ids[index];
            //TODO keep claiming even if 1 fails (idk might be bad for gas though)
            if (isClaimed(id)) revert AlreadyClaimed();

            require(IERC721(requiredNFTAddress).ownerOf(id) == msg.sender, "you dont own one or more of these nfts"); //msg.sender bad?
            _setClaimed(id); //TODO is it save to use id as index? is that gas efficient? 
            leaves[index] = keccak256(
                bytes.concat(keccak256(abi.encode(id,amount)))
            );
            //TODO prevent overflow. if thats neccesarry? cant the ui prevent it since noone should want to make a airdrop that is larger then the overflow value?
            totalAmount += amount;
        }
        IERC20(airdropTokenAddress).transfer(address(msg.sender), totalAmount);

        return MerkleProof.multiProofVerifyCalldata(_proof, _proofFlags, _root, leaves);
    }
}