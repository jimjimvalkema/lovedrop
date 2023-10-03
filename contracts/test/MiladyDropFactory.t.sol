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
    address deployedDropAddres;
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
    }

    function deployDropWithPreMints() public returns(address) {
        //TODO parameters might be usefull
        address[] memory requiredNftAddresses = preMintNfts(
            idsToMint,
            address(this),
            amountOfCollections
        );
        vm.recordLogs();
        //console.logString("deploying miladyDrop:");
        miladyDropFactory.createNewDrop(requiredNftAddresses, address(airdropToken), 0x25a7a8dbe3cb530178fc95c9705bcfe993e3250d4b9981184ba1bba992c534d3, "0x0");
        Vm.Log[] memory entries = vm.getRecordedLogs();
        address _deployedDropAddres = abi.decode(entries[0].data, (address));

        // console.logString("deployed to address:");
        // console.logAddress(_deployedDropAddres);
        airdropToken.mint(_deployedDropAddres, amountAirDropTokensToMint);
        return _deployedDropAddres;
    }

    function test_createNewDrop_Normal() public {     
        deployedDropAddres = deployDropWithPreMints();   
        //TODO require
    }

    function test_createNewDrop_And_Do_MultiClaim() public {
        deployedDropAddres = deployDropWithPreMints();   
        miladyDrop = MiladyDrop(deployedDropAddres);
        
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
        miladyDrop.claimMultiple(proof, proofFlags, ids, amounts, nftIndexes);

        //test correct amount recieved
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
