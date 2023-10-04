// SPDX-License-Identifier: UNKNOWN 
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import "../MiladyDrop.sol";
import "../MiladyDropFactory.sol";

import "./ERC721/MyNft.sol";
import "./ERC20/MyToken.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract MiladyDropFactoryTest is Test, ERC721Holder {
    MiladyDrop public miladyDrop;

    MyToken public airdropToken;

    bytes32[] proof;
    bytes32[] multiProof;
    bool[] proofFlags;
    bytes32 root;
    bytes32[] leaves;
    uint256[] ids;
    uint256[] amounts;
    address[] nftAddresses;

    uint256 id;
    uint256 amount;
    address nftAddress;

    uint256[] idsToMint;
    uint256 amountAirDropTokensToMint;
    uint256 amountOfCollections;

    MiladyDropFactory miladyDropFactory;
    address[] requiredNftAddressesGlobal;
    string claimDataIpfs;
    bytes32 merkleRoot;

    MiladyDrop miladyDropGlobalDeployment;


    function preMintNfts(
        uint256[] memory _idsToMint,
        address _userAddress,
        uint256 _amountOfCollections
    ) private returns(address[] memory) {
        address[] memory _requiredNftAddresses = new address[](_amountOfCollections);
        for (uint256 i = 0; i < _amountOfCollections; i++) {
            MyNft _requiredNft = new MyNft();
            // console.logString("created new nft with address:");
            // console.logAddress(address(_requiredNft));
            _requiredNftAddresses[i] = address(_requiredNft); 
            for (uint256 j = 0; j < _idsToMint.length; j++) {
                _requiredNft.safeMint(_userAddress, _idsToMint[j]);
            }
        }
        return (_requiredNftAddresses);

    }

    function setUp() public {
        idsToMint = [uint256(1), 2, 3, 4, 5, 6, 7, 8, 9, 10, 12169697774812703230153278869778437256039855339638969837407632192044393630491];
        amountAirDropTokensToMint = 11000000000000000000000000000000000000000000000000000000000000000000000000000;
        airdropToken = new MyToken();
        miladyDropFactory = new MiladyDropFactory();
        amountOfCollections = 2;
        requiredNftAddressesGlobal = preMintNfts(idsToMint, address(this), amountOfCollections);
        claimDataIpfs = "";
        merkleRoot = 0xb8d5e0df2c356b4dea07216d951ad8ab428733d222163c7bbcab781b21cc2f04;
        miladyDropGlobalDeployment = _deployFromFactory();  
        airdropToken.mint(address(miladyDropGlobalDeployment), amountAirDropTokensToMint);

        
        
        
        amounts = [5000000000000000000, 2000000000000000000, 6000000000000000000, 4000000000000000000];
        ids = [3, 2, 4, 3];
        nftAddresses = [
                address(0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9), 
                address(0xF62849F9A0B5Bf2913b396098F7c7019b51A820a), 
                address(0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9), 
                address(0xF62849F9A0B5Bf2913b396098F7c7019b51A820a)];
        multiProof = [
                bytes32(0x1e2b4a413e27f5f1b889257844a9124e74880674b6e2c4f86211fd03d55695af), 
                bytes32(0xce2bc8b63c9fcb7b3dd7b330de3c6be73bd69ca1a0c90cb21b18fc5539cd8977), 
                bytes32(0x7466462bde889ddf0c02b4fa5b036b4f259e1b79fa07b7e641515ba5b6907fb8)

        ];
        proofFlags = [false, true, true, false, false, true];

        amount = 2000000000000000000;
        id = 2;
        nftAddress = 0xF62849F9A0B5Bf2913b396098F7c7019b51A820a;

        proof = [
                bytes32(0x418d6562379a37fcbd09ed87c9adaf49e7f08cce1bdec6a54098899e4832d67c), 
                bytes32(0xce2bc8b63c9fcb7b3dd7b330de3c6be73bd69ca1a0c90cb21b18fc5539cd8977), 
                bytes32(0x168376b4f437f2dbb969bd315b7865f7f1e1c9d33c02ff1151f922d5c16f6dbe)

        ];


    }

    function _deployFromFactory() private returns (MiladyDrop) {
        vm.recordLogs();
        miladyDropFactory.createNewDrop(address(airdropToken), merkleRoot, claimDataIpfs);  
        Vm.Log[] memory entries = vm.getRecordedLogs();
        address _deployedDropAddres = abi.decode(entries[1].data, (address));
        //possibly add more test to verify that all variables are set
        return MiladyDrop(_deployedDropAddres);
    }

    function test_createNewDrop_Normal() public {   
        MiladyDrop deployedMiladyDrop = _deployFromFactory();  
        require(deployedMiladyDrop.merkleRoot() == merkleRoot);
    }

    function test_claim_GasTest() public {
        //after 614624
        //proof
        //claim
        miladyDropGlobalDeployment.claim(proof, id, amount, nftAddress);
    }

    function test_claimMultiple_GasTest_4_claims() public {
        //gas pre proxy: 606838
        //after 614624
        //proof
        //claim
        miladyDropGlobalDeployment.claimMultiple(multiProof, proofFlags, ids, amounts, nftAddresses);
    }
    

    function test_claimMultiple() public {
        //gas pre proxy: 606838
        //after 614624
        //proof
        amounts = [5000000000000000000, 2000000000000000000, 6000000000000000000, 4000000000000000000];
        ids = [3, 2, 4, 3];
        nftAddresses = [
                address(0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9), 
                address(0xF62849F9A0B5Bf2913b396098F7c7019b51A820a), 
                address(0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9), 
                address(0xF62849F9A0B5Bf2913b396098F7c7019b51A820a)];
        multiProof = [
                bytes32(0x1e2b4a413e27f5f1b889257844a9124e74880674b6e2c4f86211fd03d55695af), 
                bytes32(0xce2bc8b63c9fcb7b3dd7b330de3c6be73bd69ca1a0c90cb21b18fc5539cd8977), 
                bytes32(0x7466462bde889ddf0c02b4fa5b036b4f259e1b79fa07b7e641515ba5b6907fb8)

        ];
        proofFlags = [false, true, true, false, false, true];
        

        //track expected amount that will be claimed
        uint256 totalAmount = 0;
        for (uint256 index = 0; index < amounts.length; index++) {
            totalAmount += amounts[index];
        }

        //claim
        miladyDropGlobalDeployment.claimMultiple(multiProof, proofFlags, ids, amounts, nftAddresses);

        //test correct amount recieved
        require(
            totalAmount == airdropToken.balanceOf(address(this)),
            "resulting balance is different than totalAmount claimed"
        );

        //test if all set to claimed
        for (uint256 index = 0; index < ids.length; index++) {
            require(
                miladyDropGlobalDeployment.isClaimed(nftAddresses[index], ids[index]),
                "one or more ids wasnt set to claimed"
            );
        }
    }

    function test_claim() public {
        //after 614624
        //proof
        amount = 2000000000000000000;
        id = 2;
        nftAddress = 0xF62849F9A0B5Bf2913b396098F7c7019b51A820a;

        proof = [
                bytes32(0x418d6562379a37fcbd09ed87c9adaf49e7f08cce1bdec6a54098899e4832d67c), 
                bytes32(0xce2bc8b63c9fcb7b3dd7b330de3c6be73bd69ca1a0c90cb21b18fc5539cd8977), 
                bytes32(0x168376b4f437f2dbb969bd315b7865f7f1e1c9d33c02ff1151f922d5c16f6dbe)

        ];
        //claim
        miladyDropGlobalDeployment.claim(proof, id, amount, nftAddress);

        //test correct amount recieved
        require(
            amount == airdropToken.balanceOf(address(this)),
            "resulting balance is different than totalAmount claimed"
        );

        //test if its set to claimed
        require(
            miladyDropGlobalDeployment.isClaimed(nftAddress, id),
            "one or more ids wasnt set to claimed"
        );
    }

    function test_claimTestTwoDeployments() public {
        MiladyDrop deployedMiladyDrop1 = _deployFromFactory();
        MiladyDrop deployedMiladyDrop2 = _deployFromFactory();
        airdropToken.mint(address(deployedMiladyDrop1), amountAirDropTokensToMint);
        airdropToken.mint(address(deployedMiladyDrop2), amountAirDropTokensToMint);
        //gas pre proxy: 606838
        //after 614624
        //proof
        uint256 totalAmount = amount;
        //claim
        deployedMiladyDrop1.claim(proof, id, amount, nftAddress);

        //test correct amount recieved
        require(
            totalAmount == airdropToken.balanceOf(address(this)),
            "resulting balance is different than totalAmount claimed"
        );

        //test if its set to claimed
        require(
            deployedMiladyDrop1.isClaimed(nftAddress, id),
            "one or more ids wasnt set to claimed"
        );

        //claiming a second time with the same token so totalAmount should double
        totalAmount += totalAmount;

        //claim2
        deployedMiladyDrop2.claim(proof, id, amount, nftAddress);

        //test correct amount recieved
        require(
            totalAmount == airdropToken.balanceOf(address(this)),
            "resulting balance is different than totalAmount claimed"
        );

        //test if its set to claimed
        require(
            deployedMiladyDrop2.isClaimed(nftAddress, id),
            "one or more ids wasnt set to claimed"
        );
    }

    function test_claimMultipleTwoDeployments() public {
        MiladyDrop deployedMiladyDrop1 = _deployFromFactory();
        MiladyDrop deployedMiladyDrop2 = _deployFromFactory();
        airdropToken.mint(address(deployedMiladyDrop1), amountAirDropTokensToMint);
        airdropToken.mint(address(deployedMiladyDrop2), amountAirDropTokensToMint);
        //gas pre proxy: 606838
        //after 614624
        //proof
        //track expected amount that will be claimed
        uint256 totalAmount = 0;
        for (uint256 index = 0; index < amounts.length; index++) {
            totalAmount += amounts[index];
        }

        //claim
        deployedMiladyDrop1.claimMultiple(multiProof, proofFlags, ids, amounts, nftAddresses);

        //test correct amount recieved
        require(
            totalAmount == airdropToken.balanceOf(address(this)),
            "resulting balance is different than totalAmount claimed"
        );

        //test if all set to claimed
        for (uint256 index = 0; index < ids.length; index++) {
            require(
                deployedMiladyDrop1.isClaimed(nftAddresses[index], ids[index]),
                "one or more ids wasnt set to claimed"
            );
        }

        //claiming a second time with the same token so totalAmount should double
        totalAmount +=totalAmount;
        //claim2
        deployedMiladyDrop2.claimMultiple(multiProof, proofFlags, ids, amounts, nftAddresses);

        //test correct amount recieved
        require(
            totalAmount == airdropToken.balanceOf(address(this)),
            "resulting balance is different than totalAmount claimed"
        );

        //test if all set to claimed
        for (uint256 index = 0; index < ids.length; index++) {
            require(
                deployedMiladyDrop2.isClaimed(nftAddresses[index], ids[index]),
                "one or more ids wasnt set to claimed"
            );
        }
    }

        function test_claimMultiple_LargeValues() public {
        amounts = [10000000000000000000000000000000000000000000000000000000000000000000000000000, 2000000000000000000, 1000000000000000000000000000, 1000000000000000000];
        ids = [12169697774812703230153278869778437256039855339638969837407632192044393630491, 2, 12169697774812703230153278869778437256039855339638969837407632192044393630491, 1];
        nftAddresses = [
                address(0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9), 
                address(0xF62849F9A0B5Bf2913b396098F7c7019b51A820a), 
                address(0xF62849F9A0B5Bf2913b396098F7c7019b51A820a), 
                address(0xF62849F9A0B5Bf2913b396098F7c7019b51A820a)];
        multiProof = [
                bytes32(0x1a6a298d22e295c119e0b64829ce8afca12cedd7e508e43e7b0cec46cea02e51), 
                bytes32(0x418d6562379a37fcbd09ed87c9adaf49e7f08cce1bdec6a54098899e4832d67c), 
                bytes32(0xd9c9e27ac7b09b98ce03617a0b5c34772a8eb23105e7fda1d9b517cd92abdd50), 
                bytes32(0x7466462bde889ddf0c02b4fa5b036b4f259e1b79fa07b7e641515ba5b6907fb8)

        ];
        proofFlags = [false, false, true, false, true, false, true];


        uint256 totalAmount = 0;
        for (uint256 index = 0; index < amounts.length; index++) {
            totalAmount += amounts[index];
        }
        
        //claim
        miladyDropGlobalDeployment.claimMultiple(multiProof, proofFlags, ids, amounts, nftAddresses);
        require(
            totalAmount == airdropToken.balanceOf(address(this)),
            "resulting balance is different than totalAmount claimed"
        );

        //test if all set to claimed
        for (uint256 index = 0; index < ids.length; index++) {
            require(
                miladyDropGlobalDeployment.isClaimed(nftAddresses[index], ids[index]),
                "one or more ids wasnt set to claimed"
            );
        }
    }

    function test_Revert_claim_ClaimTwice() public {
        miladyDropGlobalDeployment.claim(proof, id, amount, nftAddress);
        vm.expectRevert();
        miladyDropGlobalDeployment.claim(proof, id, amount, nftAddress);

    }

    function test_Revert_claimMultiple_ClaimTwice() public {
        uint256 totalAmount = 0;
        for (uint256 index = 0; index < amounts.length; index++) {
            totalAmount += amounts[index];
        }

        //claim
        miladyDropGlobalDeployment.claimMultiple(multiProof, proofFlags, ids, amounts, nftAddresses);
        vm.expectRevert();
        miladyDropGlobalDeployment.claimMultiple(multiProof, proofFlags, ids, amounts, nftAddresses);
    }

    function test_Revert_claimMultiple_ZeroedProof() public {
        multiProof = [
                bytes32(0x0), 
                bytes32(0x0), 
                bytes32(0x0)
        ];

        uint256 totalAmount = 0;
        for (uint256 index = 0; index < amounts.length; index++) {
            totalAmount += amounts[index];
        }

        //claim
        vm.expectRevert();
        miladyDropGlobalDeployment.claimMultiple(multiProof, proofFlags, ids, amounts, nftAddresses);
    }

    function test_Revert_claim_ZeroedProof() public {
        proof = [
            bytes32(0x0), 
            bytes32(0x0), 
            bytes32(0x0)
        ];
        
        vm.expectRevert();
        miladyDropGlobalDeployment.claim(proof, id, amount, nftAddress);
    }

    function test_Revet_createNewDrop_DoubleInitialization() public {
        MiladyDrop deployedMiladyDrop = _deployFromFactory();
        vm.expectRevert();
        deployedMiladyDrop.initialize(address(0x0), 0x0, "rugged");
    }

    //to test how many nft addresses can fit into a drop. this function can iter 1155 times before hitting the block limit
    //approx 1148 nfts addresses can be set
    // function test_gasUsageSettingRequiredNFTAddresses() public {
    //     for (uint16 index = 0; index < inputRequiredNFTAddressesGasTest.length; index++) {
    //         outputRequiredNFTAddressesGasTest[index] = inputRequiredNFTAddressesGasTest[index];
    //     }
    // }



}
