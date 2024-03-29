import { IpfsIndexer } from "../../scripts/IpfsIndexer.js";
import { ethers } from "../../scripts/ethers-6.7.0.min.js";
import { MerkleBuilder } from "../../scripts/MerkleBuilder.js"
import { NftDisplay } from "../../scripts/NftDisplay.js";
const delay = ms => new Promise(res => setTimeout(res, ms));


const mainChain = {
    chainId: "0x1",
    rpcUrls: ["https://eth.llamarpc.com"],
    chainName: "Ethereum Mainnet",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18
    },
    //blockExplorerUrls: []
  }

// const mainChain = {
//     chainId: "0x7A69",
//     rpcUrls: ["http://localhost:8555/"],
//     chainName: "local fork Ethereum Mainnet",
//     nativeCurrency: {
//       name: "Ethereum",
//       symbol: "ETH",
//       decimals: 18
//     },
//     //blockExplorerUrls: []
//   }

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
        window.provider = new ethers.BrowserProvider(window.ethereum);
    } else {
        console.log("couldn't connect to window.ethereum using a external rpc")
        const providerUrls = ["https://mainnet.infura.io/v3/", "https://eth.llamarpc.com"] 
        const workingProviderUrl = await getFirstAvailableProvider(providerUrls)
        console.log(workingProviderUrl) 
        window.provider = new ethers.JsonRpcProvider(workingProviderUrl)
    } 

}
  

async function getFirstAvailableProvider(providerUrls) {
    const isWorkingProvider = await Promise.all(providerUrls.map((url)=>isProviderAvailable(url)))
    return providerUrls [isWorkingProvider.indexOf(true)]

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
    let ens
    try {
        ens =  await provider.lookupAddress(address);
    } catch{}
    if (ens) {
        return ens
    } else {
        return address.slice(0,8)+".."
    }


}
window.getAccountName = getAccountName

async function connectSigner(refreshNftDisplay=true) {
    // MetaMask requires requesting permission to connect users accounts
    if (!window.ethereum) {
        message("no inject ethereum wallet found please install metamask or equivalant!")
        document.getElementById("loading").innerText = ""
        
        return 0
    }

    await switchNetwork(mainChain)
    await provider.send("eth_requestAccounts", []);
    window.signer = await provider.getSigner();
    message("please connect wallet :)")

    if (isWalletConnected()) {
        
        await resolveTillConnected()
        message("")
        // while (!window.airdropTokenContract) {
        //     await delay(100)
        // }
        // window.mildayDropWithSigner = await window.mildayDropContract.connect(window.signer);
        window.userAddress = await window.signer.getAddress()
        if(window.allNftDisplays && refreshNftDisplay) {
            await displayNfts();

        }


        await displayUserAccountInfo()
        console.log("connected")
        return [provider, signer];
    }
}
window.connectSigner = connectSigner

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

async function displayUserAccountInfo() {
    
    let accountInfoDiv = document.getElementById("accountInfo")
    if (window.userAddress && window.airdropTokenContract) {
        const accountName = getAccountName(window.userAddress)
    


        const balance = window.airdropTokenContract.balanceOf(window.userAddress)
    
        const allUserIds = Object.fromEntries(window.nftDisplays.map((x)=>[x.collectionAddress,x.ids]).filter((x)=>x[1].length))
        const claimableAmount = getClaimableAmount(allUserIds)


        const formattedClaimableBalance = new Intl.NumberFormat('en-EN').format(ethers.formatEther((await claimableAmount).toString()))
        const formattedBalance = new Intl.NumberFormat('en-EN').format(ethers.formatEther((await balance).toString()))
        const ticker = await window.ticker

        accountInfoDiv.innerHTML = `
        <div style="text-align: right">${await accountName}</div> 
        <div style="text-align: left; float:left; position: absolute"> Wallet: </div> ${formattedBalance} ${ticker} <br> 
        <div style="text-align: left; float:left; position: absolute"> Airdrop: </div>  ${formattedClaimableBalance} ${ticker} 
        `

    }
    
}

async function getClaimableAmount(userIdsPerCollection) {
    let total = 0n 
    for (const collectionAddr in userIdsPerCollection) {
        for (const id of userIdsPerCollection[collectionAddr]) {
            if (!await isClaimed(collectionAddr, id) && id in window.idsPerCollection[collectionAddr]) {
                total = total + BigInt(window.idsPerCollection[collectionAddr][id])
            }

        }
    }
    return total.toString()
    
    

}
window.getClaimableAmount = getClaimableAmount

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
    addToMetaMaskButton.onclick = ()=>addTokenToMetamask(window.airdropTokenContract.target,ticker,18)
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
    const nftAddresses = leaves.map((x) => ethers.getAddress(x[0]))
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
    await connectSigner(false)
    window.mildayDropWithSigner = await window.mildayDropContract.connect(window.signer);
    //get selected ids {nftAddr:[ids]}
    const selectedIdsEntries = window.nftDisplays.map((x)=>[x.collectionAddress,x.selection]).filter((x)=>x[1].length>0)
    const selectedIds = Object.fromEntries(selectedIdsEntries)

    const amountIds = Object.keys(selectedIds).reduce((a, v) => a + selectedIds[v].length, 0)
    if (amountIds > 1) {
        //build multiproof
        const {proof, proofFlags, ids, amounts, nftAddresses} = await loadTreeAndBuildMultiProof(window.merkleBuilder, selectedIds)

        //submit tx
        let receipt
        try {
            const tx = await window.mildayDropWithSigner.claimMultiple(proof, proofFlags, ids, amounts, nftAddresses)
            receipt = await tx.wait(1)
        } catch (error) {
            if (error.code === 'ACTION_REJECTED') {
                message("transaction rejected try again")

            } else {
                message(error)
            }
 
            
        }
    
        message("claimed :)")

        //update display
        await clearIsClaimedIds(selectedIds)
        await clearSelection()
        const selectedNftDisplays = window.nftDisplays.filter((display)=> nftAddresses.indexOf(display.collectionAddress)!==-1)
        await refreshDisplay(selectedNftDisplays)
        await displayUserAccountInfo()

    } else {
        //get selected item
        const nftAddr = Object.keys(selectedIds).find((x) => selectedIds[x].length)
        const id = selectedIds[nftAddr][0]

        //get proof
        const { amount, proof } = await fetchSingleProof(window.ipfsIndex, id,nftAddr)

        //submit tx
        console.log(proof, id, amount, nftAddr)
        let receipt
        try {
            const tx = await window.mildayDropWithSigner.claim(proof, id, amount, nftAddr)
            receipt = await tx.wait(1)
            
        } catch (error) {
            if (error.code === 'ACTION_REJECTED') {
                message("transaction rejected try again")

            } else {
                message(error)
            }
        }
        

        message("claimed :)")

        //update display
        await clearIsClaimedIds(selectedIds)
        await clearSelection()
        const nftDisplay = window.allNftDisplays.find((display) => display.collectionAddress === nftAddr)
        await refreshDisplay([nftDisplay])
        await displayUserAccountInfo()

    }
}
window.claimSelected = claimSelected

async function clearSelection() {
    for (const nftDisplay of window.nftDisplays) {
        await nftDisplay.clearSelection()
    }
    window.selectedAmount = 0n
    const formattedAmount  =  new Intl.NumberFormat('en-EN').format(ethers.formatEther( window.selectedAmount.toString()))
    document.getElementById("amountSelected").innerHTML = `${formattedAmount} ${await window.ticker}  selected`
}
window.clearSelection = clearSelection

async function selectAll() {
    await clearSelection()
    for (const nftDisplay of window.nftDisplays) {
        await nftDisplay.selectAll()
        const totalSelected = nftDisplay.selection.reduce(
            (total, id) => {
                if (window.idsPerCollection[nftDisplay.collectionAddress][id]) {
                    const amount = BigInt(window.idsPerCollection[nftDisplay.collectionAddress][id])
                    return total + (amount)
                } else {
                    return 0n
                }

            },0n
        );
        window.selectedAmount = window.selectedAmount + (totalSelected)
    }
    const formattedAmount  =  new Intl.NumberFormat('en-EN').format(ethers.formatEther( window.selectedAmount.toString()))
    document.getElementById("amountSelected").innerHTML = `${formattedAmount} ${await window.ticker}  selected`
}
window.selectAll = selectAll

function displayTokens(id, nftDisplay) {
    let d = document.createElement("div");
    d.className = "tokenDisplay"
    if (id in window.idsPerCollection[nftDisplay.collectionAddress]) {
        const amount = ethers.formatEther(window.idsPerCollection[nftDisplay.collectionAddress][id])
        d.innerText =  `${amount} ${window.ticker}`
        if (id in window.idsByClaimableStatus[nftDisplay.collectionAddress].claimed) {
            d.style.textDecoration = "line-through"
        }
    } else {
        //return ""
        d.innerText =  `nothing :(`
    }
    return d
}

function makeIntoDivs(parentId, childIds) {
    let parentElement = document.getElementById(parentId)
    let children = []
    for (const childId of childIds) {
        let childDiv = document.createElement("div");
        childDiv.id = childId
        childDiv.style.paddingTop = "1.5rem"
        parentElement.appendChild(childDiv)
        children.push(childDiv)
    }

    return children
}

async function refreshDisplay(displays) {
    for (const display of displays) {
        await display.clearSelection()

        //refreh claimable status all ids (TODO do only claimed to reduce rpc calls)
        const nftAddr = display.collectionAddress
        window.idsByClaimableStatus[nftAddr] =  await getClaimableStatus(display.ids, window.idsPerCollection[nftAddr], nftAddr)
        const {claimable, claimed, ineligible} = window.idsByClaimableStatus[nftAddr]

        display.notSelectable = [...Object.keys(claimed), ...Object.keys(ineligible)]
        
        //re-sort ids
        display.ids = [...Object.keys(claimable), ...Object.keys(claimed), ...Object.keys(ineligible)]
        await display.refreshPage()
    }
}

window.selectedAmount = 0n
async function updateSelectedAmount(id, display) {
    //TODO selectAll
    if (display.selection.indexOf(id) === -1) {
        const amountBigNum = BigInt(window.idsPerCollection[display.collectionAddress][id])
        window.selectedAmount = window.selectedAmount / (amountBigNum) 
    } else {
        const amountBigNum = BigInt(window.idsPerCollection[display.collectionAddress][id])
        window.selectedAmount = window.selectedAmount + (amountBigNum) 
    }   
    const formattedAmount  =  new Intl.NumberFormat('en-EN').format(ethers.formatEther( window.selectedAmount.toString()))
    document.getElementById("amountSelected").innerHTML = `${formattedAmount} ${await window.ticker}  selected`
}

async function displayNfts() {
    // while (!window.allNftDisplays) {
    //     await delay(100)
    // }

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
        display.onSelect = updateSelectedAmount
        display.makeAllSelectable()

        window.nftDisplays.push(display)
        document.getElementById(`selectedStatus-5540-${nftAddr}`)
    }
    document.getElementById("loading").innerText = ""
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

function clearIsClaimedIds(idsPerNftAddr) {
    for (const nftAddr in idsPerNftAddr) {
        for (const id of idsPerNftAddr[nftAddr]) {
            delete isClaimedCache[nftAddr][id]
        }
    }
      
}

async function loadAllContracts() {

    document.getElementById("loading").innerText = "loading"
    window.urlVars = await getUrlVars();
    document.getElementById("dropInfo").innerHTML = `See all nfts: <a href=../drop/?lovedrop=${window.urlVars["lovedrop"]}>drop page</a>`

    if (!window.urlVars["ipfsGateway"]) {
        window.ipfsGateways = ["https://.mypinata.cloud","http://127.0.0.1:48084","http://127.0.0.1:8080","https://ipfs.io"] //no grifting pls thank :)
    } else {
        window.ipfsGateways = [window.urlVars["ipfsGateway"]]
    }
    

    //abis
    const mildayDropAbi = await (await fetch("../abi/mildayDropAbi.json")).json()
    //const ERC721ABI = await (await fetch("../abi/ERC721ABI.json")).json()
    const ER20ABI = await (await fetch("../abi/ERC20ABI.json")).json()

    //miladyDrop Contract
    window.mildayDropContract = new ethers.Contract(window.urlVars["lovedrop"], mildayDropAbi, window.provider)

    //load ipfsIndex
    window.claimDataIpfsHash = await mildayDropContract.claimDataIpfs(); //await window.ipfsIndex.createIpfsIndex(balanceMapJson, splitSize=780);//"bafybeigdvozivwvzn3mrckxeptstjxzvtpgmzqsxbau5qecovlh4r57tci"
    window.ipfsIndex = new IpfsIndexer(window.ipfsGateways, null, true)
    await window.ipfsIndex.loadIndexMiladyDropClaimData(window.claimDataIpfsHash)
    window.ipfsGateway = await window.ipfsIndex.getGatewayUrl()

    //load data from ipfsIndex
    window.tree = window.ipfsIndex.getTreeDump()
    //loading the tree should also be done here but needs to be done in a worker
    window.idsPerCollection = await window.ipfsIndex.getIdsPerCollection()

    window.airdropTokenContract = new ethers.Contract(await mildayDropContract.airdropTokenAddress(), ER20ABI, window.provider)
    window.ticker = await window.airdropTokenContract.symbol()

    document.getElementById("amountSelected").innerHTML = `${0} ${await window.ticker}  selected`
    //TODO make "See all nfts" apear faster
    let dropInfo = document.getElementById("dropInfo")
    let totalSupply = (await window.airdropTokenContract).totalSupply()
    const dropTokenName = (await window.airdropTokenContract).name()
    const dropSize = getTotalDrop()
    totalSupply = ethers.formatEther((await totalSupply).toString())
    dropInfo.innerHTML = `<span class="titel">${await dropTokenName}</span> <br> <br>
    Airdrop size: ${new Intl.NumberFormat('en-EN').format(dropSize)} ${await window.ticker} <br>
    Total supply: ${new Intl.NumberFormat('en-EN').format(await totalSupply)} ${await window.ticker}<br>
    ${await window.ticker} on etherscan: <a href="https://etherscan.io/token/${window.airdropTokenContract.target}">${window.airdropTokenContract.target}<a><br>
    See all nfts: <a href=../drop/?lovedrop=${window.urlVars["lovedrop"]}>drop page</a> <br>
    `
    dropInfo.insertBefore(await addDropTokenToMetamaskButton(), dropInfo.childNodes[3]);
    document.getElementById("loading").innerText = ""


    //get all nft contracts
    window.allNftAddresses = Object.keys(window.idsPerCollection)
    window.isClaimedCache = Object.fromEntries(window.allNftAddresses.map((x) => [x, {}]))
    window.selectedIds = {}

    // create the nftDisplay divs
    const nftAddresses = Object.keys(await window.idsPerCollection)
    const parrentDiv = document.getElementById("nfts")
    const nftDisplayElements = Object.fromEntries(nftAddresses.map((address)=>{
        const displayEl = document.createElement("div")
        displayEl.id = `nftDisplay-${address}`
        parrentDiv.append(displayEl)
        return [address, displayEl]
    }))
    

    //makeIntoDivs("nfts", nftDisplayElementIds)

    //window.allEligibleIds = window.ipfsIndex.getIdsPerCollection()
    window.allNftDisplays = window.allNftAddresses.map((nftAddr) => new NftDisplay({collectionAddress:nftAddr, provider:window.provider, displayElement:nftDisplayElements[nftAddr], ids:[], ipfsGateway:window.ipfsGateway, initialize:false}))
    await Promise.all(window.allNftDisplays.map(display => display.initialize()))
    if(window.signer) {
        await displayNfts()
        await displayUserAccountInfo()

    }



   
}
window.loadAllContracts = loadAllContracts

async function runOnLoad() {
    await connectProvider()
    await connectSigner()
    loadAllContracts()
    
}
window.onload = runOnLoad;




