pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import "../MiladyDrop.sol";
import "./ERC721/MyNft.sol";
import "./ERC20/MyToken.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract MiladyDropTest is Test, ERC721Holder {
    MiladyDrop public miladyDrop;
    MyNft public requiredNft;
    MyToken public airdropToken;

    bytes32[] proof;
    bool[] proofFlags;
    bytes32 root;
    bytes32[] leaves;
    uint256[] ids;
    uint256[] amounts;
    uint256 id;
    uint256 amount;

    uint256[] idsToMint;

    function _setUpMiladyDropWithPreMints(
        uint256[] memory _idsToMint,
        uint256 _amountAirDropTokensToMint,
        address _userAddress
    ) private {
        requiredNft = new MyNft();
        for (uint256 index = 0; index < _idsToMint.length; index++) {
            requiredNft.safeMint(_userAddress, _idsToMint[index]);
        }

        airdropToken = new MyToken();

        miladyDrop = new MiladyDrop(
            address(requiredNft),
            address(airdropToken),
            0xbf7edec2d4ae7cefb9ce8c519015dad8aeca652c17c259cda6e70b3f4ea01c76,
            "0x0"
        );

        airdropToken.mint(address(miladyDrop), _amountAirDropTokensToMint);
    }

    function setUp() public {
        idsToMint = [uint256(1), 2, 3, 4, 5, 6, 7, 8, 9, 10];
        uint256 amountAirDropTokensToMint = 100000000000000000000000000000000;

        _setUpMiladyDropWithPreMints(
            idsToMint,
            amountAirDropTokensToMint,
            address(this)
        );
    }

    function test_claimMultiple_Normal() public {
        //TODO test with very large values
        amounts = [
            2000000000000000000,
            5000000000000000000,
            4000000000000000000
        ];
        ids = [2, 5, 4];
        proof = [
            bytes32(
                0x57f172d024fe6613889d8298e246e33dc681de99b6140c3fa7603823b4bf3ff7
            ),
            bytes32(
                0xbd4585e26dfb462cae29ae2d8fe71517d7b21078f012c2dedb71a7c5aa39ba5d
            ),
            bytes32(
                0xac129e40d624b8bd7d429d7122be8de5dbf70ca2853800b0fdff844dc94f65fa
            )
        ];
        proofFlags = [true, false, false, false, true];
        root = 0xbf7edec2d4ae7cefb9ce8c519015dad8aeca652c17c259cda6e70b3f4ea01c76;

        uint256 totalAmount = 0;
        for (uint256 index = 0; index < amounts.length; index++) {
            totalAmount += amounts[index];
        }
        miladyDrop.claimMultiple(proof, proofFlags, ids, amounts);
        require(
            totalAmount == airdropToken.balanceOf(address(this)),
            "resulting balance is different than totalAmount claimed"
        );

        //test if all set to claimed
        for (uint256 index = 0; index < ids.length; index++) {
            require(
                miladyDrop.isClaimed(ids[index]),
                "one or more ids wasnt set to claimed"
            );
        }
    }

    function test_Revert_claimMultiple_ClaimTwice() public {
        amounts = [
            2000000000000000000,
            5000000000000000000,
            4000000000000000000
        ];
        ids = [2, 5, 4];
        proof = [
            bytes32(
                0x57f172d024fe6613889d8298e246e33dc681de99b6140c3fa7603823b4bf3ff7
            ),
            bytes32(
                0xbd4585e26dfb462cae29ae2d8fe71517d7b21078f012c2dedb71a7c5aa39ba5d
            ),
            bytes32(
                0xac129e40d624b8bd7d429d7122be8de5dbf70ca2853800b0fdff844dc94f65fa
            )
        ];
        proofFlags = [true, false, false, false, true];
        root = 0xbf7edec2d4ae7cefb9ce8c519015dad8aeca652c17c259cda6e70b3f4ea01c76;

        uint256 totalAmount = 0;
        for (uint256 index = 0; index < amounts.length; index++) {
            totalAmount += amounts[index];
        }
        miladyDrop.claimMultiple(proof, proofFlags, ids, amounts);
        vm.expectRevert();
        miladyDrop.claimMultiple(proof, proofFlags, ids, amounts);
    }

    function test_Revert_claimMultiple_ZeroedProof() public {
        
        amounts = [
            2000000000000000000,
            5000000000000000000,
            4000000000000000000
        ];
        ids = [2, 5, 4];
        proof = [bytes32(0x0), bytes32(0x0), bytes32(0x0)];
        proofFlags = [true, false, false, false, true];

        uint256 totalAmount = 0;
        for (uint256 index = 0; index < amounts.length; index++) {
            totalAmount += amounts[index];
        }
        vm.expectRevert();//0x09bde339);
        miladyDrop.claimMultiple(proof, proofFlags, ids, amounts);
    }

    function test_claimMultiple_Single_Claim() public {
        amounts = [
            1000000000000000000
        ];
        ids = [1];
        proof = [
        bytes32(0xa9f3ff0fd6de2a06972f3c7fdf263a702fc088b33777164fc8ab910bd381aab4), 
        bytes32(0xde238ead8cc554db8d8dc4480b080baff348c43aba983fa667d0b6da0f543962), 
        bytes32(0x3e33e1b4e6aca50443bdf5bbf5fdce09ad8fc00ed8ce7636ea72001b96b89ccd)
];
        proofFlags = [ false, false, false ];

        uint256 totalAmount = 0;
        for (uint256 index = 0; index < amounts.length; index++) {
            totalAmount += amounts[index];
        }
        miladyDrop.claimMultiple(proof, proofFlags, ids, amounts);
        require(
            totalAmount == airdropToken.balanceOf(address(this)),
            "resulting balance is different than totalAmount claimed"
        );

        //test if all set to claimed
        for (uint256 index = 0; index < ids.length; index++) {
            require(
                miladyDrop.isClaimed(ids[index]),
                "one or more ids wasnt set to claimed"
            );
        }
    }

    function test_claim_Normal() public {
        amount = 6000000000000000000;
        id = 6;
        proof = [
            bytes32(0x5463d804106c8cca5acf27ebf485b4b55ceb2e62854eaef3a7c5ee3ed22b1af6), 
            bytes32(0xac129e40d624b8bd7d429d7122be8de5dbf70ca2853800b0fdff844dc94f65fa), 
            bytes32(0x3e33e1b4e6aca50443bdf5bbf5fdce09ad8fc00ed8ce7636ea72001b96b89ccd)
        ];
        
        miladyDrop.claim(id, amount, proof);
        require(
            amount == airdropToken.balanceOf(address(this)),
            "resulting balance is different than totalAmount claimed"
        );

        //test if id is set to claimed
        require(miladyDrop.isClaimed(id),"one or more ids wasnt set to claimed");

    }

    function test_Revert_claim_ZeroedProof() public {
        amount = 6000000000000000000;
        id = 6;
        proof = [
            bytes32(0x0), 
            bytes32(0x0), 
            bytes32(0x0)
        ];
        
        vm.expectRevert();
        miladyDrop.claim(id, amount, proof);
    }

    function test_Revert_claim_ClaimTwice() public {
        amount = 6000000000000000000;
        id = 6;
        proof = [
            bytes32(0x5463d804106c8cca5acf27ebf485b4b55ceb2e62854eaef3a7c5ee3ed22b1af6), 
            bytes32(0xac129e40d624b8bd7d429d7122be8de5dbf70ca2853800b0fdff844dc94f65fa), 
            bytes32(0x3e33e1b4e6aca50443bdf5bbf5fdce09ad8fc00ed8ce7636ea72001b96b89ccd)
        ];
        
        miladyDrop.claim(id, amount, proof);
        vm.expectRevert();
        miladyDrop.claim(id, amount, proof);

    }
}
