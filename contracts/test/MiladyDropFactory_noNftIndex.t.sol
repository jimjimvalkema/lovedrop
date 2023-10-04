pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import "../MiladyDrop_noNftIndex.sol";
import "../MiladyDropFactory_noNftIndex.sol";

import "./ERC721/MyNft.sol";
import "./ERC20/MyToken.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

/**
tested if using a index instead of an addres was actually cheaper. 
Looks like it isnt :( 
although --gas-report does report it being lower on every metric axcept at max
 */
contract MiladyDropFactoryTest_noNftIndex is Test, ERC721Holder {
    MiladyDrop_noNftIndex public miladyDrop;
    MyNft public requiredNft1;
    MyNft public requiredNft2;
    MyToken public airdropToken;

    bytes32[] proof;
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

    MiladyDropFactory_noNftIndex miladyDropFactory;
    address[] requiredNftAddressesGlobal;
    string claimDataIpfs;
    bytes32 merkleRoot;

    MiladyDrop_noNftIndex miladyDropGlobalDeployment;

    uint256[] amounts_test_claimMultiple_GasTest_4_claims;
    uint256[] ids_test_claimMultiple_GasTest_4_claims;
    address[] nftAddresses_test_claimMultiple_GasTest_4_claims;
    bytes32[] proof_test_claimMultiple_GasTest_4_claims;
    bool[] proofFlags_test_claimMultiple_GasTest_4_claims;   

    uint256 amount_test_claim_GasTest;
    uint256 id_test_claim_GasTest;
    address nftAddress_test_claim_GasTest ;

    bytes32[] proof_test_claim_GasTest;


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
        miladyDropFactory = new MiladyDropFactory_noNftIndex();
        amountOfCollections = 2;
        requiredNftAddressesGlobal = preMintNfts(idsToMint, address(this), amountOfCollections);
        claimDataIpfs = "";
        merkleRoot = 0xb8d5e0df2c356b4dea07216d951ad8ab428733d222163c7bbcab781b21cc2f04;
        miladyDropGlobalDeployment = _deployFromFactory();  
        airdropToken.mint(address(miladyDropGlobalDeployment), amountAirDropTokensToMint);

        amounts_test_claimMultiple_GasTest_4_claims = [5000000000000000000, 2000000000000000000, 6000000000000000000, 4000000000000000000];
        ids_test_claimMultiple_GasTest_4_claims = [3, 2, 4, 3];
        nftAddresses_test_claimMultiple_GasTest_4_claims = [0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9, 0xF62849F9A0B5Bf2913b396098F7c7019b51A820a, 0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9, 0xF62849F9A0B5Bf2913b396098F7c7019b51A820a];
        proof_test_claimMultiple_GasTest_4_claims = [
                bytes32(0x1e2b4a413e27f5f1b889257844a9124e74880674b6e2c4f86211fd03d55695af), 
                bytes32(0xce2bc8b63c9fcb7b3dd7b330de3c6be73bd69ca1a0c90cb21b18fc5539cd8977), 
                bytes32(0x7466462bde889ddf0c02b4fa5b036b4f259e1b79fa07b7e641515ba5b6907fb8)

        ];
        proofFlags_test_claimMultiple_GasTest_4_claims = [false, true, true, false, false, true];   

        amount_test_claim_GasTest = 2000000000000000000;
        id_test_claim_GasTest  = 2;
        nftAddress_test_claim_GasTest  = 0xF62849F9A0B5Bf2913b396098F7c7019b51A820a;

        proof_test_claim_GasTest  = [
                bytes32(0x418d6562379a37fcbd09ed87c9adaf49e7f08cce1bdec6a54098899e4832d67c), 
                bytes32(0xce2bc8b63c9fcb7b3dd7b330de3c6be73bd69ca1a0c90cb21b18fc5539cd8977), 
                bytes32(0x168376b4f437f2dbb969bd315b7865f7f1e1c9d33c02ff1151f922d5c16f6dbe)

        ];


    }

    function _deployFromFactory() private returns (MiladyDrop_noNftIndex) {
        vm.recordLogs();
        miladyDropFactory.createNewDrop(address(airdropToken), merkleRoot, claimDataIpfs);
        Vm.Log[] memory entries = vm.getRecordedLogs();
        address _deployedDropAddres = abi.decode(entries[1].data, (address));
        //possibly add more test to verify that all variables are set
        return MiladyDrop_noNftIndex(_deployedDropAddres);
    }

    function test_createNewDrop_Normal() public {   
        MiladyDrop_noNftIndex deployedMiladyDrop = _deployFromFactory();  
        require(deployedMiladyDrop.merkleRoot() == merkleRoot);
    }

    function test_claimMultiple_GasTest_4_claims() public {
        //gas pre proxy: 606838
        //after 614624
        //proof

        //claim
        miladyDropGlobalDeployment.claimMultiple(
            proof_test_claimMultiple_GasTest_4_claims,
             proofFlags_test_claimMultiple_GasTest_4_claims,
              ids_test_claimMultiple_GasTest_4_claims,
               amounts_test_claimMultiple_GasTest_4_claims, 
               nftAddresses_test_claimMultiple_GasTest_4_claims);
    }

    function test_claim_GasTest() public {
        //after 614624
        //proof
        //claim
        miladyDropGlobalDeployment.claim(
            proof_test_claim_GasTest,
             id_test_claim_GasTest,
              amount_test_claim_GasTest,
               nftAddress_test_claim_GasTest
               );
    }
}
