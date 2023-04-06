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

async function loadAllContracts() {
    urlVars = await getUrlVars();
    mildayDropContract = await getMiladyDropContract(provider, urlVars);
    mildayDropWithSigner = mildayDropContract.connect(signer);
    nftContract = await getNftContract();
    airdropTokenContract = await getAirdropTokenContract();
    //load indexer
    claimDataIpfsHash = await mildayDropContract.claimDataIpfs(); //await window.ipfsIndex.createIpfsIndex(balanceMapJson, splitSize=780);//"bafybeigdvozivwvzn3mrckxeptstjxzvtpgmzqsxbau5qecovlh4r57tci"
    window.ipfsIndex = new ipfsIndexer(window.ipfsApi, window.auth , isGateway=false);
    console.log(claimDataIpfsHash);
    await window.ipfsIndex.loadIndex(claimDataIpfsHash);

    return [mildayDropContract, mildayDropWithSigner, nftContract, airdropTokenContract];
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
                console.log("THIS IS CLAIM DATA")
                console.log(claimData)
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
            console.log(message);
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
    let balanceMapJson = merkle; //TODO get merkle hash from contract then ipfs etc
}

function goToclaim() {
    window.x = document.getElementById("infuraIpfsForm").elements;
    const currentUrl = new URL(window.location.href)
    //TODO set address
    location.replace(`/?mildayDropAddress=0x326a3c40DfD5D46bbFbcaa3530C1E71120fc603a&ipfsApi=${x.ipfsApi.value}&projectId=${x.projectId.value}&projectSecret=${x.keySecret.value}`)
  }

async function test() {
    //let response = await fetch('./merkle_proofs/index.json')
    if (!isWalletConnected()) {
        return 0
    }

    // window.newHashWithIndex = "bafybeigdvozivwvzn3mrckxeptstjxzvtpgmzqsxbau5qecovlh4r57tci"//await window.ipfsIndex.createIpfsIndex(balanceMapJson, splitSize=780);//"bafybeigdvozivwvzn3mrckxeptstjxzvtpgmzqsxbau5qecovlh4r57tci"
    // console.log(`index obj: ${JSON.stringify(window.ipfsIndex.index, null, 2)}`);
    // console.log(window.ipfsIndex.dropsRootHash);
    // console.log(await window.ipfsIndex.getIdFromIndex(20));
    // //claim(8, window.ipfsIndex);
    console.log("gettting imagessssssssssssssss")
    console.log(nftContract);
    uri = new uriHandler(nftContract, "./scripts/URITypes.json");
    console.log(await uri.getImage(1));
    //document.getElementById("nftImages").innerHTML = `<img src="${await uri.getImage(1)}">`;
    console.log("aaaaaaaaaaa");
    let userNfts = await getUserNftIds(await signer.getAddress());
    let imagesUrls = [];
    for (let i = 0; i < userNfts.length; i++ ) {
        imagesUrls.push(await uri.getImage(userNfts[i]))
    }
    console.log(userNfts);
    console.log(imagesUrls)
    displayImages(imagesUrls);

};

function displayImages(imagesUrls) {
    let imagesHTML = ""
    imagesUrls.forEach(url => {
        imagesHTML += `<img src="${url}">\n`;
        
    });
    document.getElementById("nftImages").innerHTML = imagesHTML;
} 

window.onload = runOnLoad;

async function runOnLoad() {
    window.urlVars = await getUrlVars();
    let mildayDropAbiFile = await fetch('./../abi/mildayDropAbi.json');
    let ERC721ABIFile = await fetch('./../abi/ERC721ABI.json');
    let ERC20ABIFile = await fetch('./../abi/ERC20ABI.json');
    mildayDropAbi = await mildayDropAbiFile.json();
    console.log(ERC721ABIFile)
    ERC721ABI = await ERC721ABIFile.json();
    console.log(ERC721ABI)
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

    // //load indexer
    // window.newHashWithIndex = "bafybeibarxa3ev24vtj2nq3atdpfjmq3ckbmvwc2fqtuaahl7bbf6fcx54"//await window.ipfsIndex.createIpfsIndex(balanceMapJson, splitSize=780);//"bafybeigdvozivwvzn3mrckxeptstjxzvtpgmzqsxbau5qecovlh4r57tci"
    // window.ipfsIndex = new ipfsIndexer(window.ipfsApi, window.auth , isGateway=true);
    // await window.ipfsIndex.loadIndex(window.newHashWithIndex);
}