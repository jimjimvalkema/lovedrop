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
async function getClaimableStatus(ids, eligableIdsAmounts, nftAddr) {
    //get all eligable user ids with amounts
    const eligableUserIdsWithAmountsEntries = Object.entries(eligableIdsAmounts).filter((x)=>ids.indexOf(x[0])!==-1)

    //eligable user ids, returns true if its already claimed 
    let isIdClaimed = eligableUserIdsWithAmountsEntries.map((x) => isClaimed(nftAddr, x[0]))
    isIdClaimed = (await Promise.all(isIdClaimed))
    isIdClaimed = Object.fromEntries(eligableUserIdsWithAmountsEntries.map((x, index) => [x[0], isIdClaimed[index]]))

    //all eligible ids
    const eligibleIds = Object.keys(eligableIdsAmounts)

    //seperate already claimed ids vs unclaimed from all eligable user ids (eligableUserIdsWithAmountsEntries)
    const claimableUserIds = Object.fromEntries(eligableUserIdsWithAmountsEntries.filter((x)=>isIdClaimed[x[0]]===false))
    const allClaimedUserIds = Object.fromEntries(eligableUserIdsWithAmountsEntries.filter((x)=>isIdClaimed[x[0]]===true))
    
    //filter out all user ids that never were eligable and set their amounts to 0
    const ineligibleUserIds = Object.fromEntries((ids.filter((x)=>eligibleIds.indexOf(x)===-1)).map((x)=>[x,0]))

    //result
    const idsByClaimableStatus = { ["claimable"]: claimableUserIds, ["claimed"]: allClaimedUserIds, ["ineligible"]: ineligibleUserIds }
    return idsByClaimableStatus
}
window.getClaimableStatus = getClaimableStatus

function displayTokens(id, nftDisplay) {
    let d = document.createElement("div");
    d.className = "tokenDisplay"
    if (id in window.idsPerCollection[nftDisplay.collectionAddress]) {
        const amount = ethers.utils.formatEther(window.idsPerCollection[nftDisplay.collectionAddress][id])
        d.innerText =  `${amount} ${window.ticker}`
        if (id in window.idsByClaimableStatus[nftDisplay.collectionAddress].claimed) {
            d.style.textDecoration = "line-through"
        }
    } else {
        return ""
        //d.innerText =  `0 ${window.ticker} :(`
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

//display all id not user ids
async function displayNfts() {
    // create the nftDisplay divs
    const nftAddresses = Object.keys(await window.idsPerCollection)
    const nftDisplayElementIds = nftAddresses.map((x)=>`nftDisplay-${x}`)
    makeIntoDivs("nfts", nftDisplayElementIds)

    document.getElementById("loading").innerText = "loading"

    window.nftDisplays = []
    window.idsByClaimableStatus = {}
    for (const display of window.allNftDisplays) {
        const nftAddr = display.collectionAddress

        //empty the element if it already exist (incase user connects a new wallet)
        let domElement = document.getElementById(`nftDisplay-${nftAddr}`)
        if(domElement){domElement.innerHTML=""}

        //display amount of token recieved
        display.divFunctions.push(displayTokens)
        const userIds = (await display.setIdsFromOwner(await window.userAddress))

        //process user ids
        window.idsByClaimableStatus[nftAddr] =  await getClaimableStatus(userIds, window.idsPerCollection[nftAddr], nftAddr)
        const {claimable, claimed, ineligible} = window.idsByClaimableStatus[nftAddr]
        display.ids = [...Object.keys(claimable), ...Object.keys(claimed), ...Object.keys(ineligible)]
        display.notSelectable =[...Object.keys(claimed), ...Object.keys(ineligible)]

        //display nfts
        await display.createDisplay()
        display.makeAllSelectable()
        window.nftDisplays.push(display)
    }
    document.getElementById("loading").innerText = ""
}

async function loadAllContracts() {
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
    window.allNftDisplays = allNftAddresses.map((nftAddr) => new NftDisplay(nftAddr, window.provider, `nftDisplay-${nftAddr}`, [], window.ipfsGateway))

    window.airdropTokenContract = new ethers.Contract(await mildayDropContract.airdropTokenAddress(), ER20ABI, window.provider)
    window.ticker = await window.airdropTokenContract.symbol()
}
window.loadAllContracts = loadAllContracts

async function runOnLoad() {
    await loadAllContracts()
}
window.onload = runOnLoad;