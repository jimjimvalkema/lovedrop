import { IpfsIndexer } from "../../scripts/IpfsIndexer.js";
import { ethers } from "../../scripts/ethers-6.7.0.min.js";
import { NftDisplay } from "../../scripts/NftDisplay.js";
const delay = ms => new Promise(res => setTimeout(res, ms));

// const mainChain = {
//     chainId: "0x1",
//     rpcUrls: ["https://eth.llamarpc.com"],
//     chainName: "Ethereum Mainnet",
//     nativeCurrency: {
//       name: "Ethereum",
//       symbol: "ETH",
//       decimals: 18
//     },
//     //blockExplorerUrls: []
//   }

const mainChain = {
    chainId: "0x7A69",
    rpcUrls: ["http://localhost:8555/"],
    chainName: "local fork Ethereum Mainnet",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18
    },
    //blockExplorerUrls: []
  }


  async function switchNetwork(network=mainChain) {
    try {
        await window.provider.send("wallet_switchEthereumChain",[{ chainId: network.chainId }]);

      } catch (switchError) {
        window.switchError = switchError
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.error && switchError.error.code === 4902) {
          try {
            await window.provider.send("wallet_addEthereumChain",[network]);

          } catch (addError) {
            // handle "add" error
          }
        }
        // handle other "switch" errors
      }

}

async function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}

async function connectProvider() {
    
    if (window.ethereum) {
        await switchNetwork(mainChain)
        window.provider = new  ethers.BrowserProvider(window.ethereum);
    } else {
        console.log("couldn't connect to window.ethereum using a external rpc")
        const providerUrls = ["https://mainnet.infura.io/v3/", "https://eth.llamarpc.com"]
        const workingProviderUrl = await getFirstAvailableProvider(providerUrls)
        console.log(workingProviderUrl)
        window.provider = new ethers.JsonRpcProvider(workingProviderUrl)
    }

}


async function getFirstAvailableProvider(providerUrls) {
    const isWorkingProvider = await Promise.all(providerUrls.map((url) => isProviderAvailable(url)))
    return providerUrls[isWorkingProvider.indexOf(true)]

}

async function isProviderAvailable(url) {
    try {
        const testProvider = new  ethers.JsonRpcProvider(url)
        await testProvider.getNetwork()
        return true
    } catch (error) {
        console.warn(`couldnt connect to ${url}`)
        console.warn(error)
        return false
    }
}

function message(message) {
    console.log(message);
    document.getElementById("message").innerText = message;
}


async function isClaimed(nftAddr, id) {
    if (id in window.isClaimedCache[nftAddr]) {
        return window.isClaimedCache[nftAddr][id]
    } else {
        window.isClaimedCache[nftAddr][id] = await window.mildayDropContract.isClaimed(nftAddr, id)
        return window.isClaimedCache[nftAddr][id]
    }
}

async function getClaimableStatus(allIds, eligableIdsAmounts, nftAddr) {
    const eligableUserIdsAmountsEntries = Object.entries(eligableIdsAmounts).filter((x) => allIds.indexOf(x[0]) !== -1)

    message(`checking ${eligableUserIdsAmountsEntries.length} ids claimed status`)
    //eligable ids, returns true if its already claimed 
    let isIdClaimedArr = []
    const chunkSize = 50;
    try {
        for (let i = 0; i < eligableUserIdsAmountsEntries.length; i += chunkSize) {
            const chunk = eligableUserIdsAmountsEntries.slice(i, i + chunkSize);
            const isIdClaimedArrPromise = chunk.map((x) => isClaimed(nftAddr, x[0]))
            isIdClaimedArr = [...isIdClaimedArr, ...(await Promise.all(isIdClaimedArrPromise))]
            message(`checked ${i + chunkSize} out of ${eligableUserIdsAmountsEntries.length} ids claimed status`)
        }
    } catch (error) {

        message(`got a error try running in a normal browser without metamask/inject ethereum \n error: ${error}`)
        return 0

    }
    message("")

    const isIdClaimedObj = Object.fromEntries(eligableUserIdsAmountsEntries.map((x, index) => [x[0], isIdClaimedArr[index]]))

    //all eligible ids
    const eligibleIds = Object.keys(eligableIdsAmounts)

    //seperate already claimed ids vs unclaimed from all eligable ids 
    const claimableUserIds = Object.fromEntries(eligableUserIdsAmountsEntries.filter((x) => isIdClaimedObj[x[0]] === false))
    const allClaimedUserIds = Object.fromEntries(eligableUserIdsAmountsEntries.filter((x) => isIdClaimedObj[x[0]] === true))

    //filter out all ids that never were eligable and set their amounts to 0
    const ineligibleUserIds = Object.fromEntries((allIds.filter((x) => eligibleIds.indexOf(x) === -1)).map((x) => [x, 0]))

    //result
    const idsByClaimableStatus = { ["claimable"]: claimableUserIds, ["claimed"]: allClaimedUserIds, ["ineligible"]: ineligibleUserIds }
    return idsByClaimableStatus
}

async function displayTokens(id, nftDisplay) {
    let d = document.createElement("div");
    const amount = getAmountAirdrop(id, nftDisplay.collectionAddress)
    d.innerText = `${new Intl.NumberFormat('en-EN').format(amount)} ${await window.ticker}`
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


// function makeIntoDivs(parentId, childIds) {
//     let parentElement = document.getElementById(parentId)
//     for (const childId of childIds) {
//         let childDiv = document.createElement("div");
//         childDiv.id = childId
//         childDiv.style.paddingTop = "1.5em"
//         parentElement.appendChild(childDiv)
//     }

//     return parentElement
// }

function getAmountAirdrop(id, collectionAddress) {
    if (id in window.idsPerCollection[collectionAddress]) {
        const amount = ethers.formatEther(window.idsPerCollection[collectionAddress][id])
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
        child.innerHTML = ""
        parent.remove(child)
    }
}
window.removeAllChildNodes = removeAllChildNodes



async function displayNfts(nftAddress = null) {
    if (!nftAddress) {
        nftAddress = window.allNftAddresses[0]
    }

    window.currentNft = nftAddress

    if (nftAddress in window.nftDisplays) {
        await window.nftDisplays[nftAddress].createDisplay()
        return 0
    }

    let loadingDiv = document.createElement("div")
    let targetDomElement = document.getElementById(`nfts`)
    //if (targetDomElement) {targetDomElement.childNodes.forEach((child)=>removeAllChildNodes(child))  }
    loadingDiv.innerText = "loading"
    loadingDiv.id = "loading"
    targetDomElement.append(loadingDiv)
    const displayElement = document.getElementById("nfts")

    let display
    if (window.nftDisplays[nftAddress]) {
        display = window.nftDisplays[nftAddress]
    } else {
        display = new NftDisplay({
            "collectionAddress": nftAddress,
            "provider": window.provider,
            "displayElement": displayElement,
            "ids": [],
            "ipfsGateway": window.ipfsGateway,
            "landscapeOrientation": { ["rowSize"]: 7, ["amountRows"]: 2 },
            "portraitOrientation": { ["rowSize"]: 4, ["amountRows"]: 5 }
        })
        await display.setCollectionAddress(nftAddress)
        await display.showAttributes()
        window.nftDisplays[nftAddress] = display



    }

    //empty the element if it already exist (incase user connects a new wallet)


    //display amount of token recieved
    //const onclickToBuy = (id, display)=>window.open(`https://pro.opensea.io/nft/ethereum/${display.collectionAddress}/${id}`).focus()
    //display.imgOnclickFunction = onclickToBuy
    //display.divFunctions.push(nftImagesFilter)
    //display.divFunctions.push(clickToBuyMessage)
    display.divFunctions.push(displayTokens)
    display.displayNames({ redirect: true })
    const eligibleIds = Object.keys(window.idsPerCollection[window.currentNft])

    //process user ids
    //window.idsByClaimableStatus[nftAddress] =  await getClaimableStatus(allIds, window.idsPerCollection[nftAddress], nftAddress)
    //const {claimable, claimed, ineligible} = window.idsByClaimableStatus[nftAddress]
    display.ids = sortIdsByEligibility(eligibleIds, display.collectionAddress)

    //display nfts
    await display.createDisplay()
    loadingDiv.remove()
    //window.nftDisplays.push(display)

    document.getElementById("collectionSelect").value = window.currentNft
    await Promise.all(window.optionsResult)
    document.getElementById("collectionSelect").value = window.currentNft

    return targetDomElement
}
window.displayNfts = displayNfts

async function getTicker(mildayDropContract, ER20ABI) {
    window.airdropTokenContract = new ethers.Contract(await mildayDropContract.airdropTokenAddress(), ER20ABI, window.provider)
    const ticker = window.airdropTokenContract.symbol()
    return ticker

}

function getTotalDrop() {
    let total = 0n
    for (const address in window.idsPerCollection) {
        const collection = window.idsPerCollection[address]
        const totalFromCollection = Object.keys(collection).reduce(
            (total, id) => {
                return total + (BigInt(collection[id]))
            },
            0n
        )
        total = total + (totalFromCollection)
    }
    return ethers.formatEther(total.toString())
}

async function addDropTokenToMetamaskButton() {
    const ticker = await window.ticker
    let addToMetaMaskButton = document.createElement("button")
    addToMetaMaskButton.innerText = `add to metamask`
    addToMetaMaskButton.style.fontSize = "1em"
    addToMetaMaskButton.onclick = () => addTokenToMetamask(window.airdropTokenContract.target, ticker, 18)
    return addToMetaMaskButton
}

async function addTokenToMetamask(tokenAddress, tokenSymbol, tokenDecimals, tokenImage = "") {
    //TODO get image from drop info from ipfs or somewhere else?
    if (await window.ticker === "CAKE") {
        tokenImage = "https://ipfs.io/ipfs/QmZZs6Y3ToYRkfMdi3jrU5QXSqNf6vk3j8Dxwvtf55vKvw"
    }

    try {
        // 'wasAdded' is a boolean. Like any RPC method, an error can be thrown.
        const wasAdded = await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20',
                options: {
                    address: tokenAddress, // The address of the token.
                    symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 characters.
                    decimals: tokenDecimals, // The number of decimals in the token.
                    image: tokenImage, // A string URL of the token logo.
                },
            },
        });

    } catch (error) {
        console.log(error);
    }
}

async function loadAllContracts() {
    window.urlVars = await getUrlVars();

    document.getElementById("loading").innerText = "loading"
    document.getElementById("dropInfo").innerHTML = `Claim at: <a href=../claim/?lovedrop=${window.urlVars["lovedrop"]}>claim page</a><br>`
    window.nftDisplays = {}


    if (!window.urlVars["ipfsGateway"]) {
        window.ipfsGateways = ["https://.mypinata.cloud", "http://127.0.0.1:48084", "http://127.0.0.1:8080", "https://ipfs.io"] //no grifting pls thank :)
    } else {
        window.ipfsGateways = [window.urlVars["ipfsGateway"]]
    }
    //abis
    const mildayDropAbi = await (await fetch("../abi/mildayDropAbi.json")).json()//update mildayDropAbi.json
    const ERC721ABI = await (await fetch("../abi/ERC721ABI.json")).json()
    const ER20ABI = await (await fetch("../abi/ERC20ABI.json")).json()

    //miladyDrop Contract
    window.mildayDropContract = new ethers.Contract(window.urlVars["lovedrop"], mildayDropAbi, window.provider)

    //load ipfsIndex
    window.claimDataIpfsHash = await mildayDropContract.claimDataIpfs(); //await window.ipfsIndex.createIpfsIndex(balanceMapJson, splitSize=780);//"bafybeigdvozivwvzn3mrckxeptstjxzvtpgmzqsxbau5qecovlh4r57tci"
    window.ipfsIndex = new IpfsIndexer(window.ipfsGateways, null, true)
    await window.ipfsIndex.loadIndexMiladyDropClaimData(window.claimDataIpfsHash)
    window.ipfsGateway = await window.ipfsIndex.getGatewayUrl()

    //load data from ipfsIndex
    //window.tree = window.ipfsIndex.getTreeDump()
    //loading the tree should also be done here but needs to be done in a worker
    window.idsPerCollection = await window.ipfsIndex.getIdsPerCollection()

    //get all nft contracts
    window.allNftAddresses = Object.keys(window.idsPerCollection)
    displayNfts()
    document.getElementById("loading").innerText = ""
    document.getElementById("dropInfo").append("loading")
    window.optionsResult = window.allNftAddresses.map(address => addToContractSelecter(address, ERC721ABI, window.provider));
    window.isClaimedCache = Object.fromEntries(allNftAddresses.map((x) => [x, {}]))
    window.selectedIds = {}

    //window.allEligibleIds = window.ipfsIndex.getIdsPerCollection()
    //window.nftDisplays =Object.fromEntries(allNftAddresses.map((nftAddr) => [nftAddr,new NftDisplay(nftAddr, window.provider, `nftDisplay-${nftAddr}`, [], window.ipfsGateways)]))

    window.ticker = getTicker(mildayDropContract, ER20ABI)
    await window.ticker
    let dropInfo = document.getElementById("dropInfo")
    let totalSupply = (await window.airdropTokenContract).totalSupply()
    const dropTokenName = (await window.airdropTokenContract).name()
    const dropSize = getTotalDrop()
    totalSupply = ethers.formatEther((await totalSupply).toString())
    dropInfo.innerHTML = `<span class="titel">${await dropTokenName}</span> <br> <br>
    Airdrop size: ${new Intl.NumberFormat('en-EN').format(dropSize)} ${await window.ticker} <br>
    Total supply: ${new Intl.NumberFormat('en-EN').format(await totalSupply)} ${await window.ticker}<br>
    ${await window.ticker} on etherscan: <a href="https://etherscan.io/token/${window.airdropTokenContract.target}">${window.airdropTokenContract.target}</a><br>
    Claim at: <a href=../claim/?lovedrop=${window.urlVars["lovedrop"]}>claim page</a> <br>
    `
    dropInfo.insertBefore(await addDropTokenToMetamaskButton(), dropInfo.childNodes[3]);
    document.getElementById("loading").innerText = ""
}
window.loadAllContracts = loadAllContracts


async function addToContractSelecter(address, ERC721ABI, provider) {
    const contract = new ethers.Contract(address, ERC721ABI, provider)
    const option = document.createElement("option");
    option.value = address
    option.text = await contract.name()
    //option.className = "selectCollection"
    document.getElementById("collectionSelect").add(option)
    //document.getElementById("collectionSelect").value = window.currentNft
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
    await connectProvider()
    document.getElementById("editFilterButton").onclick = () => toggleShow("filter")
    console.log("hi :)")
    await loadAllContracts()
}

window.onload = runOnLoad;

const showEligible = document.querySelector("#showEligible");
const showClaimed = document.querySelector("#showClaimed");
const showUnclaimed = document.querySelector("#showUnclaimed");
const showAll = document.querySelector("#showAll");
const displayId = document.querySelector("#displayId")
//TODO switch to getElementById?

const idInput = document.getElementById("idInput")
idInput.onchange = displayIdinputId

async function displayIdinputId() {
    if (displayId.checked) {
        const id = idInput.value
        const currentDisplay = window.nftDisplays[window.currentNft]
        currentDisplay.ids = [id]
        currentDisplay.refreshPage()
    }
}

displayId.addEventListener("change", () => {
    if (displayId.checked) {
        showUnclaimed.checked = false;
        showClaimed.checked = false;
        showEligible.checked = false;
        showAll.checked = false;

        const id = idInput.value
        const currentDisplay = window.nftDisplays[window.currentNft]
        currentDisplay.ids = [id]
        currentDisplay.refreshPage()

    } else {
        displayId.checked = true
    }
});

function displayEligibleIds() {
    let currentDisplay = window.nftDisplays[window.currentNft]
    const eligibleIds = Object.keys(window.idsPerCollection[window.currentNft])
    currentDisplay.ids = sortIdsByEligibility(eligibleIds, window.currentNft)
    currentDisplay.refreshPage()

}


showEligible.addEventListener("change", () => {
    if (showEligible.checked) {
        displayEligibleIds()

        showEligible.checked = true;
        showUnclaimed.checked = false;
        showClaimed.checked = false;
        showAll.checked = false;
        displayId.checked = false;

    } else {
        showEligible.checked = true
    }
});

showClaimed.addEventListener("change", () => {
    if (showClaimed.checked) {
        showClaimed.checked = true;
        showUnclaimed.checked = false;
        showAll.checked = false;
        showEligible.checked = false;
        displayId.checked = false;
        showClaimedIds()
    } else {
        showClaimed.checked = true
    }
});



async function showUnclaimedIds() {
    let currentDisplay = window.nftDisplays[window.currentNft]
    const eligibleIds = Object.keys(window.idsPerCollection[window.currentNft])
    const { claimable } = await getClaimableStatus(eligibleIds, window.idsPerCollection[window.currentNft], window.currentNft)
    currentDisplay.ids = sortIdsByEligibility(Object.keys(claimable), window.currentNft)
    await currentDisplay.refreshPage()
}

async function showClaimedIds() {
    let currentDisplay = window.nftDisplays[window.currentNft]
    const eligibleIds = Object.keys(window.idsPerCollection[window.currentNft])
    console.log("getting claimed ids")
    const { claimed } = await getClaimableStatus(eligibleIds, window.idsPerCollection[window.currentNft], window.currentNft)
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
        displayId.checked = false;

    } else {
        showUnclaimed.checked = true
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
        displayId.checked = false;

    } else {
        showAll.checked = true
    }
});

document.getElementById("collectionSelect").addEventListener("change", (event) => {
    let currentDisplay = window.nftDisplays[window.currentNft]
    currentDisplay.clear()

    // const eligibleIds = Object.keys(window.idsPerCollection[window.currentNft])
    // currentDisplay.ids = sortIdsByEligibility(eligibleIds, window.currentNft)
    window.currentNft = event.target.value
    //TODO cleaner fix

    if (window.currentNft in window.nftDisplays) {
        let currentDisplay = window.nftDisplays[window.currentNft]
        const eligibleIds = Object.keys(window.idsPerCollection[window.currentNft])
        currentDisplay.ids = sortIdsByEligibility(eligibleIds, window.currentNft)
        currentDisplay.createDisplay()
        //displayEligibleIds()
    } else {
        displayNfts(window.currentNft)
    }

    //currentDisplay.refreshPage()
    showEligible.checked = true;
    showUnclaimed.checked = false;
    showClaimed.checked = false;
    showAll.checked = false;
    displayId.checked = false;
});


// Close the dropdown if the user clicks outside of it
window.onclick = function (event) { //TODO  dropbtn class unique for each dropdown to make sure other dropdowns close when new one apears
    if (!event.target.matches('.dropbtn')) {
        const dropdowns = document.getElementsByClassName("dropdown-content");
        [...dropdowns].forEach((openDropdown) => openDropdown.style.visibility = "hidden")
    }
}