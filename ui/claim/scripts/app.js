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
        await test();
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
        let claimData = await window.ipfsIndex.getIdFromIndex(ids[i])
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


async function displayAllUserNfts(userAddress, allUriHandlers=window.allUriHandlers,startBlockEventScan=0) {
    let html = ""
    let collectionHtmlsArr = []
    let allIds = window.allUserIds
    console.log(allIds)

    const idsByClaimableStatus = await getClaimableStatus(allIds,window.allEligibleIds)
    console.log(idsByClaimableStatus)
    for (const i in allUriHandlers) {
        const nftHandler = allUriHandlers[i]
        const nftAddr = await nftHandler.contractObj.address
        const nftName = await nftHandler.contractObj.name()
        const idsToDisplay =  [...idsByClaimableStatus[nftAddr].claimable, ...idsByClaimableStatus[nftAddr].claimed, ...idsByClaimableStatus[nftAddr].ineligible]
        let collectionHtml = `<a>${nftName}<a></br><a style="font-size:0.8em ">${nftAddr}</a><div id=display-${nftAddr}>`
        for (const id of idsToDisplay) {
            const imgUrl = await nftHandler.getImage(id)
            collectionHtml +=`<div id="${nftAddr}-${id}" onclick="toggleClaim(${nftAddr},${id})" style="position: relative; margin: 2px; cursor:pointer; border:5px solid green; width: 20%; display: inline-block;" >\n
                        <img src="${imgUrl}" style="max-width: 100%; max-height: 100%;">\n 
                        <div id="claimableStatus${nftAddr}-${id}"   style="float: right; position: absolute; left: 0px; bottom: 0px; z-index: 1; background-color: rgba(20, 200, 20, 0.8); padding: 5px; color: #FFFFFF; font-weight: bold;">\n
                            checking rn!\n
                        </div>\n
                    </div>\n`

        }
        collectionHtml += `</div>`
        collectionHtmlsArr.push(collectionHtml)
    }

    document.getElementById("nftImages").innerHTML = collectionHtmlsArr.join("")
    for (const nftAddr of window.allNftAddresses) {
        const {claimable, claimed, ineligible} = idsByClaimableStatus[nftAddr]
        setIdClaimbleStatus(nftAddr, claimable, "claimable")
        setIdClaimbleStatus(nftAddr, claimed, "claimed")
        setIdClaimbleStatus(nftAddr, ineligible, "ineligible")
    }

}
window.displayAllUserNfts = displayAllUserNfts

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
window.toggleUsersChosenIdsToClaim = toggleUsersChosenIdsToClaim

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
    window.allEligibleIds = await window.ipfsIndex.getIdsPerCollection()

    window.allNftContractObjs = allNftAddresses.map((address)=> new ethers.Contract(address, ERC721ABI, window.provider))
    Promise.all(window.allNftContractObjs)
    window.allUriHandlers = window.allNftContractObjs.map((contractObj)=>new uriHandler(contractObj,window.ipfsGateway,true, "../../scripts/extraUriMetaDataFile.json",window.provider ))


}
window.loadAllContracts = loadAllContracts

function isClaimed() {
    console.warn("isClaimed is not implemted yet")
    return false
}

function setIdClaimbleStatus(nftAddr, ids, claimableStatus){
    for (const id of ids) {
        switch (claimableStatus) {
            case "ineligible":
                document.getElementById(`claimableStatus${nftAddr}-${id}`).innerText = `not eligible :(`
                break;
            case "claimed":
                document.getElementById(`claimableStatus${nftAddr}-${id}`).innerText = `claimed :/`
                break;
            case "claimable":
                document.getElementById(`claimableStatus${nftAddr}-${id}`).innerText = `claimable :D`
                break; 
            default:
                document.getElementById(`claimableStatus${nftAddr}-${id}`).innerText = "uhmm uuuh idk this is a bug";
        }
    }

}

async function getClaimableStatus(allUserIds=window.allUserIds, allEligibleIds = window.allEligibleIds) {
    let idsByClaimableStatus = {}
    for (const nftAddr of (await window.ipfsIndex.getAllNftAddrs())) {
        const EligibleIdsCurrentNft  = Object.keys(allEligibleIds[nftAddr])
        console.log(allUserIds)
        console.log(`am at ${nftAddr}`)
        let ids = allUserIds[nftAddr]
        console.log(ids)
        const eligibleUserIds = ids.filter((x)=>EligibleIdsCurrentNft.indexOf(x)!==-1) 
        const ineligibleIds =  ids.filter((x)=>EligibleIdsCurrentNft.indexOf(x)===-1) 
        const allClaimedUserIds = eligibleUserIds.filter((x)=>isClaimed(x))

        idsByClaimableStatus[nftAddr] = {["claimable"]:eligibleUserIds , ["claimed"]:allClaimedUserIds , ["ineligible"]:ineligibleIds}
    }
    return idsByClaimableStatus
}

async function getAllUserBalances(userAddress,allNftHandlers=window.allUriHandlers) {
    let userBalances = []
    let nftAddrs = []
    for (const nftHandler of allNftHandlers) {
        nftAddrs.push( nftHandler.contractObj.address)
        userBalances.push(nftHandler.getIdsOfowner(userAddress))
    }
    userBalances = await Promise.all(userBalances)
    return Object.fromEntries(nftAddrs.map((x,i)=>[x,userBalances[i] ]))

}
window.getAllUserBalances = getAllUserBalances

async function test() {    
    const userAddress = await window.signer.getAddress()
    window.allUserIds = await getAllUserBalances(userAddress, window.allUriHandlers)
    await displayAllUserNfts(userAddress)

}
window.test = test