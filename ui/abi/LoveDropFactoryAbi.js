export const LoveDropFactoryAbi = [
  {
    "inputs": [],
    "name": "ERC1167FailedCreateClone",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "deployerAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "dropAddress",
        "type": "address"
      }
    ],
    "name": "CreateNewDrop",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_airdropTokenAddress",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "_merkleRoot",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "_claimDataIpfs",
        "type": "string"
      }
    ],
    "name": "createNewDrop",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "implementation",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
