import { IpfsIndexer } from "../../scripts/IpfsIndexer.js";
import { ethers } from "../../scripts/ethers-5.2.esm.min.js";
import { NftDisplay } from "../../scripts/NftDisplay.js";
import { FilterBuilder } from "./FilterBuilder.js";
const delay = ms => new Promise(res => setTimeout(res, ms));

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
        const providerUrls = ["https://mainnet.infura.io/v3/", "https://eth.llamarpc.com"] 
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

function message(message) {
    console.log(message);
    document.getElementById("message").innerText = message;
}


async function runOnLoad() {
    window.urlVars = await getUrlVars();
    await connectProvider()

    if (!window.urlVars["ipfsGateway"]) {
        window.ipfsGateways = ["https://.mypinata.cloud","http://127.0.0.1:48084","http://127.0.0.1:8080","https://ipfs.io"] //no grifting pls thank :)
    } else {
        window.ipfsGateways = [window.urlVars["ipfsGateway"]]
    }

    //TODO cleaner way of doing this
    const ipfsIndex = new IpfsIndexer(window.ipfsGateways)
    window.ipfsGateway = await ipfsIndex.getGatewayUrl()



    test()
}

async function test() {
    window.filterBuilderTest = new FilterBuilder({
        collectionAddress : "0x5af0d9827e0c53e4799bb226655a1de152a425a5",
        provider : window.provider,
        ipfsGateway : window.ipfsGateway,
        displayElementId : "nftDisplay"
    });
    //filterbuilder per criteria per collection.
    //copy paste filters
    //detect if filters feed into them selfs

}
window.onload = runOnLoad;

async function handleSetNftContract(event) {
    console.log(event.target.value)
    let nftAddress = ""
    try {
        nftAddress = ethers.utils.getAddress(event.target.value)
        
    } catch (error) {
        console.log("not a real ethereum address")
        await window.nftDisplay.clear()
        return 0
        
    }
    
    window.nftDisplay.setCollectionAddress(nftAddress)
    await window.nftDisplay.setIdsToAll()
    await window.nftDisplay.createDisplay()

}
document.getElementById("nftContractAddressInput").addEventListener("change",handleSetNftContract)

