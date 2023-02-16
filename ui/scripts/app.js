// maybe switch to window :p
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

//abis global variable
let mildayDropAbi = null;
let ERC20ABI = null;
let ERC721ABI = null;

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
    //const mildayDropAbi = 
    // The Contract object
    mildayDropContract = new ethers.Contract(mildayDropAddress, mildayDropAbi, provider);
    return mildayDropContract;
}

async function getAirdropTokenContract() {
    const airDropTokenAddress = await mildayDropContract.airdropTokenAddress();
    // The ERC-20 Contract ABI, which is a common contract interface
    // for tokens (this is the Human-Readable ABI format)
    // The Contract object
    const airdropTokenContract = new ethers.Contract(airDropTokenAddress, ERC20ABI, provider);
    return airdropTokenContract;
}

async function getNftContract() {
    nftContractAddress = await mildayDropContract.requiredNFTAddress();
    // The Contract object
    nftContract = new ethers.Contract(nftContractAddress, ERC721ABI, provider);
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
};

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
  };

function isInterger(string) {
    
    if(isNaN(parseInt(string))){
        return(false)
    } else {
        return(true);
    }
};

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
        };
    };
    return(formatedBalanceMap);
};

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

function getValues(obj, keys) {
    let result = {}
    for (let i = 0; i < keys.length; i++) {
        result[keys[i]] = obj[keys[i]]
    }
    return result
}

function splitObject(obj, amountItems) {
    let result = [];
    let keys = Object.keys(obj);
    let start = 0;
    let stop = amountItems;
    let amountOfSplits = keys.length/amountItems;
    for (let i = 1; i < (amountOfSplits+2); i++) {
        result.push(getValues(obj, keys.slice(start,stop)));
        start=stop;
        stop=amountItems*i 
    }
    return result
}



async function test() {
    //let response = await fetch('./merkle_proofs/index.json')
    if (!isWalletConnected()) {
        return 0
    }

    proofsFile = await fetch('./modulo4.json');
    tempMerkle = await proofsFile.json();

    // The MetaMask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...formatBalanceMapIds(balanceMap["data"]) 
    //await getAllContracts();p

    let userAddress = await signer.getAddress();

    console.log(userAddress);
    console.log(await isClaimed(1));
    console.log(await getUserNftIds(userAddress));
    console.log(parseInt(await airdropTokenContract.balanceOf(userAddress), 16))
    console.log(getProof(1));
    a = splitObject(tempMerkle["claims"], 780);
    console.log("we got files :D:  " + a.length)
    //downloadString(JSON.stringify(a["0"], null, 2), "json", "hi")

    var zip = new JSZip();
    for(let i=0; i<a.length; i++) {
        let filename = "0-"+ (i*780).toString()+".json"
        zip.file(filename+".json", JSON.stringify(a[i], null, 2));
    }
    //var img = zip.folder("images");
    //img.file("smile.gif", imgData, {base64: true});
    zip.generateAsync({type:"blob"})
    .then(function(content) {
        // see FileSaver.js
        saveAs(content, "example.zip");
    });

}

window.onload = runOnLoad;

async function runOnLoad() {
    let mildayDropAbiFile = await fetch('./abi/mildayDropAbi.json');
    let ERC721ABIFile = await fetch('./abi/ERC721ABI.json');
    let ERC20ABIFile = await fetch('./abi/ERC20ABI.json');
    mildayDropAbi = await mildayDropAbiFile.json();
    ERC721ABI = await ERC721ABIFile.json();
    ERC20ABI = await ERC20ABIFile.json();
}