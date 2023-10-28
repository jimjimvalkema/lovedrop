import { NftMetaDataCollector } from "../../scripts/NftMetaDataCollector.js";
import { IpfsIndexer } from "../../scripts/IpfsIndexer.js";
import { ethers } from "../../scripts/ethers-5.2.esm.min.js";
import { MerkleBuilder } from "../../scripts/MerkleBuilder.js"
import { NftDisplay } from "./NftDisplay.js";

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
        window.mildayDropWithSigner = await window.mildayDropContract.connect(signer);
        window.userAddress = await window.signer.getAddress()
        for (const nftAddr of window.allNftAddresses) {
            window.selectedIds[nftAddr] = new Set()
        }
        test();
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


async function selectPage(currentPage, maxPerPage, nftAddr) {
    const nftMetaData = window.metaDataAllNfts.find((x) => x.contractObj.address === nftAddr)
    cancelAllLoadingImages(window.currentPage, maxPerPage, nftMetaData, window.idsByClaimableStatus)
    window.currentPage = currentPage
    window.maxPerPage = maxPerPage

    const idsToDisplay = { [nftAddr]: await buildPage(currentPage, maxPerPage, nftMetaData, window.idsByClaimableStatus) }

    setClaimStatusPage(currentPage, maxPerPage, nftMetaData, window.idsByClaimableStatus, idsToDisplay)

}
window.selectPage = selectPage

function cancelLoadingImage(elementId) {
    console.log(elementId)
    try { document.getElementById(elementId).src = "" } catch (error) { console.log(error) }
}

function cancelAllLoadingImages(currentPage, maxPerPage, nftMetaData, idsByClaimableStatus) {
    const firstItemIndex = currentPage * maxPerPage
    const lastItemIndex = (currentPage + 1) * maxPerPage
    const nftAddr = nftMetaData.contractObj.address
    let ids = [...idsByClaimableStatus[nftAddr].claimable, ...idsByClaimableStatus[nftAddr].claimed, ...idsByClaimableStatus[nftAddr].ineligible]
    for (const id of ids.slice(firstItemIndex, lastItemIndex)) {
        cancelLoadingImage(`image-${nftAddr}-${id}`)
    }
}
async function buildPage(currentPage, maxPerPage, nftMetaData, idsByClaimableStatus) {
    const firstItemIndex = currentPage * maxPerPage
    const lastItemIndex = (currentPage + 1) * maxPerPage
    const nftAddr = await nftMetaData.contractObj.address
    const nftName = await nftMetaData.contractObj.name()
    let imgCrossorigin = "crossorigin='anonymous'"
    if (nftMetaData.extraMetaData.type === "blockedCors") {
        imgCrossorigin = ''
    }

    let ids = [...idsByClaimableStatus[nftAddr].claimable, ...idsByClaimableStatus[nftAddr].claimed, ...idsByClaimableStatus[nftAddr].ineligible]
    const amountPages = Math.ceil(ids.length / maxPerPage)
    const pageSelecter = `
    <button onclick="selectPage(${Math.max(0, currentPage - 1)},${maxPerPage},'${nftAddr}')">prev</button>
    <button onclick="selectPage(${Math.min(amountPages - 1, currentPage + 1)},${maxPerPage},'${nftAddr}')">next</button>
    <button onclick="selectPage(0,${maxPerPage},'${nftAddr}')">first</button>
    <button onclick="selectPage(${amountPages - 1},${maxPerPage},'${nftAddr}')">last</button>
    page: ${currentPage + 1} of: ${amountPages} pages \n</br>`

    const pageInfo = `<div></br><a>${nftName}<a></br><a style="font-size:0.8em ">${nftAddr}</a></div>`
    let collectionHtml = `<div width=100vw id=display-${nftAddr}>${pageInfo}${pageSelecter}`
    //await cancelAllLoadingImages(ids.slice(firstItemIndex, lastItemIndex), nftAddr)

    for (const id of ids.slice(firstItemIndex, lastItemIndex)) {
        const imgUrl = await nftMetaData.getImage(id)
        collectionHtml += `<div id="${nftAddr}-${id}" style="position: relative; border:3px solid green; width: 15%; display: inline-block;" >\n
                    <img ${imgCrossorigin} id="image-${nftAddr}-${id}" src="${imgUrl}" style="max-width: 100%;">\n 
                    <div id="claimableStatus-${nftAddr}-${id}"   style="float: right; position: absolute; left: 0px; bottom: 0px; z-index: 1; background-color: rgba(20, 200, 20, 0.8); padding: 5px; color: #FFFFFF; font-weight: bold;">\n
                        checking rn!\n
                    </div>\n
                </div>\n`

    }
    collectionHtml += "</div>"
    if (document.getElementById(`display-${nftAddr}`)) {
        document.getElementById(`display-${nftAddr}`).innerHTML = collectionHtml

    } else {
        document.getElementById("nftImages").innerHTML += collectionHtml

    }
    return ids
}

async function setClaimStatusPage(currentPage, maxPerPage, nftMetaData, idsByClaimableStatus, idsToDisplay) {
    const nftAddr = nftMetaData.contractObj.address
    const firstItemIndex = currentPage * maxPerPage
    const lastItemIndex = (currentPage + 1) * maxPerPage
    let { claimable, claimed, ineligible } = idsByClaimableStatus[nftAddr]
    let idsClaimableStatusAsObj = { ["claimable"]: [], ["claimed"]: [], ["ineligible"]: [] }
    for (const id of idsToDisplay[nftAddr].slice(firstItemIndex, lastItemIndex)) {
        if (claimable.indexOf(id) !== -1) {
            idsClaimableStatusAsObj["claimable"].push(id)
        } else if (claimed.indexOf(id) !== -1) {
            idsClaimableStatusAsObj["claimed"].push(id)
        } else {
            idsClaimableStatusAsObj["ineligible"].push(id)
        }
    }
    const currentSelectedIds = [...window.selectedIds[nftAddr]].filter((x) => idsClaimableStatusAsObj["claimable"].indexOf(x) !== -1)
    await setIdClaimableStatus(nftAddr, idsClaimableStatusAsObj["claimable"], "claimable")
    setIdClaimableStatus(nftAddr, idsClaimableStatusAsObj["claimed"], "claimed")
    setIdClaimableStatus(nftAddr, idsClaimableStatusAsObj["ineligible"], "ineligible")
    setIdClaimableStatus(nftAddr, currentSelectedIds, "selected")

}

async function displayAllUserNfts(userAddress, metaDataAllNfts = window.metaDataAllNfts, startBlockEventScan = 0) {
    let html = ""
    let collectionHtmlsArr = []
    let allIds = window.allUserIds
    const currentPage = 0
    const maxPerPage = 12
    window.currentPage = currentPage
    window.maxPerPage = maxPerPage
    let idsToDisplay = {}
    for (const i in metaDataAllNfts) {
        const nftMetaData = metaDataAllNfts[i]
        const nftAddr = await nftMetaData.contractObj.address
        if (allUserIds[nftAddr].length === 0) {
            idsToDisplay[nftAddr] = []
            const nftName = await nftMetaData.contractObj.name()
            const pageInfo = `<div></br><a>${nftName}<a></br><a style="font-size:0.8em ">${nftAddr}</a></div>`
            let collectionHtml = `<div style="border-style: solid; border:3px" id=display-${nftAddr}>${pageInfo}\nno nfts found for this wallet :(</div>`
            if (document.getElementById(`display-${nftAddr}`)) {
                document.getElementById(`display-${nftAddr}`).innerHTML = collectionHtml
            } else {
                document.getElementById("nftImages").innerHTML += collectionHtml
            }
        } else {
            const ids = await buildPage(currentPage, maxPerPage, nftMetaData, window.idsByClaimableStatus)

            idsToDisplay[nftAddr] = ids

        }
    }

    for (const nftMetaData of metaDataAllNfts) {
        setClaimStatusPage(currentPage, maxPerPage, nftMetaData, window.idsByClaimableStatus, idsToDisplay)
    }

}
window.displayAllUserNfts = displayAllUserNfts

function toggleUsersChosenIdsToClaim(id) {
    //TODO add remove as function

    if (window.usersChosenIdsToClaim.includes(id)) {
        for (let i = 0; i < window.usersChosenIdsToClaim.length; i++)
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

async function loadMerkleBuilder() {
    console.log("started loading merkle tree")
    if (!window.merkleBuilder) {
        window.merkleBuilder = new MerkleBuilder()

        window.merkleBuilder.loadTreeDump(await window.tree);
    }
    console.log("done loading merkle tree")
    return window.merkleBuilder
}
async function getMultiProof(idsPerNftAddr) {
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

async function claimSelected() {
    const selectedIds = Object.fromEntries(window.nftDisplays.map((x)=>[x.collectionAddress,x.selection]))
    const amountIds = Object.keys(selectedIds).reduce((a, v) => a + selectedIds[v].length, 0)
    if (amountIds > 1) {
        message("loading merkle tree (might take a minute on large drops)")
        if (!window.merkleBuilder) {
            window.merkleBuilder = await new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(loadMerkleBuilder());
                }, 10);
            });
        }
        const { leaves, proof, proofFlags } = await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(getMultiProof(selectedIds));
            }, 10);
        });
        message("done")
        const nftAddresses = leaves.map((x) => ethers.utils.getAddress(x[0]))
        const ids = leaves.map((x) => x[1])
        const amounts = leaves.map((x) => x[2])

        //console.log(`"${JSON.stringify(proof).replaceAll("\"","")}" "${JSON.stringify(proofFlags).replaceAll("\"","")}" "${JSON.stringify(ids).replaceAll("\"","")}" "${JSON.stringify(amounts).replaceAll("\"","")}"  "${JSON.stringify(nftAddresses).replaceAll("\"","")}"`)
        let tx = await mildayDropWithSigner.claimMultiple(proof, proofFlags, ids, amounts, nftAddresses)
        let receipt = await tx.wait(1)
        message("claimed :)")

        window.idsByClaimableStatus = await getClaimableStatus(window.allUserIds, await window.idsPerCollection)
        for (const display of window.nftDisplays) {
            display.clearSelection()
            const CurrentClaimableStatus = window.idsByClaimableStatus[display.collectionAddress]
            display.notSelectable = [...Object.keys(CurrentClaimableStatus.claimed), ...Object.keys(CurrentClaimableStatus.ineligible)]
            display.refreshSelectableDisplay()
        }

    } else {
        const nftAddr = Object.keys(selectedIds).find((x) => selectedIds[x].length)
        console.log(nftAddr)
        console.log(selectedIds)
        const id = [...selectedIds[nftAddr]][0]
        message("fetching proof from ipfs")
        const { amount, proof } = await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(window.ipfsIndex.getProof(nftAddr, id));
            }, 10);
        });
        message("done")
        let tx = await mildayDropWithSigner.claim(proof, id, amount, nftAddr)
        let receipt = await tx.wait(1)
        message("claimed :)")

        window.idsByClaimableStatus = await getClaimableStatus(window.allUserIds, await window.idsPerCollection)
        for (const display of window.nftDisplays) {
            display.clearSelection()
            const CurrentClaimableStatus = window.idsByClaimableStatus[display.collectionAddress]
            display.notSelectable = [...Object.keys(CurrentClaimableStatus.claimed), ...Object.keys(CurrentClaimableStatus.ineligible)]
            display.refreshSelectableDisplay()
        }
    }
}
window.claimSelected = claimSelected

async function isClaimed(nftAddr, id) {
    return await window.mildayDropContract.isClaimed(nftAddr, id)
}

async function setIdClaimableStatus(nftAddr, ids, claimableStatus) {
    for (const id of ids) {
        const elementId = `claimableStatus-${nftAddr}-${id}`
        const rootDivId = `${nftAddr}-${id}`
        let amount = undefined;
        switch (claimableStatus) {
            case "ineligible":
                document.getElementById(elementId).innerText = `not eligible :(`
                document.getElementById(elementId).style.backgroundColor = "rgba(100, 100, 100, 0.8)"
                document.getElementById(rootDivId).style.borderColor = "rgba(100, 100, 100, 0.8)"
                document.getElementById(rootDivId).onclick = ""
                document.getElementById(rootDivId).style.cursor = "default"
                break;
            case "claimed":
                document.getElementById(elementId).innerText = `claimed :/`
                document.getElementById(elementId).style.backgroundColor = "rgba(100, 120, 100, 0.8)"
                document.getElementById(rootDivId).style.borderColor = "rgba(100, 120, 100, 0.8)"
                document.getElementById(rootDivId).onclick = ""
                document.getElementById(rootDivId).style.cursor = "default"
                break;
            case "claimable":
                amount = ethers.utils.formatEther((await window.idsPerCollection)[nftAddr][id])
                document.getElementById(elementId).innerText = `${amount} ${window.ticker}\nclaimable :D`
                document.getElementById(elementId).style.backgroundColor = "rgba(20, 200, 20, 0.8)"
                document.getElementById(rootDivId).style.borderColor = "rgba(20, 200, 20, 0.8)"
                document.getElementById(rootDivId).onclick = function () { toggleClaim(structuredClone(nftAddr), structuredClone(id)) }
                document.getElementById(rootDivId).style.cursor = "pointer"
                break;
            case "selected":
                amount = ethers.utils.formatEther((await window.idsPerCollection)[nftAddr][id])
                document.getElementById(elementId).innerText = `${amount} ${window.ticker}\nselected :0`
                document.getElementById(elementId).style.backgroundColor = "rgba(20, 20, 150, 0.8)"
                document.getElementById(rootDivId).style.borderColor = "rgba(20, 20, 150, 0.8)"
                document.getElementById(rootDivId).onclick = function () { toggleClaim(structuredClone(nftAddr), structuredClone(id)) }
                document.getElementById(rootDivId).style.cursor = "pointer"
                break

            default:
                document.getElementById(elementId).innerText = "uhmm uuuh idk this is a bug";
        }
    }

}


function toggleClaim(nftAddr, id) {
    if (window.selectedIds[nftAddr].has(id)) {
        window.selectedIds[nftAddr].delete(id)
        setIdClaimableStatus(nftAddr, [id], "claimable")
    } else {
        window.selectedIds[nftAddr].add(id)
        setIdClaimableStatus(nftAddr, [id], "selected")
    }
}
window.toggleClaim = toggleClaim

function selectAll() {
    for (const nftDisplay of window.nftDisplays) {
        nftDisplay.selectAll()
    }

}
window.selectAll = selectAll

async function getClaimableStatus(allUserIds = window.allUserIds, allEligableIds=window.idsPerCollection) {
    let idsByClaimableStatus = {}
    for (const nftAddr of Object.keys(allEligableIds)) {
        const eligibleUserIdsEntries = Object.entries(allEligableIds[nftAddr]).filter((x)=>allUserIds[nftAddr].indexOf(x[0])!==-1)
        let isIdClaimed = eligibleUserIdsEntries.map((x) => isClaimed(nftAddr, x[0]))
        isIdClaimed = (await Promise.all(isIdClaimed))
        isIdClaimed = Object.fromEntries(eligibleUserIdsEntries.map((x, index) => [x[0], isIdClaimed[index]]))

        const eligibleIds = Object.keys(allEligableIds[nftAddr])

        const claimableUserIds = Object.fromEntries(eligibleUserIdsEntries.filter((x)=>isIdClaimed[x[0]]===false))
        const allClaimedUserIds = Object.fromEntries(eligibleUserIdsEntries.filter((x)=>isIdClaimed[x[0]]===true))
        const ineligibleUserIds = Object.fromEntries((allUserIds[nftAddr].filter((x)=>eligibleIds.indexOf(x)===-1)).map((x)=>[x,0]))

        idsByClaimableStatus[nftAddr] = { ["claimable"]: claimableUserIds, ["claimed"]: allClaimedUserIds, ["ineligible"]: ineligibleUserIds }
    }
    return idsByClaimableStatus
}
window.getClaimableStatus = getClaimableStatus


async function getAllUserBalances(userAddress = window.userAddress, metaDataAllNfts) {
    let userBalances = []
    let nftAddrs = []
    if (!metaDataAllNfts) {
        metaDataAllNfts = await window.metaDataAllNfts
    }
    for (const nftMetaData of (await window.metaDataAllNfts)) {
        nftAddrs.push(nftMetaData.contractObj.address)
        userBalances.push(nftMetaData.getIdsOfowner(userAddress, 13090020)) //TODO!!! very bad assumption that milady is the first nft ever :p
    }

    userBalances = await Promise.all(userBalances)
    return Object.fromEntries(nftAddrs.map((x, i) => [x, userBalances[i].map((x)=>x.toString())]))

}
window.getAllUserBalances = getAllUserBalances

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
    const ERC721ABI = await (await fetch("../abi/ERC721ABI.json")).json()
    const ER20ABI = await (await fetch("../abi/ERC20ABI.json")).json()

    //miladyDrop Contract
    window.mildayDropContract = new ethers.Contract(window.urlVars["lovedrop"], mildayDropAbi, window.provider);
    window.airdropTokenContract = new ethers.Contract(await mildayDropContract.airdropTokenAddress(), ER20ABI, window.provider)
    window.ticker = await window.airdropTokenContract.symbol()


    //load ipfs data
    window.claimDataIpfsHash = await mildayDropContract.claimDataIpfs(); //await window.ipfsIndex.createIpfsIndex(balanceMapJson, splitSize=780);//"bafybeigdvozivwvzn3mrckxeptstjxzvtpgmzqsxbau5qecovlh4r57tci"
    window.ipfsIndex = new IpfsIndexer(window.ipfsGateway, null, true)
    await window.ipfsIndex.loadIndexMiladyDropClaimData(window.claimDataIpfsHash)

    //get all nft contracts
    window.allNftAddresses = await window.ipfsIndex.getAllNftAddrs()
    window.selectedIds = {}
    for (const nftAddr of window.allNftAddresses) {
        window.selectedIds[nftAddr] = new Set()
    }
    //window.allEligibleIds = window.ipfsIndex.getIdsPerCollection()
    window.metaDataAllNfts = allNftAddresses.map((address) => new NftMetaDataCollector(address, window.provider, window.ipfsGateway))
    window.tree = window.ipfsIndex.getTreeDump()
    connectSigner()

    window.idsPerCollection = await window.ipfsIndex.getIdsPerCollection()
}
window.loadAllContracts = loadAllContracts

function displayTokens(id, nftDisplay) {
    let amount = "";
    let d = document.createElement("div");
    d.style = "position: absolute; float: top-right; top: 0px; right: 0px; font-size:1.4em; font-weight: bold; -webkit-text-fill-color: #ffffff; -webkit-text-stroke-width: 0.06em; -webkit-text-stroke-color: #000000;";
    if (id in window.idsPerCollection[nftDisplay.collectionAddress]) {
        amount = ethers.utils.formatEther(window.idsPerCollection[nftDisplay.collectionAddress][id])
        d.innerText =  `${amount} ${window.ticker}`
        if (id in window.idsByClaimableStatus[nftDisplay.collectionAddress].claimed) {
            d.style.textDecoration = "line-through"
        }
    } else {
        return ""
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

async function test() {



    window.allUserIds = await getAllUserBalances(await window.userAddress, await window.metaDataAllNfts)
    window.idsByClaimableStatus = await getClaimableStatus(window.allUserIds, await window.idsPerCollection)
    window.sortedUserIds = Object.fromEntries(Object.entries(window.idsByClaimableStatus).map(
        (x)=>
            [
                x[0], 
                [
                    ...Object.keys(x[1].claimable),
                    ...Object.keys(x[1].claimed),
                    ...Object.keys(x[1].ineligible),
                ]
            ]
        ))


    //await displayAllUserNfts(userAddress)
    const nftAddresses = Object.keys(await window.idsPerCollection)
    const nftDisplayElementIds = nftAddresses.map((x)=>`nftDisplay-${x}`)
    makeIntoDivs("test", nftDisplayElementIds)

    window.nftDisplays = nftAddresses.map((nftAddress)=> new NftDisplay(nftAddress, window.provider, `nftDisplay-${nftAddress}`, window.sortedUserIds[nftAddress]))
    for (const display of nftDisplays) {
        display.divFunctions.push(displayTokens)
        await display.createDisplay()
        const CurrentClaimableStatus = window.idsByClaimableStatus[display.collectionAddress]
        display.notSelectable = [...Object.keys(CurrentClaimableStatus.claimed), ...Object.keys(CurrentClaimableStatus.ineligible)]
        display.makeAllSelectable()


    }
}
window.test = test
