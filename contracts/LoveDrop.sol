// SPDX-License-Identifier: TBD
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {IERC20, SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {ILoveDrop} from "./interfaces/ILoveDrop.sol";

error AlreadyClaimed();
error InvalidProof();

contract LoveDrop is ILoveDrop,Initializable {
    using SafeERC20 for IERC20;

    //mapping(uint16 => address) public requiredNFTAddresses;
    //immutable is not supported yet on strings
    string public override claimDataIpfs;

    address public override airdropTokenAddress;
    //TODO is there a way it can be immutable when using initialize?
    bytes32 public override merkleRoot;
    //TODO is there a way it can be immutable when using initialize?

    // This is a packed array of booleans per each requiredNftIndex.
    mapping(address => mapping(uint256 => uint256)) private claimedBitMapPerNftIndex;

    // constructor(address _airdropTokenAddress, bytes32 _merkleRoot, string memory _claimDataIpfs) {
    //     airdropTokenAddress = _airdropTokenAddress;
    //     merkleRoot = _merkleRoot;
    //     claimDataIpfs = _claimDataIpfs;
    // }

    function initialize(address _airdropTokenAddress, bytes32 _merkleRoot, string memory _claimDataIpfs) public initializer {
        airdropTokenAddress = _airdropTokenAddress;
        merkleRoot = _merkleRoot;
        claimDataIpfs = _claimDataIpfs;
    }

    function _setClaimed(address nftAddress, uint256 id) private {
        uint256 claimedWordIndex = id / 256;
        uint256 claimedBitIndex = id % 256;
        claimedBitMapPerNftIndex[nftAddress][claimedWordIndex] =
            claimedBitMapPerNftIndex[nftAddress][claimedWordIndex] |
            (1 << claimedBitIndex);
    }

    function isClaimed(
        address nftAddress,
        uint256 id
    ) public view override returns (bool) {
        uint256 claimedWordIndex = id / 256;
        uint256 claimedBitIndex = id % 256;
        uint256 claimedWord = claimedBitMapPerNftIndex[nftAddress][claimedWordIndex];
        uint256 mask = (1 << claimedBitIndex);
        return claimedWord & mask == mask;
    }

    function verifyClaim(
        address nftAddress,
        uint256 id,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) private view {
        if (isClaimed(nftAddress, id)) revert AlreadyClaimed();
        require(
            IERC721(nftAddress).ownerOf(id) == msg.sender,
            "nft isnt owned by claimant"
        ); //msg.sender bad?

        bytes32 leaf = keccak256(
            bytes.concat(keccak256(abi.encode(nftAddress, id, amount)))
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
        address nftAddress
    ) public virtual override {
        verifyClaim(nftAddress, id, amount, merkleProof);

        // Mark it claimed and send the token.
        _setClaimed(nftAddress, id);
        IERC20(airdropTokenAddress).transfer(address(msg.sender), amount);
        emit Claimed(id, amount, nftAddress);
    }

    function _buildLeavesAndTotalAmount(
        uint256[] calldata ids,
        uint256[] calldata amounts,
        address[] calldata nftAddresses
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
            address nftAddress = nftAddresses[index];
            //TODO keep claiming even if 1 fails (idk might be bad for gas though)
            if (isClaimed(nftAddress, id)) revert AlreadyClaimed();

            require(
                IERC721(nftAddress).ownerOf(id) ==
                    msg.sender,
                "one or more of these nfts isnt owned by claimant"
            ); //msg.sender bad?
            _setClaimed(nftAddress, id); //TODO is it save to use id as index? is that gas efficient?
            leaves[index] = keccak256(
                bytes.concat(keccak256(abi.encode(nftAddress, id, amount)))
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
        address[] calldata nftAddresses
    ) public {
        //apparently doing this in a function adds 82 gas :(
        //_buildLeavesAndTotalAmount also checks if msg.sender == ownerOf(id) + isClaimed(id)
        (
            bytes32[] memory leaves,
            uint256 totalAmount
        ) = _buildLeavesAndTotalAmount(ids, amounts, nftAddresses);
        if (
            !MerkleProof.multiProofVerifyCalldata(
                _proof,
                _proofFlags,
                merkleRoot,
                leaves
            )
        ) revert InvalidProof();

        IERC20(airdropTokenAddress).transfer(address(msg.sender), totalAmount);
        emit ClaimedMulti(ids, amounts, nftAddresses);
    }
}
