pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import "../MiladyDrop.sol";
import "./ERC721/MyNft.sol";
import "./ERC20/MyToken.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract MiladyDropTest is Test, ERC721Holder {
    MiladyDrop public miladyDrop;
    MyNft public requiredNft1;
    MyNft public requiredNft2;
    MyToken public airdropToken;

    bytes32[] proof;
    bool[] proofFlags;
    bytes32 root;
    bytes32[] leaves;
    uint256[] ids;
    uint256[] amounts;
    uint256[] nftIndexes;

    uint256 id;
    uint256 amount;
    uint256 nftIndex;

    uint256[] idsToMint;
    address[] requiredNftAddresses;

    function _setUpMiladyDropWithPreMints(
        uint256[] memory _idsToMint,
        uint256 _amountAirDropTokensToMint,
        address _userAddress
    ) private {
        requiredNft1 = new MyNft();
        for (uint256 index = 0; index < _idsToMint.length; index++) {
            requiredNft1.safeMint(_userAddress, _idsToMint[index]);
        }
        requiredNft2 = new MyNft();
        for (uint256 index = 0; index < _idsToMint.length; index++) {
            requiredNft2.safeMint(_userAddress, _idsToMint[index]);
        }

        airdropToken = new MyToken();
        
        requiredNftAddresses =[address(requiredNft1), address(requiredNft2)];
        miladyDrop = new MiladyDrop(
            requiredNftAddresses,
            address(airdropToken),
            0x25a7a8dbe3cb530178fc95c9705bcfe993e3250d4b9981184ba1bba992c534d3,
            "0x0"
        );

        airdropToken.mint(address(miladyDrop), _amountAirDropTokensToMint);
    }

    function setUp() public {
        idsToMint = [uint256(1), 2, 3, 4, 5, 6, 7, 8, 9, 10, 12169697774812703230153278869778437256039855339638969837407632192044393630491];
        uint256 amountAirDropTokensToMint = 11000000000000000000000000000000000000000000000000000000000000000000000000000;

        _setUpMiladyDropWithPreMints(
            idsToMint,
            amountAirDropTokensToMint,
            address(this)
        );
    }

    function test_claimMultiple_Normal() public {
        //TODO test with very large values
        amounts = [4000000000000000000, 2000000000000000000, 5000000000000000000, 6000000000000000000];
        ids = [3, 2, 3, 4];
        nftIndexes = [0, 0, 1, 1];
        proof = [
                bytes32(0x2aae4589212a210002b5c52ef1a8a302ff6a68e0db9c28ebe57738e6ea0e340d), 
                bytes32(0x4745de99a328b2ebae232c20f96567a461050c7faae982ae6fe86ae7b152ef7f), 
                bytes32(0xa07c47999914533524b061ea33d8d650b5c240ce14f38b2868b31bc63fb252ee), 
                bytes32(0x79ea2690f3de51ccf35b1147779a6155f0a310af09f47244bb690b43765ff46d)
        ];
        proofFlags = [false, false, false, true, false, true, true];

        uint256 totalAmount = 0;
        for (uint256 index = 0; index < amounts.length; index++) {
            totalAmount += amounts[index];
        }

        //claim
        miladyDrop.claimMultiple(proof, proofFlags, ids, amounts, nftIndexes);
        require(
            totalAmount == airdropToken.balanceOf(address(this)),
            "resulting balance is different than totalAmount claimed"
        );

        //test if all set to claimed
        for (uint256 index = 0; index < ids.length; index++) {
            require(
                miladyDrop.isClaimed(nftIndexes[index], ids[index]),
                "one or more ids wasnt set to claimed"
            );
        }
    }

    function test_Revert_claimMultiple_ClaimTwice() public {
        amounts = [4000000000000000000, 2000000000000000000, 5000000000000000000, 6000000000000000000];
        ids = [3, 2, 3, 4];
        nftIndexes = [0, 0, 1, 1];
        proof = [
                bytes32(0x2aae4589212a210002b5c52ef1a8a302ff6a68e0db9c28ebe57738e6ea0e340d), 
                bytes32(0x4745de99a328b2ebae232c20f96567a461050c7faae982ae6fe86ae7b152ef7f), 
                bytes32(0xa07c47999914533524b061ea33d8d650b5c240ce14f38b2868b31bc63fb252ee), 
                bytes32(0x79ea2690f3de51ccf35b1147779a6155f0a310af09f47244bb690b43765ff46d)

        ];
        proofFlags = [false, false, false, true, false, true, true];

        uint256 totalAmount = 0;
        for (uint256 index = 0; index < amounts.length; index++) {
            totalAmount += amounts[index];
        }

        //claim
        miladyDrop.claimMultiple(proof, proofFlags, ids, amounts, nftIndexes);
        vm.expectRevert();
        miladyDrop.claimMultiple(proof, proofFlags, ids, amounts, nftIndexes);
    }

    function test_Revert_claimMultiple_ZeroedProof() public {
        amounts = [4000000000000000000, 2000000000000000000, 5000000000000000000, 6000000000000000000];
        ids = [3, 2, 3, 4];
        nftIndexes = [0, 0, 1, 1];
        proof = [
                bytes32(0x0), 
                bytes32(0x0), 
                bytes32(0x0), 
                bytes32(0x0)

        ];
        proofFlags = [false, false, false, true, false, true, true];

        uint256 totalAmount = 0;
        for (uint256 index = 0; index < amounts.length; index++) {
            totalAmount += amounts[index];
        }

        //claim
        vm.expectRevert();
        miladyDrop.claimMultiple(proof, proofFlags, ids, amounts, nftIndexes);
    }

    function test_claimMultiple_Single_Claim() public {
        amounts = [2000000000000000000];
        ids = [2];
        nftIndexes = [0];
        proof = [
                bytes32(0x4745de99a328b2ebae232c20f96567a461050c7faae982ae6fe86ae7b152ef7f), 
                bytes32(0x79ea2690f3de51ccf35b1147779a6155f0a310af09f47244bb690b43765ff46d), 
                bytes32(0xc7c0845a7e20c05cd7664cfa888ff16b08a5d224e1409d41d78fd18124ccc1a3)

        ];
        proofFlags = [false, false, false];

        uint256 totalAmount = 0;
        for (uint256 index = 0; index < amounts.length; index++) {
            totalAmount += amounts[index];
        }
        miladyDrop.claimMultiple(proof, proofFlags, ids, amounts, nftIndexes);
        require(
            totalAmount == airdropToken.balanceOf(address(this)),
            "resulting balance is different than totalAmount claimed"
        );

        //test if all set to claimed
        for (uint256 index = 0; index < ids.length; index++) {
            require(
                miladyDrop.isClaimed(nftIndexes[index],ids[index]),
                "one or more ids wasnt set to claimed"
            );
        }
    }

    function test_claim_Normal() public {
        amount = 2000000000000000000;
        id = 2;
        nftIndex = 0;

        proof = [
                bytes32(0x4745de99a328b2ebae232c20f96567a461050c7faae982ae6fe86ae7b152ef7f), 
                bytes32(0x79ea2690f3de51ccf35b1147779a6155f0a310af09f47244bb690b43765ff46d), 
                bytes32(0xc7c0845a7e20c05cd7664cfa888ff16b08a5d224e1409d41d78fd18124ccc1a3)

        ];
        
        miladyDrop.claim(nftIndex, id, amount, proof);
        require(
            amount == airdropToken.balanceOf(address(this)),
            "resulting balance is different than totalAmount claimed"
        );

        //test if id is set to claimed
        require(miladyDrop.isClaimed(nftIndex, id),"one or more ids wasnt set to claimed");

    }

    function test_Revert_claim_ZeroedProof() public {
        amount = 2000000000000000000;
        id = 2;
        nftIndex = 0;

        proof = [
            bytes32(0x0), 
            bytes32(0x0), 
            bytes32(0x0)
        ];
        
        vm.expectRevert();
        miladyDrop.claim(nftIndex, id, amount, proof);
    }

    function test_Revert_claim_ClaimTwice() public {
        amount = 2000000000000000000;
        id = 2;
        nftIndex = 0;

        proof = [
                bytes32(0x4745de99a328b2ebae232c20f96567a461050c7faae982ae6fe86ae7b152ef7f), 
                bytes32(0x79ea2690f3de51ccf35b1147779a6155f0a310af09f47244bb690b43765ff46d), 
                bytes32(0xc7c0845a7e20c05cd7664cfa888ff16b08a5d224e1409d41d78fd18124ccc1a3)

        ];
        miladyDrop.claim(nftIndex, id, amount, proof);
        vm.expectRevert();
        miladyDrop.claim(nftIndex, id, amount, proof);

    }

    function test_claimMultiple_LargeValues() public {
        amounts = [1000000000000000000000000000, 2000000000000000000, 10000000000000000000000000000000000000000000000000000000000000000000000000000, 1000000000000000000];
        ids = [12169697774812703230153278869778437256039855339638969837407632192044393630491, 2, 12169697774812703230153278869778437256039855339638969837407632192044393630491, 1];
        nftIndexes = [0, 0, 1, 0];
        proof = [
                bytes32(0x2dc439c4d96bd768e24e1db4ced39b3908bf43ee18d8e3423d0fb063dd7ee50d), 
                bytes32(0xb3cebfc8728e296007f195fdd3224942ca4eb1d65fb33959fbb4b4232da5e192), 
                bytes32(0xb4cb88bc85a81a03451a097805ff0fea473ea74e2477f57191198b53a78317eb), 
                bytes32(0x79ea2690f3de51ccf35b1147779a6155f0a310af09f47244bb690b43765ff46d)

        ];
        proofFlags = [false, true, false, false, false, true, true];


        uint256 totalAmount = 0;
        for (uint256 index = 0; index < amounts.length; index++) {
            totalAmount += amounts[index];
        }
        
        //claim
        miladyDrop.claimMultiple(proof, proofFlags, ids, amounts, nftIndexes);
        require(
            totalAmount == airdropToken.balanceOf(address(this)),
            "resulting balance is different than totalAmount claimed"
        );

        //test if all set to claimed
        for (uint256 index = 0; index < ids.length; index++) {
            require(
                miladyDrop.isClaimed(nftIndexes[index], ids[index]),
                "one or more ids wasnt set to claimed"
            );
        }
    }
}
