import { uriHandler } from "../../scripts/uriHandler.js";
import { IpfsIndexer } from "../../scripts/IpfsIndexer.js";
import { ethers } from "../../scripts/ethers-5.2.esm.min.js";
import { MerkleBuilder} from "../../scripts/MerkleBuilder.js"
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
        window.mildayDropWithSigner = window.mildayDropContract.connect(signer);
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


async function selectPage(currentPage, maxPerPage, nftAddr) {
    const nftHandler = window.allUriHandlers.find((x)=>x.contractObj.address===nftAddr)
    const idsToDisplay = {[nftAddr]:await buildPage(currentPage,maxPerPage,nftHandler, window.idsByClaimableStatus )}
    setClaimStatusPage(currentPage,maxPerPage,nftHandler,  window.idsByClaimableStatus, idsToDisplay)

}
window.selectPage = selectPage

async function buildPage(currentPage,maxPerPage,nftHandler, idsByClaimableStatus) {
    const firstItemIndex = currentPage*maxPerPage
    const lastItemIndex = (currentPage+1)*maxPerPage
    const nftAddr = await nftHandler.contractObj.address
    const nftName = await nftHandler.contractObj.name()
    let ids =  [...idsByClaimableStatus[nftAddr].claimable, ...idsByClaimableStatus[nftAddr].claimed, ...idsByClaimableStatus[nftAddr].ineligible]
    const amountPages = Math.ceil(ids.length/maxPerPage)
    const pageSelecter = `
    <button onclick="selectPage(${Math.max(0, currentPage - 1)},${maxPerPage},'${nftAddr}')">prev</button>
    <button onclick="selectPage(${Math.min(amountPages-1, currentPage + 1)},${maxPerPage},'${nftAddr}')">next</button>
    <button onclick="selectPage(0,${maxPerPage},'${nftAddr}')">first</button>
    <button onclick="selectPage(${amountPages-1},${maxPerPage},'${nftAddr}')">last</button>
    page: ${currentPage + 1} of: ${amountPages} pages \n</br>`

    const pageInfo = `<div></br><a>${nftName}<a></br><a style="font-size:0.8em ">${nftAddr}</a></div>`
    let collectionHtml =`<div width=100vw id=display-${nftAddr}>${pageInfo}${pageSelecter}`
    for (const id of ids.slice(firstItemIndex,lastItemIndex)) {
        const imgUrl = await nftHandler.getImage(id)
        collectionHtml +=`<div id="${nftAddr}-${id}" style="position: relative; border:3px solid green; width: 15%; display: inline-block;" >\n
                    <img src="${imgUrl}" style="max-width: 100%;">\n 
                    <div id="claimableStatus-${nftAddr}-${id}"   style="float: right; position: absolute; left: 0px; bottom: 0px; z-index: 1; background-color: rgba(20, 200, 20, 0.8); padding: 5px; color: #FFFFFF; font-weight: bold;">\n
                        checking rn!\n
                    </div>\n
                </div>\n`

    }
    collectionHtml+="</div>"
    if (document.getElementById(`display-${nftAddr}`)) {
        document.getElementById(`display-${nftAddr}`).innerHTML = collectionHtml

    } else {
        document.getElementById("nftImages").innerHTML += collectionHtml

    }
    return ids
}

async function setClaimStatusPage(currentPage,maxPerPage,nftHandler, idsByClaimableStatus, idsToDisplay) {
    const nftAddr = nftHandler.contractObj.address
    const firstItemIndex = currentPage*maxPerPage
    const lastItemIndex = (currentPage+1)*maxPerPage
    let {claimable, claimed, ineligible} = idsByClaimableStatus[nftAddr]
    let idsClaimableStatusAsObj = {["claimable"]:[],["claimed"]:[],["ineligible"]:[]}
    for (const id of idsToDisplay[nftAddr].slice(firstItemIndex,lastItemIndex)) {
        if (claimable.indexOf(id)!==-1){
            idsClaimableStatusAsObj["claimable"].push(id)
        } else if(claimed.indexOf(id)!==-1) {
            idsClaimableStatusAsObj["claimed"].push(id)
        } else {
            idsClaimableStatusAsObj["ineligible"].push( id)
        }
    }
    setIdClaimableStatus(nftAddr, idsClaimableStatusAsObj["claimable"], "claimable")
    setIdClaimableStatus(nftAddr, idsClaimableStatusAsObj["claimed"], "claimed")
    setIdClaimableStatus(nftAddr, idsClaimableStatusAsObj["ineligible"], "ineligible")

}

async function displayAllUserNfts(userAddress, allUriHandlers=window.allUriHandlers,startBlockEventScan=0) {
    let html = ""
    let collectionHtmlsArr = []
    let allIds = window.allUserIds
    const currentPage = 0
    const maxPerPage= 12
    let idsToDisplay = {}
    for (const i in allUriHandlers) {
        const nftHandler = allUriHandlers[i]
        const nftAddr = await nftHandler.contractObj.address

        const ids = await buildPage(currentPage,maxPerPage,nftHandler, window.idsByClaimableStatus)

        idsToDisplay[nftAddr] = ids
    }

    for (const nftHandler of allUriHandlers) {
        setClaimStatusPage(currentPage,maxPerPage,nftHandler, window.idsByClaimableStatus,idsToDisplay)
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
    


    
    //load ipfs data
    const claimDataIpfsHash = await mildayDropContract.claimDataIpfs(); //await window.ipfsIndex.createIpfsIndex(balanceMapJson, splitSize=780);//"bafybeigdvozivwvzn3mrckxeptstjxzvtpgmzqsxbau5qecovlh4r57tci"
    window.ipfsIndex = new IpfsIndexer(window.urlVars["ipfsGateway"],null,true)
    await window.ipfsIndex.loadIndexMiladyDropClaimData(claimDataIpfsHash)

    //get all nft contracts
    window.allNftAddresses = await window.ipfsIndex.getAllNftAddrs()
    window.selectedIds = {}
    for (const nftAddr of window.allNftAddresses) {
        window.selectedIds[nftAddr] = new Set()
    }
    window.allEligibleIds = await window.ipfsIndex.getIdsPerCollection()

    window.allNftContractObjs = allNftAddresses.map((address)=> new ethers.Contract(address, ERC721ABI, window.provider))
    Promise.all(window.allNftContractObjs)
    window.allUriHandlers = window.allNftContractObjs.map((contractObj)=>new uriHandler(contractObj,window.ipfsGateway,true, "../../scripts/extraUriMetaDataFile.json",window.provider ))

    window.treeDump =  window.ipfsIndex.getTreeDump()
}
window.loadAllContracts = loadAllContracts

async function getMultiProof(idsPerNftAddr) {
    if (!window.merkleBuilder) {
        window.merkleBuilder = new MerkleBuilder()
        window.merkleBuilder.loadTreeDump(await window.treeDump)
    }
    let idsPerNftAddrWithArrays = {}
    Object.keys(idsPerNftAddr).map((x)=>idsPerNftAddrWithArrays[x]=[...idsPerNftAddr[x]])
    return window.merkleBuilder.getMultiProof(idsPerNftAddrWithArrays)
}

async function claim() {
    const {leaves,  proof,  proofFlags} =await getMultiProof(window.selectedIds)
    const nftAddresses = leaves.map((x)=>ethers.utils.getAddress(x[0]))
    const ids = leaves.map((x)=>x[1])
    const amounts = leaves.map((x)=>x[2])
    //console.log(`"${JSON.stringify(proof).replaceAll("\"","")}" "${JSON.stringify(proofFlags).replaceAll("\"","")}" "${JSON.stringify(ids).replaceAll("\"","")}" "${JSON.stringify(amounts).replaceAll("\"","")}"  "${JSON.stringify(nftAddresses).replaceAll("\"","")}"`)
    await mildayDropWithSigner.claimMultiple(proof, proofFlags, ids, amounts, nftAddresses)
}
window.claim = claim

async function isClaimed(nftAddr, id) {
    return await window.mildayDropContract.isClaimed(nftAddr, id)
}

function setIdClaimableStatus(nftAddr, ids, claimableStatus){
    for (const id of ids) {
        const elementId = `claimableStatus-${nftAddr}-${id}`
        const rootDivId = `${nftAddr}-${id}`
        switch (claimableStatus) {
            case "ineligible":
                document.getElementById(elementId).innerText = `not eligible :(`
                document.getElementById(elementId).style.backgroundColor= "rgba(100, 100, 100, 0.8)" 
                document.getElementById(rootDivId).style.borderColor= "rgba(100, 100, 100, 0.8)" 
                document.getElementById(rootDivId).onclick = ""
                document.getElementById(rootDivId).style.cursor = "default"
                break;
            case "claimed":
                document.getElementById(elementId).innerText = `claimed :/`
                document.getElementById(elementId).style.backgroundColor= "rgba(100, 120, 100, 0.8)"
                document.getElementById(rootDivId).style.borderColor= "rgba(100, 120, 100, 0.8)"
                document.getElementById(rootDivId).onclick = ""
                document.getElementById(rootDivId).style.cursor = "default"
                break;
            case "claimable":
                document.getElementById(elementId).innerText = `claimable :D`
                document.getElementById(elementId).style.backgroundColor= "rgba(20, 200, 20, 0.8)"
                document.getElementById(rootDivId).style.borderColor= "rgba(20, 200, 20, 0.8)"  
                document.getElementById(rootDivId).onclick = function(){ toggleClaim(structuredClone(nftAddr), structuredClone(id))}
                document.getElementById(rootDivId).style.cursor = "pointer"
                break; 
            case "selected":
                document.getElementById(elementId).innerText = `selected\nclick to undo`
                document.getElementById(elementId).style.backgroundColor= "rgba(20, 20, 150, 0.8)"
                document.getElementById(rootDivId).style.borderColor= "rgba(20, 20, 150, 0.8)"
                document.getElementById(rootDivId).onclick = function(){ toggleClaim(structuredClone(nftAddr), structuredClone(id))}
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
        setIdClaimableStatus(nftAddr,[id],"claimable")
    } else {
        window.selectedIds[nftAddr].add(id)
        setIdClaimableStatus(nftAddr,[id],"selected")
    }
}
window.toggleClaim = toggleClaim 

function selectAll() {
    for (const nftAddr of Object.keys(window.idsByClaimableStatus)) {
        setIdClaimableStatus(nftAddr, window.idsByClaimableStatus[nftAddr].claimable, "selected")
        window.selectedIds[nftAddr] = new Set([...window.idsByClaimableStatus[nftAddr].claimable ])
    }

}
window.selectAll = selectAll

async function getClaimableStatus(allUserIds=window.allUserIds, allEligibleIds = window.allEligibleIds) {
    let idsByClaimableStatus = {}
    for (const nftAddr of (await window.ipfsIndex.getAllNftAddrs())) {
        const EligibleIdsCurrentNft  = Object.keys(allEligibleIds[nftAddr])
        let ids = allUserIds[nftAddr]
        let eligibleUserIds = ids.filter((x)=>EligibleIdsCurrentNft.indexOf(x)!==-1) 
        const ineligibleIds =  ids.filter((x)=>EligibleIdsCurrentNft.indexOf(x)===-1) 
        let eligibleIdsWithClaimedBool = eligibleUserIds.map((x)=>isClaimed(nftAddr,x))
        eligibleIdsWithClaimedBool = await Promise.all(eligibleIdsWithClaimedBool)
        const allClaimedUserIds = eligibleUserIds.filter((x,i)=>eligibleIdsWithClaimedBool[i])
        eligibleUserIds = eligibleUserIds.filter((x,i)=>!eligibleIdsWithClaimedBool[i])

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
    window.idsByClaimableStatus = await getClaimableStatus(window.allUserIds,window.allEligibleIds)
    await displayAllUserNfts(userAddress)

}
window.test = test