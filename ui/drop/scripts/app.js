import { IpfsIndexer } from "../../scripts/IpfsIndexer.js";
import { ethers } from "../../scripts/ethers-5.2.esm.min.js";
import { NftDisplay } from "../../scripts/NftDisplay.js";
const delay = ms => new Promise(res => setTimeout(res, ms));

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
    console.log("couldn't connect to inject ethereum provider, connecting to external provider")
    window.provider = new ethers.providers.JsonRpcProvider("https://eth.llamarpc.com")// //be nice pls :)
}


async function isClaimed(nftAddr, id) {
    if (id in window.isClaimedCache[nftAddr]) {
        return window.isClaimedCache[nftAddr][id]
    } else {
        window.isClaimedCache[nftAddr][id] = await window.mildayDropContract.isClaimed(nftAddr, id)
        return window.isClaimedCache[nftAddr][id]
    }
}

function message(message) {
    console.log(message);
    document.getElementById("message").innerText = message;
}

//TODO do on all ids not user ids
async function getClaimableStatus(allIds, eligableIdsAmounts, nftAddr) {
    const eligableIdsAmountsEntries = Object.entries(eligableIdsAmounts)

    message(`checking ${eligableIdsAmountsEntries.length} ids claimed status`)
    //eligable ids, returns true if its already claimed 
    let isIdClaimedArr = []
    const chunkSize = 100;
    for (let i = 0; i < eligableIdsAmountsEntries.length; i += chunkSize) {

        const chunk = eligableIdsAmountsEntries.slice(i, i + chunkSize);
        const isIdClaimedArrPromise = chunk.map((x) => isClaimed(nftAddr, x[0]))
        isIdClaimedArr = [isIdClaimedArr, ...(await Promise.all(isIdClaimedArrPromise))]
        message(`checked ${i+chunkSize} out of ${eligableIdsAmountsEntries.length} ids claimed status`)
    }
    message("")

    let isIdClaimed = eligableIdsAmountsEntries.map((x) => isClaimed(nftAddr, x[0]))
    isIdClaimed = (await Promise.all(isIdClaimed))
    isIdClaimed = Object.fromEntries(eligableIdsAmountsEntries.map((x, index) => [x[0], isIdClaimed[index]]))

    //all eligible ids
    const eligibleIds = Object.keys(eligableIdsAmounts)

    //seperate already claimed ids vs unclaimed from all eligable ids 
    const claimableUserIds = Object.fromEntries(eligableIdsAmountsEntries.filter((x) => isIdClaimed[x[0]] === false))
    const allClaimedUserIds = Object.fromEntries(eligableIdsAmountsEntries.filter((x) => isIdClaimed[x[0]] === true))

    //filter out all ids that never were eligable and set their amounts to 0
    const ineligibleUserIds = Object.fromEntries((allIds.filter((x) => eligibleIds.indexOf(x) === -1)).map((x) => [x, 0]))

    //result
    const idsByClaimableStatus = { ["claimable"]: claimableUserIds, ["claimed"]: allClaimedUserIds, ["ineligible"]: ineligibleUserIds }
    return idsByClaimableStatus
}
window.getClaimableStatus = getClaimableStatus

async function displayTokens(id, nftDisplay) {
    let d = document.createElement("div");
    const amount = getAmountAirdrop(id, nftDisplay.collectionAddress)
    d.innerText = `${amount} ${await window.ticker}`
    d.className = "tokenDisplay"
    if (amount > 0) {
        //TODO cache isclaimed result
        //has to be done per page because default metamask rpc is too slow to do all and will error
        if (await isClaimed(nftDisplay.collectionAddress, id)) {
            d.style.textDecoration = "line-through"
            d.style.textDecorationThickness = "0.18em";
        }
    } else {
        //return ""
        d.innerText = `nothing :(`
    }
    return d
}

function clickToBuyMessage(id, nftDisplay) {
    let div = document.createElement("div")
    div.innerText = "Buy on OpenSeaPro"//
    //div.onclick = function BuyOnOpenSeaPro() {window.open(`${baseUrl}/${nftDisplay.collectionAddress}/${id}`, '_blank').focus()}
    div.className = "clickToBuy"
    return div
}

function nftImagesFilter(id, nftDisplay) {
    let div = document.createElement("div")
    div.className = "nftImagesFilter"
    return div
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
    ids.sort((a, b) => getAmountAirdrop(b, collectionAddress) - getAmountAirdrop(a, collectionAddress))
    return ids
}

function onclickToBuy(id, display) {
    const baseUrl = "https://pro.opensea.io/nft/ethereum"
    window.open(`${baseUrl}/${display.collectionAddress}/${id}`).focus()

}

function removeAllChildNodes(parent) {
    let childNodes = parent.childNodes
    for (const child of childNodes) {
        removeAllChildNodes(child)
        console.log(child)
        child.innerHTML = ""
        parent.remove(child)
    }
}
window.removeAllChildNodes = removeAllChildNodes



async function displayNfts(nftAddress = null) {



    if (!nftAddress) {
        while (!window.allNftAddresses) {
            await delay(100)
        }
        nftAddress = window.allNftAddresses[0]
        document.getElementById("collectionSelect").value = nftAddress
        console.log(nftAddress)
    }

    window.currentNft = nftAddress

    if (nftAddress in window.nftDisplays) {
        window.nftDisplays[nftAddress].createDisplay()
        return 0
    }

    let loadingDiv = document.createElement("div")
    let targetDomElement = document.getElementById(`nfts`)
    //if (targetDomElement) {targetDomElement.childNodes.forEach((child)=>removeAllChildNodes(child))  }
    loadingDiv.innerText = "loading"
    loadingDiv.id = "loading"
    targetDomElement.append(loadingDiv)

    let display
    if (window.nftDisplays[nftAddress]) {
        display = window.nftDisplays[nftAddress]
    } else {
        console.log(window.ipfsGateway)
        display = new NftDisplay(nftAddress, window.provider, "nfts", [], window.ipfsGateway)
        window.nftDisplays[nftAddress] = display
        display.amountRows = 3
    }

    //empty the element if it already exist (incase user connects a new wallet)


    //display amount of token recieved
    //const onclickToBuy = (id, display)=>window.open(`https://pro.opensea.io/nft/ethereum/${display.collectionAddress}/${id}`).focus()
    display.imgOnclickFunction = onclickToBuy
    display.divFunctions.push(nftImagesFilter)
    display.divFunctions.push(clickToBuyMessage)
    display.divFunctions.push(displayTokens)
    display.displayNames()
    const eligibleIds = Object.keys(window.idsPerCollection[window.currentNft])

    //process user ids
    //window.idsByClaimableStatus[nftAddress] =  await getClaimableStatus(allIds, window.idsPerCollection[nftAddress], nftAddress)
    //const {claimable, claimed, ineligible} = window.idsByClaimableStatus[nftAddress]
    display.ids = sortIdsByEligibility(eligibleIds, display.collectionAddress)

    //display nfts
    await display.createDisplay()
    loadingDiv.remove()
    //window.nftDisplays.push(display)

    return targetDomElement
}
window.displayNfts = displayNfts

async function getTicker(mildayDropContract, ER20ABI) {
    window.airdropTokenContract = new ethers.Contract(await mildayDropContract.airdropTokenAddress(), ER20ABI, window.provider)
    const ticker = window.airdropTokenContract.symbol()
    return ticker

}

async function loadAllContracts() {
    window.nftDisplays = {}

    window.urlVars = await getUrlVars();
    window.ipfsGateway = window.urlVars["ipfsGateway"]
    if (!window.ipfsGateway) {
        window.ipfsGateway = "http://127.0.0.1:48084" //no grifting pls thank :)
    }

    //abis
    const mildayDropAbi = await (await fetch("../abi/mildayDropAbi.json")).json()//update mildayDropAbi.json
    const ERC721ABI = await (await fetch("../abi/ERC721ABI.json")).json()
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
    window.optionsResult = window.allNftAddresses.map(address => addToContractSelecter(address, ERC721ABI, window.provider));
    window.isClaimedCache = Object.fromEntries(allNftAddresses.map((x) => [x, {}]))
    window.selectedIds = {}

    //window.allEligibleIds = window.ipfsIndex.getIdsPerCollection()
    //window.nftDisplays =Object.fromEntries(allNftAddresses.map((nftAddr) => [nftAddr,new NftDisplay(nftAddr, window.provider, `nftDisplay-${nftAddr}`, [], window.ipfsGateway)]))

    window.ticker = getTicker(mildayDropContract, ER20ABI)
}
window.loadAllContracts = loadAllContracts


async function addToContractSelecter(address, ERC721ABI, provider) {
    const contract = new ethers.Contract(address, ERC721ABI, provider)
    const option = document.createElement("option");
    option.value = address
    option.text = await contract.name()
    document.getElementById("collectionSelect").add(option)
    return option
}

function toggleShow(elementId) {
    const element = document.getElementById(elementId)
    if (element.style.visibility === "hidden") {
        element.style.visibility = "visible"
    } else {
        element.style.visibility = "hidden"
    }
}

async function runOnLoad() {
    document.getElementById("editFilterButton").onclick = ()=>toggleShow("filter")
    document.getElementById("filter").onchange = (value) =>console.log("value")
    console.log("hi :)")
    loadAllContracts()
    displayNfts()
}

window.onload = runOnLoad;

const showEligible = document.querySelector("#showEligible");
const showClaimed = document.querySelector("#showClaimed");
const showUnclaimed = document.querySelector("#showUnclaimed");
const showAll = document.querySelector("#showAll");



showEligible.addEventListener("change", () => {
    if (showEligible.checked) {
        let currentDisplay = window.nftDisplays[window.currentNft]
        const eligibleIds = Object.keys(window.idsPerCollection[window.currentNft])
        currentDisplay.ids = sortIdsByEligibility(eligibleIds, window.currentNft)
        currentDisplay.refreshPage()

        showEligible.checked = true;
        showUnclaimed.checked = false;
        showClaimed.checked = false;
        showAll.checked = false;

    }
});

showClaimed.addEventListener("change", () => {
    if (showClaimed.checked) {
        showClaimed.checked = true;
        showUnclaimed.checked = false;
        showAll.checked = false;
        showEligible.checked = false;
        showClaimedIds()
    }
});



async function showUnclaimedIds() {
    let currentDisplay = window.nftDisplays[window.currentNft]
    const eligibleIds = Object.keys(window.idsPerCollection[window.currentNft])
    const {claimable} = await getClaimableStatus(eligibleIds,window.idsPerCollection[window.currentNft],window.currentNft)
    currentDisplay.ids = sortIdsByEligibility(Object.keys(claimable), window.currentNft)
    await currentDisplay.refreshPage()
}

async function showClaimedIds() {
    let currentDisplay = window.nftDisplays[window.currentNft]
    const eligibleIds = Object.keys(window.idsPerCollection[window.currentNft])
    console.log("getting claimed ids")
    const {claimed} = await getClaimableStatus(eligibleIds,window.idsPerCollection[window.currentNft],window.currentNft)
    console.log("sorting claimed ids")
    currentDisplay.ids = sortIdsByEligibility(Object.keys(claimed), window.currentNft)
    console.log("refreshing")
    await currentDisplay.refreshPage()
    console.log("done")
}

showUnclaimed.addEventListener("change", () => {
    if (showUnclaimed.checked) {
        showUnclaimedIds()
    

        showUnclaimed.checked = true;
        showAll.checked = false;
        showClaimed.checked = false;
        showEligible.checked = false;

    }
});

async function showAllIds() {
    let currentDisplay = window.nftDisplays[window.currentNft]
    const allIds = await currentDisplay.setIdsToAll()
    currentDisplay.ids = sortIdsByEligibility(allIds, window.currentNft)
    currentDisplay.refreshPage()

}

showAll.addEventListener("change", () => {
    if (showAll.checked) {
        showAllIds()
        showUnclaimed.checked = false;
        showClaimed.checked = false;
        showEligible.checked = false;

    }
});

document.getElementById("collectionSelect").addEventListener("change", (event) => {
    let currentDisplay = window.nftDisplays[window.currentNft]
    currentDisplay.clear()

    const eligibleIds = Object.keys(window.idsPerCollection[window.currentNft])
    currentDisplay.ids = sortIdsByEligibility(eligibleIds, window.currentNft)

    displayNfts(event.target.value)
    showEligible.checked = true;
    showUnclaimed.checked = false;
    showClaimed.checked = false;
    showAll.checked = false;
  });


// Close the dropdown if the user clicks outside of it
window.onclick = function (event) { //TODO  dropbtn class unique for each dropdown to make sure other dropdowns close when new one apears
    if (!event.target.matches('.dropbtn')) {
        const dropdowns = document.getElementsByClassName("dropdown-content");
        [...dropdowns].forEach((openDropdown)=>openDropdown.style.visibility="hidden")
    }
}