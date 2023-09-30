pragma solidity >=0.8.0;

import "forge-std/Test.sol";

import "../MiladyDrop.sol";

contract MiladyDropTest is Test {
    MiladyDrop public miladyDrop;

    bytes32[] proof;
    bool[] proofFlags;
    bytes32 root;
    bytes32[] leaves;

    function setUp() public {
        miladyDrop = new MiladyDrop(
            address(0x0),
            address(0x0),
            0xfa265bb9d859d9413f1b0c039e48f23f7c2a14acca6484e29cfaa259a7f3a4d3,
            "0x0"
        );
        proof = [
            bytes32(
                0xcc4b1419f3b34fe47faec8d8935441a5580fe7b72aa55c5cf51d903df9dab814
            ),
            bytes32(
                0x9e274744bbbaf8350908c38318c26422577d040d626810d33a8677a8846f2139
            )
        ];
        proofFlags = [true, false, false, true];
        root = 0xfa265bb9d859d9413f1b0c039e48f23f7c2a14acca6484e29cfaa259a7f3a4d3;
        leaves = [
            keccak256(
                bytes.concat(
                    keccak256(
                        abi.encode(
                            0x6666666666666666666666666666666666666666,
                            5000000000000000000
                        )
                    )
                )
            ),
            keccak256(
                bytes.concat(
                    keccak256(
                        abi.encode(
                            0x6666666666666666666666666666666666666666,
                            6000000000000000000
                        )
                    )
                )
            ),
            keccak256(
                bytes.concat(
                    keccak256(
                        abi.encode(
                            0x6666666666666666666666666666666666666666,
                            4000000000000000000
                        )
                    )
                )
            )
        ];
    }

    function test_NumberIs42() public {
        require(miladyDrop.claimMultiple(proof, proofFlags, root, leaves));
    }
}
