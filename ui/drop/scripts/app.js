import { IpfsIndexer } from "../../scripts/IpfsIndexer.js";
import { ethers } from "../../scripts/ethers-5.2.esm.min.js";
import { NftDisplay } from "../../scripts/NftDisplay.js";

async function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}

if (window.ethereum) {
    window.provider = new ethers.providers.Web3Provider(window.ethereum);
} else {
    console.log("couldn't connect to inject ethereum provider, connecting to external provicer")
    window.provider = new ethers.providers.JsonRpcProvider('https://eth.llamarpc.com');
}


async function isClaimed(nftAddr, id) {
    return await window.mildayDropContract.isClaimed(nftAddr, id)
}

//TODO do on all ids not user ids
async function getClaimableStatus(allIds ,eligableIdsAmounts, nftAddr) {
    const eligableIdsAmountsEntries = Object.entries(eligableIdsAmounts)

    //eligable ids, returns true if its already claimed 
    //TODO do per page since doing a entire 10k collection can take forever
    let isIdClaimed = eligableIdsAmountsEntries.map((x) => isClaimed(nftAddr, x[0]))
    isIdClaimed = (await Promise.all(isIdClaimed))
    isIdClaimed = Object.fromEntries(eligableIdsAmountsEntries.map((x, index) => [x[0], isIdClaimed[index]]))

    //all eligible ids
    const eligibleIds = Object.keys(eligableIdsAmounts)

    //seperate already claimed ids vs unclaimed from all eligable ids 
    const claimableUserIds = Object.fromEntries(eligableIdsAmountsEntries.filter((x)=>isIdClaimed[x[0]]===false))
    const allClaimedUserIds = Object.fromEntries(eligableIdsAmountsEntries.filter((x)=>isIdClaimed[x[0]]===true))
    
    //filter out all ids that never were eligable and set their amounts to 0
    const ineligibleUserIds = Object.fromEntries((allIds.filter((x)=>eligibleIds.indexOf(x)===-1)).map((x)=>[x,0]))

    //result
    const idsByClaimableStatus = { ["claimable"]: claimableUserIds, ["claimed"]: allClaimedUserIds, ["ineligible"]: ineligibleUserIds }
    return idsByClaimableStatus
}
window.getClaimableStatus = getClaimableStatus

async function displayTokens(id, nftDisplay) {
    let d = document.createElement("div");
    const amount = getAmountAirdrop(id, nftDisplay.collectionAddress)
    d.innerText =  `${amount} ${window.ticker}`
    d.className = "tokenDisplay"
    if (amount > 0) {
        //TODO cache isclaimed result
        //has to be done per page because default metamask rpc is too slow to do all and will error
        if (await isClaimed(nftDisplay.collectionAddress, id)) {
            d.style.textDecoration = "line-through"
        }
    } else {
        //return ""
        d.innerText =  `not eligible :(`
    }
    return d
}

function makeIntoDivs(parentId, childIds) {
    let parentElement = document.getElementById(parentId)
    for (const childId of childIds) {
        let childDiv = document.createElement("div");
        childDiv.id = childId
        childDiv.style.paddingTop = "1.5em"
        parentElement.appendChild(childDiv)
    }

    return parentElement
}

function getAmountAirdrop(id, collectionAddress) {
    if (id in window.idsPerCollection[collectionAddress]) {
        const amount = ethers.utils.formatEther(window.idsPerCollection[collectionAddress][id])
        return amount
    } else {
        return 0
    }

}

function sortIdsByEligibility(ids, collectionAddress) {
    ids.sort((a,b)=> getAmountAirdrop(b, collectionAddress) - getAmountAirdrop(a, collectionAddress) )
    return ids
}

async function displayNfts(nftAddress=window.allNftAddresses[0]) {
    let display
    if(window.nftDisplays[nftAddress]) {
        display = window.nftDisplays[nftAddress]
    } else {
        display = new NftDisplay(nftAddress,window.provider, "nfts",[],window.ipfsGateway)
        window.nftDisplays[nftAddress] = display
        display.amountRows = 3
    }

    //empty the element if it already exist (incase user connects a new wallet)
    let targetDomElement = document.getElementById(`nfts`)
    if(targetDomElement){targetDomElement.innerHTML=""}

    //display amount of token recieved
    display.divFunctions.push(displayTokens)
    const allIds = await display.setIdsToAll()
    console.log(allIds)

    //process user ids
    //window.idsByClaimableStatus[nftAddress] =  await getClaimableStatus(allIds, window.idsPerCollection[nftAddress], nftAddress)
    //const {claimable, claimed, ineligible} = window.idsByClaimableStatus[nftAddress]
    display.ids = sortIdsByEligibility(display.ids, display.collectionAddress)

    //display nfts
    await display.createDisplay()
    //window.nftDisplays.push(display)

    return targetDomElement
}
window.displayNfts = displayNfts

async function loadAllContracts() {
    window.nftDisplays = {}
    window.idsByClaimableStatus = {}

    window.urlVars = await getUrlVars();
    window.ipfsGateway = window.urlVars["ipfsGateway"]
    if (!window.ipfsGateway) {
        window.ipfsGateway = "http://127.0.0.1:48084" //no grifting pls thank :)
    }

    //abis
    const mildayDropAbi = await (await fetch("../abi/mildayDropAbi.json")).json()//update mildayDropAbi.json
    //const ERC721ABI = await (await fetch("../abi/ERC721ABI.json")).json()
    const ER20ABI = await (await fetch("../abi/ERC20ABI.json")).json()

    //miladyDrop Contract
    window.mildayDropContract = new ethers.Contract(window.urlVars["lovedrop"], mildayDropAbi, window.provider)

    //load ipfsIndex
    window.claimDataIpfsHash = await mildayDropContract.claimDataIpfs(); //await window.ipfsIndex.createIpfsIndex(balanceMapJson, splitSize=780);//"bafybeigdvozivwvzn3mrckxeptstjxzvtpgmzqsxbau5qecovlh4r57tci"
    window.ipfsIndex = new IpfsIndexer(window.ipfsGateway, null, true)
    await window.ipfsIndex.loadIndexMiladyDropClaimData(window.claimDataIpfsHash)

    //load data from ipfsIndex
    //window.tree = window.ipfsIndex.getTreeDump()
    //loading the tree should also be done here but needs to be done in a worker
    window.idsPerCollection = await window.ipfsIndex.getIdsPerCollection()

    //get all nft contracts
    window.allNftAddresses = Object.keys(window.idsPerCollection)
    window.selectedIds = {}

    //window.allEligibleIds = window.ipfsIndex.getIdsPerCollection()
    //window.nftDisplays =Object.fromEntries(allNftAddresses.map((nftAddr) => [nftAddr,new NftDisplay(nftAddr, window.provider, `nftDisplay-${nftAddr}`, [], window.ipfsGateway)]))

    window.airdropTokenContract = new ethers.Contract(await mildayDropContract.airdropTokenAddress(), ER20ABI, window.provider)
    window.ticker = await window.airdropTokenContract.symbol()
}
window.loadAllContracts = loadAllContracts

async function runOnLoad() {
    await loadAllContracts()
    displayNfts(window.allNftAddresses[3])
}
window.onload = runOnLoad;