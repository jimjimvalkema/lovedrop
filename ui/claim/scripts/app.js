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
    let userBalance = (await nftContract.balanceOf(userAddress)).toNumber();
    for (let i = 0; i < userBalance; i++) {
        ids.push((await nftContract.tokenOfOwnerByIndex(userAddress, i)).toNumber());

    }
    return ids;
}

function isClaimed(claimData) {
    if (claimData===null) {
        return true
    }
    return mildayDropWithSigner.isClaimed(claimData["index"]);
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

function getProof(id, claimData) {
    const index = claimData["index"];
    const amount = parseInt(claimData["amount"], 16)
    const proof = claimData["proof"];
    return [index, id, amount, proof]

}


async function claimAll(ipfsIndex=window.ipfsIndex) {
    if (isWalletConnected()) {
        //await getAllContracts();
        let userAddress = await signer.getAddress();
        var user_nfts = await getUserNftIds(userAddress, nftContract);
        var unclaimed_proofs = [];
        for (let i = 0; i < user_nfts.length; i++) {
            let id = user_nfts[i]
            let claimData = await ipfsIndex.getIdFromIndex(id) //TODO handle error if doesn't exist and message to user
            if (claimData != null) {
                if (! await isClaimed(claimData)) {
                    unclaimed_proofs.push(getProof(id, claimData));
                    console.log(`id: ${id} is added to claim all!`)
                } else {
                    //TODO give users this info
                    console.log(`id: ${id} is in wallet but already claimed`)
                }
            } else {
                console.log(`ID: ${id} is in wallet but not in the claims index`)
            }
        }
        if (unclaimed_proofs.length == 0) {
            let nftBalance =  (await nftContract.balanceOf(userAddress)).toNumber();
            let message = `found ${nftBalance} nfts but none have tokens to be claimed`;
            document.getElementById("message").innerHTML = message;
            return 0
        }
        mildayDropWithSigner.claimMultiple(unclaimed_proofs); //TODO unclaimed_proofs to the struct
    }
    return 0
};

async function claim(id, ipfsIndex=window.ipfsIndex) {
    const claimData = await ipfsIndex.getIdFromIndex(id)
    if (isWalletConnected()) {
        if (! await isClaimed(claimData)) {
            let proof = await getProof(id, claimData);
            mildayDropWithSigner.claim(...proof);
        }
    }
    document.getElementById(`NFT${id}`).style.border = "5px solid blue";
    return 0;
};

function isInterger(string) {
    
    if(isNaN(parseInt(string))){
        return(false)
    } else {
        return(true);
    }
};

async function displayNFTS(URI, ids) {
    let imagesHTML = ""
    for (let i = 0; i < ids.length; i++ ) {
        console.log(ids[i])
        url = await URI.getImage(ids[i])
        let claimData = await ipfsIndex.getIdFromIndex(ids[i])
        if ( await isClaimed(claimData)) {
            imagesHTML += `<div id="NFT${ids[i]}" style=" border:5px black; width: 20%; display: inline-block;" >
                <h3>Nothing to claim :(</h1>
                <img src="${url}" style="max-width: 100%; max-height: 100%;">\n 
                </div>`;
        } else {
            imagesHTML += `<div id="NFT${ids[i]}" onclick="claim(${ids[i]})" style="cursor:pointer; border:5px solid green; width: 20%; display: inline-block;" >
                <h3>Claim me!!!</h3>
                <img src="${url}" style="max-width: 100%; max-height: 100%;">\n 
                </div>`;
        }
    };
    document.getElementById("nftImages").innerHTML = imagesHTML;
} 

function goToclaim() {
    window.x = document.getElementById("infuraIpfsForm").elements;
    const currentUrl = new URL(window.location.href)
    //TODO set address
    location.replace(`/?mildayDropAddress=0x326a3c40DfD5D46bbFbcaa3530C1E71120fc603a&ipfsApi=${x.ipfsApi.value}&projectId=${x.projectId.value}&projectSecret=${x.keySecret.value}`)
  }

async function test() {
    if (!isWalletConnected()) {
        return 0
    }

    console.log(nftContract);
    URI = new uriHandler(nftContract, "./scripts/URITypes.json");
    console.log(await URI.getImage(1));
    let userNfts = await getUserNftIds(await signer.getAddress());
    console.log(userNfts);
    displayNFTS(URI ,userNfts);

};

window.onload = runOnLoad;

async function runOnLoad() {
    window.urlVars = await getUrlVars();
    let mildayDropAbiFile = await fetch('./../abi/mildayDropAbi.json');
    let ERC721ABIFile = await fetch('./../abi/ERC721ABI.json');
    let ERC20ABIFile = await fetch('./../abi/ERC20ABI.json');
    mildayDropAbi = await mildayDropAbiFile.json();
    ERC721ABI = await ERC721ABIFile.json();
    ERC20ABI = await ERC20ABIFile.json();

    //TODO make function to connect ipfs indexer and option for is gateway in ui
    //TODO test if can connect 
    //connect api
    window.ipfsApi= window.urlVars["ipfsApi"]   
    window.auth = null; 
    if(window.urlVars["projectId"]!=null) {
        const projectId = window.urlVars["projectId"]
        const projectSecret = window.urlVars["projectSecret"]
        window.auth  = "Basic " + btoa(projectId+ ":" + projectSecret);
    
    } else {
        window.auth  = null
    }
    window.ipfsIndex = new ipfsIndexer(window.ipfsApi, window.auth , isGateway=true);
}

async function loadAllContracts() {
    urlVars = await getUrlVars();
    mildayDropContract = await getMiladyDropContract(provider, urlVars);
    mildayDropWithSigner = mildayDropContract.connect(signer);
    nftContract = await getNftContract();
    airdropTokenContract = await getAirdropTokenContract();
    //load indexer
    claimDataIpfsHash = "bafybeih34n353h3qvgq5rtpgawnmqaqg3nlxnowtt3hdqizlaffhj4efeq"//await mildayDropContract.claimDataIpfs(); //await window.ipfsIndex.createIpfsIndex(balanceMapJson, splitSize=780);//"bafybeigdvozivwvzn3mrckxeptstjxzvtpgmzqsxbau5qecovlh4r57tci"
    await window.ipfsIndex.loadIndex(claimDataIpfsHash);

    return [mildayDropContract, mildayDropWithSigner, nftContract, airdropTokenContract];
}