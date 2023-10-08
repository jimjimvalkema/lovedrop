import { uriHandler } from "../../scripts/uriHandler.js";
import { IpfsIndexer } from "../../scripts/IpfsIndexer.js";
import { ethers } from "../../scripts/ethers-5.2.esm.min.js";
window.uriHandler = uriHandler

// A Web3Provider wraps a standard Web3 provider, which is
// what MetaMask injects as window.ethereum into each page
// TODO get 3rd party provider incase user doesnt connect 
const provider = new ethers.providers.Web3Provider(window.ethereum)

if (window.ethereum) {
    window.provider = new ethers.providers.Web3Provider(window.ethereum);
} else {
    console.log("couldn't connect to inject ethereum provide, connecting to external provicer")
    window.provider = new ethers.providers.JsonRpcProvider('https://eth.llamarpc.com');
}

function isWalletConnected() {
    let message = "";
    if (window.signer == null) {
        message = "wallet not connected";
        console.log(message);
        document.getElementById("message2").innerHTML = message;
        return false
    } else {
        document.getElementById("message2").innerHTML = message;
        return true;
    }
}


async function connectSigner() {
    // MetaMask requires requesting permission to connect users accounts
    provider.send("eth_requestAccounts", []);
    window.signer = provider.getSigner();
    if (isWalletConnected()) {
        await loadAllContracts();
        return [provider, signer];
    }
}
window.connectSigner = connectSigner


async function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}





async function displayNFTSForClaims(URI, ids) {
    let unClaimedImagesHTML = "";
    let claimedImagesHTML = "";
    let noClaimImagesHTML = ""
    const ticker = await airdropTokenContract.symbol()
    for (let i = 0; i < ids.length; i++ ) {
        console.log(ids[i])
        url = await URI.getImage(ids[i])
        let claimData = await ipfsIndex.getIdFromIndex(ids[i])
        if (claimData===null) {
            noClaimImagesHTML += `<div id="NFT${ids[i]}" style="position: relative; margin: 2px; border:5px solid black; width: 20%; display: inline-block;" >
                <img src="${url}" style="max-width: 100%; max-height: 100%;">\n 
                <div  style="float: right; position: absolute; left: 0px; bottom: 0px; z-index: 1; background-color: rgba(0, 0, 0, 0.8); padding: 5px; color: #FFFFFF; font-weight: bold;">
                    Not eligable for ${ticker} :(
                </div>
            </div>`;
            continue
        }
        if ( await isClaimed(claimData)) {
            amount = parseInt(claimData["amount"], 16);
            claimedImagesHTML += `<div id="NFT${ids[i]}" style="position: relative; margin: 2px; border:5px solid black; width: 20%; display: inline-block;" >
                    <img src="${url}" style="max-width: 100%; max-height: 100%;">\n 
                    <div  style="float: right; position: absolute; left: 0px; bottom: 0px; z-index: 1; background-color:  rgba(0, 0, 0, 0.8); padding: 5px; color: #FFFFFF; font-weight: bold;">
                        ${amount} ${ticker} already claimed :/
                    </div>
                </div>`;
        } else {
            amount = parseInt(claimData["amount"], 16);
            unClaimedImagesHTML += `<div id="NFT${ids[i]}" onclick="toggleUsersChosenIdsToClaim(${ids[i]})" style="position: relative; margin: 2px; cursor:pointer; border:5px solid green; width: 20%; display: inline-block;" >
                    <img src="${url}" style="max-width: 100%; max-height: 100%;">\n 
                    <div  style="float: right; position: absolute; left: 0px; bottom: 0px; z-index: 1; background-color: rgba(20, 200, 20, 0.8); padding: 5px; color: #FFFFFF; font-weight: bold;">
                        ${amount} ${ticker} claimable :D
                    </div>
                </div>`;
        }
    };
    document.getElementById("nftImages").innerHTML = unClaimedImagesHTML + claimedImagesHTML + noClaimImagesHTML;
} 

function toggleUsersChosenIdsToClaim(id) {
    //TODO add remove as function

    if (window.usersChosenIdsToClaim.includes(id)){
        for (let i = 0; i < window.usersChosenIdsToClaim.length; i++ )
            if (window.usersChosenIdsToClaim[i] === id) {
                window.usersChosenIdsToClaim.splice(i, 1)
                break
            }
        document.getElementById(`NFT${id}`).style.border = "5px solid green";
    } else {
        window.usersChosenIdsToClaim.push(id);
        document.getElementById(`NFT${id}`).style.border = "5px solid blue";
    }
}

async function runOnLoad() {
    await loadAllContracts()

}
window.onload = runOnLoad;

async function loadAllContracts() {
    window.urlVars = await getUrlVars();
    window.ipfsGateway = window.urlVars["ipfsGateway"]

    //abis
    const mildayDropAbi = await (await fetch("../abi/mildayDropAbi.json")).json()//update mildayDropAbi.json
    const ERC721ABI = await (await fetch("../abi/ERC721ABI.json")).json()

    //miladyDrop Contract
    window.mildayDropContract = new ethers.Contract(window.urlVars["mildayDropAddress"], mildayDropAbi, window.provider);
    
    //do in connect wallet
    //window.mildayDropWithSigner = window.mildayDropContract.connect(signer);

    
    //load ipfs data
    const claimDataIpfsHash = await mildayDropContract.claimDataIpfs(); //await window.ipfsIndex.createIpfsIndex(balanceMapJson, splitSize=780);//"bafybeigdvozivwvzn3mrckxeptstjxzvtpgmzqsxbau5qecovlh4r57tci"
    window.ipfsIndex = new IpfsIndexer(window.urlVars["ipfsGateway"],null,true)
    await window.ipfsIndex.loadIndexMiladyDropClaimData(claimDataIpfsHash)

    //get all nft contracts
    window.allNftAddresses = await window.ipfsIndex.getAllNftAddrs()
    window.allNftContractObj = allNftAddresses.map((address)=> new ethers.Contract(address, ERC721ABI, window.provider))
    Promise.all(allNftContractObj)
    window.allUriHandlers = allNftContractObj.map((contractObj)=>new uriHandler(contractObj,window.ipfsGateway,true, "../../scripts/extraUriMetaDataFile.json",window.provider ))


}
window.loadAllContracts = loadAllContracts

async function test() {
    const ids = await window.allUriHandlers[0].getIdsOfowner(await window.signer.getAddress())
    console.log(ids)
    console.log(await ipfsIndex.getProof("0xbf4a480D3009348FDF523A43Ba33220566fC1e4E",ids[0]))

}
window.test = test