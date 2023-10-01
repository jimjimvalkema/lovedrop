pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import "../MiladyDrop.sol";
import "./ERC721/MyNft.sol";
import "./ERC20/MyToken.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract MiladyDropTest is  Test, ERC721Holder {
    MiladyDrop public miladyDrop;
    MyNft public requiredNft;
    MyToken public airdropToken;

    bytes32[] proof;
    bool[] proofFlags;
    bytes32 root;
    bytes32[] leaves;
    uint256[] ids;
    uint256[] amounts;
    uint256 totalSizeAirdrop;

    function setUp() public {
        totalSizeAirdrop= 100000000000000000000000000000000;
        amounts = [2000000000000000000, 5000000000000000000, 4000000000000000000];
        ids = [2, 5, 4];
        proof = [
            bytes32(0x57f172d024fe6613889d8298e246e33dc681de99b6140c3fa7603823b4bf3ff7), 
            bytes32(0xbd4585e26dfb462cae29ae2d8fe71517d7b21078f012c2dedb71a7c5aa39ba5d), 
            bytes32(0xac129e40d624b8bd7d429d7122be8de5dbf70ca2853800b0fdff844dc94f65fa)
        ];
        proofFlags = [ true, false, false, false, true ];  
        root = 0xbf7edec2d4ae7cefb9ce8c519015dad8aeca652c17c259cda6e70b3f4ea01c76;

        requiredNft = new MyNft();
        for (uint256 index = 0; index < ids.length; index++) {
            requiredNft.safeMint(address(this), ids[index]);
            console.logAddress(requiredNft.ownerOf(ids[index]));
        }

        airdropToken = new MyToken();

        miladyDrop = new MiladyDrop(
            address(requiredNft),
            address(airdropToken),
            0xfa265bb9d859d9413f1b0c039e48f23f7c2a14acca6484e29cfaa259a7f3a4d3,
            "0x0"
        );

        airdropToken.mint(address(miladyDrop), totalSizeAirdrop);
    }

    function test_claimMultiple() public {
        uint256 totalAmount=0;
        for (uint256 index = 0; index < amounts.length; index++) {
            totalAmount += amounts[index];
        }
        require(miladyDrop.claimMultiple(proof, proofFlags, root, ids, amounts), "failed to multiClaim");
        require(totalAmount == airdropToken.balanceOf(address(this)), "resulting balance is different than totalAmount claimed");

    }

}
