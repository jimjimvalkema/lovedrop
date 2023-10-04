// SPDX-License-Identifier: TBD
pragma solidity >=0.8.0;

import "forge-std/console.sol";

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {IERC20, SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {IMiladyDrop} from "./interfaces/IMiladyDrop.sol";

error AlreadyClaimed();
error InvalidProof();

contract MiladyDrop is IMiladyDrop,Initializable {
    using SafeERC20 for IERC20;

    mapping(uint16 => address) public requiredNFTAddresses;
    //immutable is not supported yet on strings
    string public override claimDataIpfs;

    address public override airdropTokenAddress;
    //TODO is there a way it can be immutable when using initialize?
    bytes32 public override merkleRoot;
    //TODO is there a way it can be immutable when using initialize?

    // This is a packed array of booleans per each requiredNftIndex.
    mapping(uint16 => mapping(uint256 => uint256)) private claimedBitMapPerNftIndex;

    // constructor(address[] memory _requiredNFTAddresses, address _airdropTokenAddress, bytes32 _merkleRoot, string memory _claimDataIpfs) {
    //     _setRequiredNFTAddresses(_requiredNFTAddresses);
    //     airdropTokenAddress = _airdropTokenAddress;
    //     merkleRoot = _merkleRoot;
    //     claimDataIpfs = _claimDataIpfs;
    // }

    function initialize(address[] memory _requiredNFTAddresses, address _airdropTokenAddress, bytes32 _merkleRoot, string memory _claimDataIpfs) public initializer {
        require(_requiredNFTAddresses.length <65534, "too many requiredNFTAddresses, nftIndex would overflow");
        //approx 1148 nfts addresses can be set before hitting the block gas limit (30000000 gas)
        _setRequiredNFTAddresses(_requiredNFTAddresses);
        airdropTokenAddress = _airdropTokenAddress;
        merkleRoot = _merkleRoot;
        claimDataIpfs = _claimDataIpfs;
    }

    function _setRequiredNFTAddresses (
        address[] memory _requiredNFTAddresses
    ) private onlyInitializing {
        for (uint16 index = 0; index < _requiredNFTAddresses.length; index++) {
            requiredNFTAddresses[index] = _requiredNFTAddresses[index];
        }
    }

    function _setClaimed(uint16 nftIndex, uint256 id) private {
        uint256 claimedWordIndex = id / 256;
        uint256 claimedBitIndex = id % 256;
        claimedBitMapPerNftIndex[nftIndex][claimedWordIndex] =
            claimedBitMapPerNftIndex[nftIndex][claimedWordIndex] |
            (1 << claimedBitIndex);
    }

    function isClaimed(
        uint16 nftIndex,
        uint256 id
    ) public view override returns (bool) {
        uint256 claimedWordIndex = id / 256;
        uint256 claimedBitIndex = id % 256;
        uint256 claimedWord = claimedBitMapPerNftIndex[nftIndex][claimedWordIndex];
        uint256 mask = (1 << claimedBitIndex);
        return claimedWord & mask == mask;
    }

    function verifyClaim(
        uint16 nftIndex,
        uint256 id,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) private view {
        if (isClaimed(nftIndex, id)) revert AlreadyClaimed();
        require(
            IERC721(requiredNFTAddresses[nftIndex]).ownerOf(id) == msg.sender,
            "nft isnt owned by claimant"
        ); //msg.sender bad?

        bytes32 leaf = keccak256(
            bytes.concat(keccak256(abi.encode(nftIndex, id, amount)))
        );
        require(
            MerkleProof.verifyCalldata(merkleProof, merkleRoot, leaf),
            "Invalid proof"
        );
    }

    //proof, id, amount, nftIndex
    function claim(
        bytes32[] calldata merkleProof,
        uint256 id,
        uint256 amount,
        uint16 nftIndex
    ) public virtual override {
        verifyClaim(nftIndex, id, amount, merkleProof);

        // Mark it claimed and send the token.
        _setClaimed(nftIndex, id);
        IERC20(airdropTokenAddress).transfer(address(msg.sender), amount);
        emit Claimed(id, amount, nftIndex);
    }

    function _buildLeavesAndTotalAmount(
        uint256[] calldata ids,
        uint256[] calldata amounts,
        uint16[] calldata nftIndexes
    ) private returns (bytes32[] memory, uint256) {
        uint256 idsLenght = ids.length;
        //not strictly necessary since it would just fail later with amounts going out of bounds
        //but this is safer and saves gas on a edge case if it fails here
        require(
            idsLenght == amounts.length,
            "length of ids and amounts array is not the same"
        );
        uint256 totalAmount = 0;
        bytes32[] memory leaves = new bytes32[](idsLenght);

        for (uint256 index = 0; index < idsLenght; index++) {
            uint256 amount = amounts[index];
            uint256 id = ids[index];
            uint16 nftIndex = nftIndexes[index];
            //TODO keep claiming even if 1 fails (idk might be bad for gas though)
            if (isClaimed(nftIndex, id)) revert AlreadyClaimed();

            require(
                IERC721(requiredNFTAddresses[nftIndex]).ownerOf(id) ==
                    msg.sender,
                "one or more of these nfts isnt owned by claimant"
            ); //msg.sender bad?
            _setClaimed(nftIndex, id); //TODO is it save to use id as index? is that gas efficient?
            leaves[index] = keccak256(
                bytes.concat(keccak256(abi.encode(nftIndex, id, amount)))
            );
            //TODO prevent overflow. if thats neccesarry? cant the ui prevent it since noone should want to make a airdrop that is larger then the overflow value?
            totalAmount += amount;
        }

        return (leaves, totalAmount);
    }

    //TODO maybe passing a struct with ids, amounts, nftIndexes is more efficient
    //the arrays are dynamicly sized so i doubt it :(
    function claimMultiple(
        bytes32[] calldata _proof,
        bool[] calldata _proofFlags,
        uint256[] calldata ids,
        uint256[] calldata amounts,
        uint16[] calldata nftIndexes
    ) public {
        //apparently doing this in a function adds 82 gas :(
        //_buildLeavesAndTotalAmount also checks if msg.sender == ownerOf(id) + isClaimed(id)
        (
            bytes32[] memory leaves,
            uint256 totalAmount
        ) = _buildLeavesAndTotalAmount(ids, amounts, nftIndexes);
        if (
            !MerkleProof.multiProofVerifyCalldata(
                _proof,
                _proofFlags,
                merkleRoot,
                leaves
            )
        ) revert InvalidProof();

        IERC20(airdropTokenAddress).transfer(address(msg.sender), totalAmount);
        emit ClaimedMulti(ids, amounts, nftIndexes);
    }
}
