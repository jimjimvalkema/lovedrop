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
        merkleRoot = 0x25a7a8dbe3cb530178fc95c9705bcfe993e3250d4b9981184ba1bba992c534d3;
        miladyDropGlobalDeployment = _deployFromFactory();  
        airdropToken.mint(address(miladyDropGlobalDeployment), amountAirDropTokensToMint);

    }

    // function deployDropWithPreMints() public returns(address) {
    //     //TODO parameters might be usefull
    //     address[] memory requiredNftAddresses = preMintNfts(
    //         idsToMint,
    //         address(this),
    //         amountOfCollections
    //     );
    //     vm.recordLogs();
    //     console.logString("deploying miladyDrop:");
    //     miladyDropFactory.createNewDrop(requiredNftAddresses, address(airdropToken), 0x25a7a8dbe3cb530178fc95c9705bcfe993e3250d4b9981184ba1bba992c534d3, "0x0");
    //     Vm.Log[] memory entries = vm.getRecordedLogs();
    //     address _deployedDropAddres = abi.decode(entries[1].data, (address));

    //     console.logString("deployed to address:");
    //     console.logAddress(_deployedDropAddres);
    //     airdropToken.mint(_deployedDropAddres, amountAirDropTokensToMint);
    //     return _deployedDropAddres;
    // }

    function _deployFromFactory() private returns (MiladyDrop) {
        vm.recordLogs();
        miladyDropFactory.createNewDrop(requiredNftAddressesGlobal, address(airdropToken), merkleRoot, claimDataIpfs);  
        Vm.Log[] memory entries = vm.getRecordedLogs();
        address _deployedDropAddres = abi.decode(entries[1].data, (address));
        //possibly add more test to verify that all variables are set
        return MiladyDrop(_deployedDropAddres);
    }

    function test_createNewDrop_Normal() public {   
        MiladyDrop deployedMiladyDrop = _deployFromFactory();  
        require(deployedMiladyDrop.merkleRoot() == merkleRoot);
    }

    function test_claimMultiple() public {
        //gas pre proxy: 606838
        //after 614624
        //proof
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

        //track expected amount that will be claimed
        uint256 totalAmount = 0;
        for (uint256 index = 0; index < amounts.length; index++) {
            totalAmount += amounts[index];
        }

        //claim
        miladyDropGlobalDeployment.claimMultiple(proof, proofFlags, ids, amounts, nftIndexes);

        //test correct amount recieved
        require(
            totalAmount == airdropToken.balanceOf(address(this)),
            "resulting balance is different than totalAmount claimed"
        );

        //test if all set to claimed
        for (uint256 index = 0; index < ids.length; index++) {
            require(
                miladyDropGlobalDeployment.isClaimed(nftIndexes[index], ids[index]),
                "one or more ids wasnt set to claimed"
            );
        }
    }
    function test_claim() public {
        //gas pre proxy: 606838
        //after 614624
        //proof
        amount = 2000000000000000000;
        id = 2;
        nftIndex = 0;

        proof = [
                bytes32(0x4745de99a328b2ebae232c20f96567a461050c7faae982ae6fe86ae7b152ef7f), 
                bytes32(0x79ea2690f3de51ccf35b1147779a6155f0a310af09f47244bb690b43765ff46d), 
                bytes32(0xc7c0845a7e20c05cd7664cfa888ff16b08a5d224e1409d41d78fd18124ccc1a3)

        ];
        //claim
        miladyDropGlobalDeployment.claim(proof, id, amount, nftIndex);

        //test correct amount recieved
        require(
            amount == airdropToken.balanceOf(address(this)),
            "resulting balance is different than totalAmount claimed"
        );

        //test if its set to claimed
        require(
            miladyDropGlobalDeployment.isClaimed(nftIndex, id),
            "one or more ids wasnt set to claimed"
        );
    }

}
