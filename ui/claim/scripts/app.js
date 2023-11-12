import { IpfsIndexer } from "../../scripts/IpfsIndexer.js";
import { ethers } from "../../scripts/ethers-5.2.esm.min.js";
import { MerkleBuilder } from "../../scripts/MerkleBuilder.js"
import { NftDisplay } from "../../scripts/NftDisplay.js";

async function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}

async function connectProvider() {
    if (window.ethereum) {
        window.provider = new ethers.providers.Web3Provider(window.ethereum);
    } else {
        console.log("couldn't connect to window.ethereum using a external rpc")
        const providerUrls = ["https://mainnet.infura.io/v3/INFURAKEY", "https://eth.llamarpc.com"] 
        const workingProviderUrl = await getFirstAvailableProvider(providerUrls)
        console.log(workingProviderUrl) 
        window.provider = new ethers.providers.JsonRpcProvider(workingProviderUrl)
    } 

}
  

async function getFirstAvailableProvider(providerUrls) {
    const isWorkingProvider = await Promise.all(providerUrls.map((url)=>isProviderAvailable(url)))
    return providerUrls [isWorkingProvider.indexOf(true)]

}

async function isProviderAvailable(url) {
    try {
        const testProvider = new ethers.providers.JsonRpcProvider(url)
        await testProvider.getNetwork()
        return true
    } catch (error) {
        console.warn(`couldnt connect to ${url}`)
        console.warn(error)
        return false   
    }
}

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


async function resolveTillConnected() {
    let amountAccounts = 0
    while (amountAccounts === 0) {
        const accounts = await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(ethereum.request({ method: 'eth_accounts' }));
            }, 500);
        });
        amountAccounts = accounts.length
    }
}

async function getAccountName(address) {
    try {
        return await provider.lookupAddress(address);
    } catch (error) {
        //console.warn(error)
        return address
    }


}
window.getAccountName = getAccountName

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

        let accountInfoDiv = document.getElementById("accountInfo")
        const accountName = getAccountName(window.userAddress)
        const balance = airdropTokenContract.balanceOf(window.userAddress)
        const formattedBalance = new Intl.NumberFormat('en-EN').format(ethers.utils.formatEther((await balance).toString()))
        const ticker = await window.ticker
        accountInfoDiv.innerHTML = `
        ${await accountName} <br>
        ${formattedBalance} ${ticker}   
        `
        accountInfoDiv.append(await addDropTokenToMetamaskButton())
        console.log("connected")
        return [provider, signer];
    }
}
window.connectSigner = connectSigner

function message(message) {
    console.log(message);
    document.getElementById("message").innerText = message;
}
window.message = message

async function addDropTokenToMetamaskButton() {
    const ticker = await window.ticker
    let addToMetaMaskButton = document.createElement("button")
    addToMetaMaskButton.innerText = `add to metamask`
    addToMetaMaskButton.style.fontSize = "1rem"
    addToMetaMaskButton.onclick = ()=>addTokenToMetamask(window.airdropTokenContract.address,ticker,18)
    return addToMetaMaskButton
}

async function addTokenToMetamask(tokenAddress, tokenSymbol, tokenDecimals, tokenImage="") {
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

    // if (wasAdded) {
    //     console.log('Thanks for your interest!');
    // } else {
    //     console.log('Your loss!');
    // }
    } catch (error) {
    console.log(error);
    }
}

async function isClaimed(nftAddr, id) {
    return await window.mildayDropContract.isClaimed(nftAddr, id)
}

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

async function loadTreeAndBuildMultiProof(merkleBuilder,selectedIds) {
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
        const {proof, proofFlags, ids, amounts, nftAddresses} = await loadTreeAndBuildMultiProof(window.merkleBuilder, selectedIds)

        //submit tx
        let tx = await window.mildayDropWithSigner.claimMultiple(proof, proofFlags, ids, amounts, nftAddresses)
        let receipt = await tx.wait(1)
        message("claimed :)")

        //update display
        const selectedNftDisplays = window.nftDisplays.filter((display)=> nftAddresses.indexOf(display.collectionAddress)!==-1)
        refreshDisplay(selectedNftDisplays)

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
        refreshDisplay([nftDisplay])

    }
}
window.claimSelected = claimSelected

async function clearSelection() {
    for (const nftDisplay of window.nftDisplays) {
        nftDisplay.clearSelection()
    }
}
window.clearSelection = clearSelection

function selectAll() {
    for (const nftDisplay of window.nftDisplays) {
        nftDisplay.selectAll()
    }

}
window.selectAll = selectAll

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

async function refreshDisplay(displays) {
    for (const display of displays) {
        display.clearSelection()

        //refreh claimable status all ids (TODO do only claimed to reduce rpc calls)
        const nftAddr = display.collectionAddress
        window.idsByClaimableStatus[nftAddr] =  await getClaimableStatus(display.ids, window.idsPerCollection[nftAddr], nftAddr)
        const {claimable, claimed, ineligible} = window.idsByClaimableStatus[nftAddr]

        display.notSelectable = [...Object.keys(claimed), ...Object.keys(ineligible)]
        
        //re-sort ids
        display.ids = [...Object.keys(claimable), ...Object.keys(claimed), ...Object.keys(ineligible)]
        display.refreshPage()
    }
}


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

function getTotalDrop() {
    let total = ethers.BigNumber.from(0)
    for (const address in window.idsPerCollection) {
        const collection = window.idsPerCollection[address]
        const totalFromCollection = Object.keys(collection).reduce(
            (total, id) => {
                return total.add(ethers.BigNumber.from(collection[id]))
            },
            ethers.BigNumber.from(0)
        )
        total = total.add(totalFromCollection)
    }
    return ethers.utils.formatEther(total.toString())
}

async function loadAllContracts() {
    window.urlVars = await getUrlVars();
    if (!window.urlVars["ipfsGateway"]) {
        window.ipfsGateways = ["https://PINATAKEY.mypinata.cloud","http://127.0.0.1:48084","http://127.0.0.1:8080","https://ipfs.io"] //no grifting pls thank :)
    } else {
        window.ipfsGateways = [window.urlVars["ipfsGateway"]]
    }

    //abis
    const mildayDropAbi = await (await fetch("../abi/mildayDropAbi.json")).json()//update mildayDropAbi.json
    //const ERC721ABI = await (await fetch("../abi/ERC721ABI.json")).json()
    const ER20ABI = await (await fetch("../abi/ERC20ABI.json")).json()

    //miladyDrop Contract
    window.mildayDropContract = new ethers.Contract(window.urlVars["lovedrop"], mildayDropAbi, window.provider)

    //load ipfsIndex
    window.claimDataIpfsHash = await mildayDropContract.claimDataIpfs(); //await window.ipfsIndex.createIpfsIndex(balanceMapJson, splitSize=780);//"bafybeigdvozivwvzn3mrckxeptstjxzvtpgmzqsxbau5qecovlh4r57tci"
    window.ipfsIndex = new IpfsIndexer(window.ipfsGateways, null, true)
    window.ipfsGateway = await window.ipfsIndex.getGatewayUrl()
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

    let dropInfo = document.getElementById("dropInfo")
    let totalSupply = (await window.airdropTokenContract).totalSupply()
    const dropTokenName = (await window.airdropTokenContract).name()
    const dropSize = getTotalDrop()
    totalSupply = ethers.utils.formatEther((await totalSupply).toString())
    dropInfo.innerHTML = `<span class="titel">${await dropTokenName}</span> <br>
    Airdrop size: ${new Intl.NumberFormat('en-EN').format(dropSize)} ${await window.ticker} <br>
    Total supply: ${new Intl.NumberFormat('en-EN').format(await totalSupply)} ${await window.ticker}<br>
    ${await window.ticker} on etherscan: <a href="https://etherscan.io/token/${window.airdropTokenContract.address}">${window.airdropTokenContract.address}<a><br>
    See all at: <a href=../drop/?lovedrop=${window.urlVars["lovedrop"]}>drop page</a>
    `

    connectSigner()


   
}
window.loadAllContracts = loadAllContracts

async function runOnLoad() {
    await connectProvider()
    await loadAllContracts()
}
window.onload = runOnLoad;
