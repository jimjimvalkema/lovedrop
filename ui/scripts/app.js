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

//abis global variable
let mildayDropAbi = null;
let ERC20ABI = null;
let ERC721ABI = null;

// A Web3Provider wraps a standard Web3 provider, which is
// what MetaMask injects as window.ethereum into each page
// TODO get 3rd party provider incase user doesnt connect 
const provider = new ethers.providers.Web3Provider(window.ethereum);

function message(message) {
    console.log(message);
    document.getElementById("message").innerHTML = message;
}


async function connectSigner() {
    // MetaMask requires requesting permission to connect users accounts
    provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    if (isWalletConnected()) {
        await loadAllContracts();
        return [provider, signer];
    };
};

async function getMiladyDropContract(provider, urlVars) {
    mildayDropAddress = urlVars["mildayDropAddress"]
    //const mildayDropAbi = 
    // The Contract object
    mildayDropContract = new ethers.Contract(mildayDropAddress, mildayDropAbi, provider);
    return mildayDropContract;
}

async function getMiladyDropFactoryContract(provider, mildayDropFactoryAddress="0xd58C56c1Fe24BFef93aad3FE1aBADBed27272980",mildayDropFactoryAbi=window.mildayDropFactoryAbi) {
    mildayDropFactoryContract = new ethers.Contract(mildayDropFactoryAddress, mildayDropFactoryAbi, provider);
    return mildayDropFactoryContract;
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
    let userBalance = (await nftContract.balanceOf(userAddress)).toNumber();
    for (let i = 0; i < userBalance; i++) {
        ids.push((await nftContract.tokenOfOwnerByIndex(userAddress, i)).toNumber());

    }
    return ids;
}

async function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
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

function readFile(input) {
    let file = input.files[0];
    let result = ""

    let reader = new FileReader();
    currenFileName = file["name"];


    reader.readAsText(file);
    reader.onload = function () {
        result += reader.result;
    }

    reader.onloadend = function () {
        window.currentFileString = result;
    }
};

function isInterger(string) {

    if (isNaN(parseInt(string))) {
        return (false)
    } else {
        return (true);
    }
};

function formatBalanceMap(balanceMap) {
    let formatedBalanceMap = {}
    for (var i = 0; i < balanceMap.length; i++) {
        line = balanceMap[i];
        address = line[0];
        amount = line[1];
        if (ethers.utils.isAddress(address) && isInterger(amount)) {
            formatedBalanceMap[balanceMap[i][0]] = balanceMap[i][1];

        } else {
            console.log("skipped this line");
            console.log(line);
        };
    };
    return (formatedBalanceMap);
};

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
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
}

function formatBalanceMapIds(balanceMap) {
    let formatedBalanceMap = {}
    for (var i = 0; i < balanceMap.length; i++) {
        line = balanceMap[i];
        id = line[0];
        amount = line[1];
        if (isInterger(id) && isInterger(amount)) {
            formatedBalanceMap[balanceMap[i][0]] = balanceMap[i][1]

        } else {
            message(`cant read this line: ${line} \n skipped it.`)
        }
    }
    return (formatedBalanceMap);
}

function csvToBalanceMapJSON(file) {
    message(`parsing csv`)
    var balanceMap = Papa.parse(file)["data"];
    var formatedBalanceMap = formatBalanceMapIds(balanceMap);
    message(`building merkle tree on: ${Object.keys(formatedBalanceMap).length} claims.`)
    let merkle = uniswapMerkle.parseBalanceMapOnIds(formatedBalanceMap);
    let newFilename = currenFileName.split(".")[0] + ".json";
    //downloadString(JSON.stringify(merkle, null, 2), "json", newFilename)
    return merkle;
}

function goToclaim() {
    window.x = document.getElementById("infuraIpfsForm").elements;
    const currentUrl = new URL(window.location.href)
    //TODO set address
    location.replace(`/?mildayDropAddress=0x326a3c40DfD5D46bbFbcaa3530C1E71120fc603a&ipfsApi=${x.ipfsApi.value}&projectId=${x.projectId.value}&projectSecret=${x.keySecret.value}`)
}

async function claimIndexIpfsFromCsv(csvString = window.currentFileString) {
    merkle = await csvToBalanceMapJSON(csvString);
    message(`created merkle tree with merkle root: ${merkle['merkleRoot']}`)
    window.dropsRootHash = await window.ipfsIndex.createIpfsIndex(merkle, splitSize = 780, metaData ={"merkleRoot":merkle['merkleRoot']});

}

//TODO remove default value
async function deployDropContract(requiredNFTAddress="0xf895907d85807e208553C9371eFF881DFf161fAC", airDropTokenAddress="0x4A42CD4CFfB2d963b1815f58F636c01205Fc123c", ipfsIndex=window.ipfsIndex) {
    const merkleRoot = ipfsIndex.metaData.merkleRoot;
    const claimDataIpfs = ipfsIndex.dropsRootHash;

    mildayDropFactoryContract = new ethers.Contract("0xd58C56c1Fe24BFef93aad3FE1aBADBed27272980", mildayDropAbi, provider);
    

    if (isWalletConnected()) {
        message(`creating deploy tx with ${requiredNFTAddress}, ${airDropTokenAddress}, ${merkleRoot}, ${claimDataIpfs}`)
        window.miladyDropFactoryContractWithSigner.createNewDrop(requiredNFTAddress,airDropTokenAddress,merkleRoot,claimDataIpfs);
    }
    return 0;

} 

async function test() {
    //let response = await fetch('./merkle_proofs/index.json')
    if (!isWalletConnected()) {
        return 0
    }

    let userAddress = await signer.getAddress();

    console.log(userAddress);


    console.log(window.ipfsIndex.index);
    console.log(window.ipfsIndex.dropsRootHash);
};

window.onload = runOnLoad;

async function runOnLoad() {
    window.urlVars = await getUrlVars();
    window.mildayDropFactoryAbiFile = await fetch('./../abi/mildayDropFactoryAbi.json');
    window.mildayDropAbiFile = await fetch('./../abi/mildayDropAbi.json');
    let ERC721ABIFile = await fetch('./../abi/ERC721ABI.json');
    let ERC20ABIFile = await fetch('./../abi/ERC20ABI.json');
    mildayDropAbi = await window.mildayDropAbiFile.json();
    mildayDropFactoryAbi = await window.mildayDropFactoryAbiFile .json();
    ERC721ABI = await ERC721ABIFile.json();
    ERC20ABI = await ERC20ABIFile.json();

    //TODO make function to connect ipfs indexer and option for is gateway in ui
    //TODO test if can connect 
    //connect api
    window.ipfsApi = window.urlVars["ipfsApi"]
    window.auth = null;
    if (window.urlVars["projectId"] != null) {
        const projectId = window.urlVars["projectId"]
        const projectSecret = window.urlVars["projectSecret"]
        window.auth = "Basic " + btoa(projectId + ":" + projectSecret);

    } else {
        window.auth = null
    }
    window.ipfsIndex = new ipfsIndexer(window.ipfsApi, window.auth , isGateway=false);
}


async function loadAllContracts() {
    urlVars = await getUrlVars();
    window.miladyDropContract = await getMiladyDropContract(provider, urlVars);
    window.miladyDropContractWithSigner = window.miladyDropContract.connect(signer);
    window.miladyDropFactoryContract = await getMiladyDropFactoryContract(provider);
    window.miladyDropFactoryContractWithSigner = window.miladyDropFactoryContract.connect(signer);
    nftContract = await getNftContract();
    airdropTokenContract = await getAirdropTokenContract();
    //load indexer
    //claimDataIpfsHash = await mildayDropContract.claimDataIpfs(); //await window.ipfsIndex.createIpfsIndex(balanceMapJson, splitSize=780);//"bafybeigdvozivwvzn3mrckxeptstjxzvtpgmzqsxbau5qecovlh4r57tci"
    //window.ipfsIndex = new ipfsIndexer(window.ipfsApi, window.auth , isGateway=false);
    //await window.ipfsIndex.loadIndex(claimDataIpfsHash);

    return [mildayDropContract, mildayDropWithSigner, nftContract, airdropTokenContract];
}
