import { NftMetaDataCollector } from "../../scripts/NftMetaDataCollector.js";
import { IpfsIndexer } from "../../scripts/IpfsIndexer.js";
import { ethers } from "../../scripts/ethers-5.2.esm.min.js";
import { MerkleBuilder } from "../../scripts/MerkleBuilder.js"
import { NftDisplay } from "../../scripts/NftDisplay.js";

// A Web3Provider wraps a standard Web3 provider, which is
// what MetaMask injects as window.ethereum into each page
const provider = new ethers.providers.Web3Provider(window.ethereum)

if (window.ethereum) {
    window.provider = new ethers.providers.Web3Provider(window.ethereum);
} else {
    console.log("couldn't connect to inject ethereum provide, connecting to external provicer")
    window.provider = new ethers.providers.JsonRpcProvider('https://eth.llamarpc.com');
}

function message(message) {
    console.log(message);
    document.getElementById("message").innerText = message;
}
window.message = message

function isWalletConnected() {
    let message = "";
    if (window.signer == null) {
        message = "wallet not connected";
        console.log(message);
        document.getElementById("message").innerHTML = message;
        return false
    } else {
        //document.getElementById("message").innerHTML = message;
        return true;
    }
}
const delay = ms => new Promise(res => setTimeout(res, ms));
async function resolveTillConnected() {
    let amountAccounts = 0
    while (amountAccounts === 0) {
        //await delay(1000)
        const accounts = await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(ethereum.request({ method: 'eth_accounts' }));
            }, 500);
        });
        amountAccounts = accounts.length
    }
}

async function connectSigner() {
    // MetaMask requires requesting permission to connect users accounts
    provider.send("eth_requestAccounts", []);
    window.signer = await provider.getSigner();
    message("please connect wallet :)")
    if (isWalletConnected()) {
        await resolveTillConnected()
        message("")
        window.mildayDropWithSigner = await window.mildayDropContract.connect(window.signer);
        window.userAddress = await window.signer.getAddress()
        displayNfts();
        return [provider, signer];
    }
}
window.connectSigner = connectSigner


async function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}

async function loadMerkleBuilder() {
    console.log("started loading merkle tree")
    if (!window.merkleBuilder) {
        window.merkleBuilder = new MerkleBuilder()
        window.merkleBuilder.loadTreeDump(await window.tree);
    }
    console.log("done loading merkle tree")
    return window.merkleBuilder
}
async function buildMultiProof(idsPerNftAddr) {
    let idsPerNftAddrWithArrays = {}
    Object.keys(idsPerNftAddr).map((x) => idsPerNftAddrWithArrays[x] = [...idsPerNftAddr[x]])
    return (await window.merkleBuilder).getMultiProof(idsPerNftAddrWithArrays)
}

async function clearSelection() {
    for (const nftDisplay of window.nftDisplays) {
        nftDisplay.clearSelection()
    }
}
window.clearSelection = clearSelection

async function LoadTreeAndBuildMultiProof(merkleBuilder,selectedIds) {
    //load merkle tree
    message("loading merkle tree (might take a minute on large drops)")
    if (!merkleBuilder) {
        merkleBuilder = await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(loadMerkleBuilder());
            }, 10);
        });
    }

    //build proof
    const { leaves, proof, proofFlags } = await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(buildMultiProof(selectedIds));
        }, 10);
    });
    message("done")
    const nftAddresses = leaves.map((x) => ethers.utils.getAddress(x[0]))
    const ids = leaves.map((x) => x[1])
    const amounts = leaves.map((x) => x[2])

    return {proof, proofFlags, ids, amounts, nftAddresses}

}

async function fetchSingleProof(ipfsIndex,id,nftAddr) {
    //get proof
    message("fetching proof from ipfs")
    const { amount, proof } = await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(ipfsIndex.getProof(nftAddr, id));
        }, 10);
    });
    message("done")

    return { amount, proof } 
}


async function claimSelected() {
    //get selected ids {nftAddr:[ids]}
    const selectedIdsEntries = window.nftDisplays.map((x)=>[x.collectionAddress,x.selection]).filter((x)=>x[1].length>0)
    const selectedIds = Object.fromEntries(selectedIdsEntries)

    const amountIds = Object.keys(selectedIds).reduce((a, v) => a + selectedIds[v].length, 0)
    if (amountIds > 1) {
        //build multiproof
        const {proof, proofFlags, ids, amounts, nftAddresses} = await LoadTreeAndBuildMultiProof(window.merkleBuilder, selectedIds)

        //submit tx
        let tx = await window.mildayDropWithSigner.claimMultiple(proof, proofFlags, ids, amounts, nftAddresses)
        let receipt = await tx.wait(1)
        message("claimed :)")

        //update display
        const selectedNftDisplays = window.nftDisplays.filter((display)=> nftAddresses.indexOf(display.collectionAddress)!==-1)
        refreshDisplayedItems(selectedNftDisplays)

    } else {
        //get selected item
        const nftAddr = Object.keys(selectedIds).find((x) => selectedIds[x].length)
        const id = selectedIds[nftAddr][0]

        //get proof
        const { amount, proof } = await fetchSingleProof(window.ipfsIndex, id,nftAddr)

        //submit tx
        let tx = await window.mildayDropWithSigner.claim(proof, id, amount, nftAddr)
        console.log("aaaaaaaaaa")
        let receipt = await tx.wait(1)
        message("claimed :)")

        //update display
        const nftDisplay = window.allNftDisplays.find((display) => display.collectionAddress === nftAddr)
        refreshDisplayedItems([nftDisplay])

    }
}
window.claimSelected = claimSelected

async function refreshDisplayedItems(displays) {
    for (const display of displays) {
        console.log(display)
        display.clearSelection()

        const nftAddr = display.collectionAddress
        window.idsByClaimableStatus[nftAddr] =  await getClaimableStatus(display.ids, window.idsPerCollection[nftAddr], nftAddr)
        const {claimable, claimed, ineligible} = window.idsByClaimableStatus[nftAddr]

        display.notSelectable = [...Object.keys(claimed), ...Object.keys(ineligible)]
        
        //re-sort ids
        display.ids = [...Object.keys(claimable), ...Object.keys(claimed), ...Object.keys(ineligible)]
        display.refreshPage()
    }


}

async function isClaimed(nftAddr, id) {
    return await window.mildayDropContract.isClaimed(nftAddr, id)
}

function selectAll() {
    for (const nftDisplay of window.nftDisplays) {
        nftDisplay.selectAll()
    }

}
window.selectAll = selectAll

async function getClaimableStatus(ids, eligableIds, nftAddr) {

    const eligibleUserIdsEntries = Object.entries(eligableIds).filter((x)=>ids.indexOf(x[0])!==-1)
    let isIdClaimed = eligibleUserIdsEntries.map((x) => isClaimed(nftAddr, x[0]))
    isIdClaimed = (await Promise.all(isIdClaimed))
    isIdClaimed = Object.fromEntries(eligibleUserIdsEntries.map((x, index) => [x[0], isIdClaimed[index]]))

    const eligibleIds = Object.keys(eligableIds)

    const claimableUserIds = Object.fromEntries(eligibleUserIdsEntries.filter((x)=>isIdClaimed[x[0]]===false))
    const allClaimedUserIds = Object.fromEntries(eligibleUserIdsEntries.filter((x)=>isIdClaimed[x[0]]===true))
    const ineligibleUserIds = Object.fromEntries((ids.filter((x)=>eligibleIds.indexOf(x)===-1)).map((x)=>[x,0]))

    const idsByClaimableStatus = { ["claimable"]: claimableUserIds, ["claimed"]: allClaimedUserIds, ["ineligible"]: ineligibleUserIds }
    return idsByClaimableStatus
}
window.getClaimableStatus = getClaimableStatus

async function runOnLoad() {
    await loadAllContracts()
}
window.onload = runOnLoad;

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
    window.mildayDropContract = new ethers.Contract(window.urlVars["lovedrop"], mildayDropAbi, window.provider);
    



    //load ipfsIndex
    window.claimDataIpfsHash = await mildayDropContract.claimDataIpfs(); //await window.ipfsIndex.createIpfsIndex(balanceMapJson, splitSize=780);//"bafybeigdvozivwvzn3mrckxeptstjxzvtpgmzqsxbau5qecovlh4r57tci"
    window.ipfsIndex = new IpfsIndexer(window.ipfsGateway, null, true)
    await window.ipfsIndex.loadIndexMiladyDropClaimData(window.claimDataIpfsHash)

    //load data from ipfsIndex
    window.tree = window.ipfsIndex.getTreeDump()
    //loading the tree should also be done here but needs to be done in a worker
    window.idsPerCollection = await window.ipfsIndex.getIdsPerCollection()
    


    //get all nft contracts
    window.allNftAddresses = Object.keys(window.idsPerCollection)
    window.selectedIds = {}

    //window.allEligibleIds = window.ipfsIndex.getIdsPerCollection()
    window.allNftDisplays = allNftAddresses.map((nftAddr) => new NftDisplay(nftAddr, window.provider, `nftDisplay-${nftAddr}`, [], window.ipfsGateway))

    window.airdropTokenContract = new ethers.Contract(await mildayDropContract.airdropTokenAddress(), ER20ABI, window.provider)
    window.ticker = await window.airdropTokenContract.symbol()

    connectSigner()

   
}
window.loadAllContracts = loadAllContracts

function displayTokens(id, nftDisplay) {
    let amount = "";
    let d = document.createElement("div");
    d.className = "tokenDisplay"
    if (id in window.idsPerCollection[nftDisplay.collectionAddress]) {
        amount = ethers.utils.formatEther(window.idsPerCollection[nftDisplay.collectionAddress][id])
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


async function displayNfts() {
    //last thing loadAllContracts() needs to load

    const nftAddresses = Object.keys(await window.idsPerCollection)
    const nftDisplayElementIds = nftAddresses.map((x)=>`nftDisplay-${x}`)
    makeIntoDivs("nfts", nftDisplayElementIds)

    window.nftDisplays = []
    window.idsByClaimableStatus = {}
    document.getElementById("loading").innerText = "loading"
    for (const display of window.allNftDisplays) {
        const nftAddr = display.collectionAddress

        let domElement = document.getElementById(`nftDisplay-${nftAddr}`)
        if(domElement){domElement.innerHTML=""}

        display.divFunctions.push(displayTokens)
        const userIds = (await display.setIdsFromOwner(await window.userAddress))

        window.idsByClaimableStatus[nftAddr] =  await getClaimableStatus(userIds, window.idsPerCollection[nftAddr], nftAddr)

        const {claimable, claimed, ineligible} = window.idsByClaimableStatus[nftAddr]
        display.ids = [...Object.keys(claimable), ...Object.keys(claimed), ...Object.keys(ineligible)]
        display.notSelectable =[...Object.keys(claimed), ...Object.keys(ineligible)]


        await display.createDisplay()
        display.makeAllSelectable()

        window.nftDisplays.push(display)

    }
    document.getElementById("loading").innerText = ""

}
window.test = test
