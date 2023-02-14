let mildayDropAddress = null;
let mildayDropContract = null;
let mildayDropWithSigner = null;

let airdropTokenAddress = null;
let airdropTokenContract = null;

let nftContractAddress = null;
let nftContract = null;

let signer = null;

let currentFileString = null;
let currenFileName = null;

let tempMerkle = null;

// A Web3Provider wraps a standard Web3 provider, which is
// what MetaMask injects as window.ethereum into each page
// TODO get 3rd party provider incase user doesnt connect 
const provider = new ethers.providers.Web3Provider(window.ethereum)


async function connectSigner() {
    // MetaMask requires requesting permission to connect users accounts
    provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    if (isWalletConnected()) {
        await loadAllContracts();
        return [provider, signer];
    }
}

async function getMiladyDropContract(provider, urlVars) {
    mildayDropAddress = urlVars["mildayDropAddress"]
    const mildayDropAbi = [
        {
            "inputs": [
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "index",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "id",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "amount",
                            "type": "uint256"
                        },
                        {
                            "internalType": "bytes32[]",
                            "name": "merkleProof",
                            "type": "bytes32[]"
                        }
                    ],
                    "internalType": "struct IMiladyDrop.claimData[]",
                    "name": "claims",
                    "type": "tuple[]"
                }
            ],
            "name": "multiClaim",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "index",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "id",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                },
                {
                    "internalType": "bytes32[]",
                    "name": "merkleProof",
                    "type": "bytes32[]"
                }
            ],
            "name": "claim",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "index",
                    "type": "uint256"
                }
            ],
            "name": "isClaimed",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "airdropTokenAddress",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "requiredNFTAddress",
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
    ];
    // The Contract object
    mildayDropContract = new ethers.Contract(mildayDropAddress, mildayDropAbi, provider);
    return mildayDropContract;
}

async function getAirdropTokenContract() {
    const airDropTokenAddress = await mildayDropContract.airdropTokenAddress();
    // The ERC-20 Contract ABI, which is a common contract interface
    // for tokens (this is the Human-Readable ABI format)
    const airDropTokenAbi = [
    // Some details about the token
    "function name() view returns (string)",
    "function symbol() view returns (string)",

    // Get the account balance
    "function balanceOf(address) view returns (uint)",

    // Send some of your tokens to someone else
    "function transfer(address to, uint amount)",

    // An event triggered whenever anyone transfers to someone else
    "event Transfer(address indexed from, address indexed to, uint amount)"
    ];

    // The Contract object
    const airdropTokenContract = new ethers.Contract(airDropTokenAddress, airDropTokenAbi, provider);
    return airdropTokenContract;
}

async function getNftContract() {
    nftContractAddress = await mildayDropContract.requiredNFTAddress();

    const erc721Abi = [
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "index",
                    "type": "uint256"
                }
            ],
            "name": "tokenOfOwnerByIndex",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]
    // The Contract object
    nftContract = new ethers.Contract(nftContractAddress, erc721Abi, provider);
    return nftContract;

}

async function getUserNftIds(userAddress) {
    var ids = [];
    let userBalance = parseInt(await nftContract.balanceOf(userAddress), 16);
    for (let i = 1; i < userBalance; i++) {
        ids.push(parseInt(await nftContract.tokenOfOwnerByIndex(userAddress, i), 16));

    }
    return ids;
}

function getIndex(id) {
    //TODO get merkle hash from contract then ipfs etc
    return tempMerkle["claims"][id]["index"];
}

function isClaimed(id) {
    index = getIndex(id)
    return mildayDropWithSigner.isClaimed(index);
}

async function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function isWalletConnected() {
    let message = "";
    if (signer == null) {
        message = "wallet not connected";
        console.log(message);
        document.getElementById("message").innerHTML = message;
        return false
    } else {
        document.getElementById("message").innerHTML = message;
        return true;
    }
}


async function loadAllContracts() {
    urlVars = await getUrlVars();
    mildayDropContract = await getMiladyDropContract(provider, urlVars);
    mildayDropWithSigner = mildayDropContract.connect(signer);
    nftContract = await getNftContract();
    airdropTokenContract = await getAirdropTokenContract();
    return [mildayDropContract, mildayDropWithSigner, nftContract, airdropTokenContract];
}

function getProof(id) {
    const index = tempMerkle["claims"][id]["index"];
    const amount = parseInt(tempMerkle["claims"][id]["amount"], 16)
    const proof = tempMerkle["claims"][id]["proof"];
    return [index, id, amount, proof]

}


//TODO update with merkle stuff :D
async function claimAll() {
    if (isWalletConnected()) {
        //await getAllContracts();
        let userAddress = signer.getAddress();
        var user_nfts = await getUserNftIds(userAddress, nftContract);
        var unclaimed_proofs = [];
        for (let i = 0; i < user_nfts.length; i++) {
            let id = user_nfts[i]
            if (! await isClaimed(id)) {
                unclaimed_proofs.push(getProof(id));
            }
        }
        mildayDropWithSigner.multiClaim(unclaimed_proofs);
    }
    return 0
};

async function claim(id) {
    if (isWalletConnected()) {
        if (! await isClaimed(id)) {
            let proof = await getProof(id);
            console.log(proof);
            mildayDropWithSigner.claim(...proof);
        }
    }
    return 0;

}

function readFile(input) {
    let file = input.files[0];
    let result = ""
  
    let reader = new FileReader();
    currenFileName = file["name"];
    console.log(currenFileName);


    reader.readAsText(file);
    reader.onload = function() {
        result += reader.result;
        //console.log(reader.result);
    }

    reader.onloadend = function() {
        currentFileString = result; //TODO do i have to store this in a global lol?
    }
  
  }

function isInterger(string) {
    
    if(isNaN(parseInt(string))){
        return(false)
    } else {
        return(true);
    }
}

function formatBalanceMap(balanceMap) {
    let formatedBalanceMap = {}
    for (var i = 0; i < balanceMap.length; i++){
        line = balanceMap[i];
        address = line[0];
        amount = line[1];
        if(ethers.utils.isAddress(address) && isInterger(amount)){
            formatedBalanceMap[balanceMap[i][0]] = balanceMap[i][1]

        } else {
            console.log("skipped this line");
            console.log(line);
        }
    }

    return(formatedBalanceMap);
}

function formatBalanceMapIds(balanceMap) {
    let formatedBalanceMap = {}
    for (var i = 0; i < balanceMap.length; i++){
        line = balanceMap[i];
        id = line[0];
        amount = line[1];
        if(isInterger(id) && isInterger(amount)){
            formatedBalanceMap[balanceMap[i][0]] = balanceMap[i][1]

        } else {
            console.log("skipped this line");
            console.log(line);
        }
    }

    return(formatedBalanceMap);
}

function downloadString(text, fileType, fileName) {
    var blob = new Blob([text], { type: fileType });
  
    var a = document.createElement('a');
    a.download = fileName;
    a.href = URL.createObjectURL(blob);
    a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(a.href); }, 1500);
  }

function csvToBalanceMapJSON() {
    var balanceMap = Papa.parse(currentFileString)["data"];
    var formatedBalanceMap = formatBalanceMapIds(balanceMap);
    let merkle = uniswapMerkle.parseBalanceMapOnIds(formatedBalanceMap);
    let newFilename = currenFileName.split(".")[0] + ".json";
    downloadString(JSON.stringify(merkle, null, 2), "json", newFilename)
    tempMerkle = merkle; //TODO get merkle hash from contract then ipfs etc
}

async function test() {
    //let response = await fetch('./merkle_proofs/index.json')
    if (!isWalletConnected()) {
        return 0
    }

    proofsFile = await fetch('./timeTwo.json');
    tempMerkle = await proofsFile.json();

    // The MetaMask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...formatBalanceMapIds(balanceMap["data"]) 
    //await getAllContracts();p

    let userAddress = await signer.getAddress();

    console.log(userAddress);
    console.log(await isClaimed(1));
    console.log(await getUserNftIds(userAddress));
    console.log(await parseInt(await airdropTokenContract.balanceOf(userAddress), 16))
    console.log(getProof(1));
}