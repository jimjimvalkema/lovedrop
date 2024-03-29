import { IpfsIndexer } from "../../scripts/IpfsIndexer.js";
import { ethers } from "../../scripts/ethers-6.7.0.min.js";
//test
window.ethers = ethers

// import {CriteriaBuilder} from "./CriteriaBuilder.js";
import {DropBuilder} from "./DropBuilder.js"



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
        window.provider = new ethers.BrowserProvider(window.ethereum)//, new ethers.Network("local fork", 31337n));
        // The "any" network will allow spontaneous network changes

        // window.provider.on("network", (newNetwork, oldNetwork) => {
        //     // When a Provider makes its initial connection, it emits a "network"
        //     // event with a null oldNetwork along with the newNetwork. So, if the
        //     // oldNetwork exists, it represents a changing network
        //     console.log(oldNetwork, newNetwork)
        //     if (oldNetwork) {
        //         window.location.reload();
        //     }
        // });
    } else {
        console.log("couldn't connect to window.ethereum using a external rpc")
        const providerUrls = ["https://mainnet.infura.io/v3/", "https://eth.llamarpc.com"] 
        const workingProviderUrl = await getFirstAvailableProvider(providerUrls)
        console.log(workingProviderUrl) 
        window.provider = new  ethers.JsonRpcProvider(workingProviderUrl)
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
    const gatewayIpfsIndex = new IpfsIndexer(window.ipfsGateways)
    window.ipfsGateway = await gatewayIpfsIndex.getGatewayUrl()
    //TODO api urls shouldn't be hardcoded
    const projectId = ""
    const projectSecret = ""
    const auth = "Basic " + btoa(projectId + ":" + projectSecret);
    //window.ipfsIndex = new IpfsIndexer(["https://ipfs.infura.io:5001"],auth,false)
    window.ipfsIndex = new IpfsIndexer(["http://127.0.0.1:5001"],null,false,"progressProofGen")
    


    test()
}

async function test() {
    //TODO do on connect wallet?
    const nftDisplayElement = document.getElementById("nftDisplay")
    window.DropBuilderTest = new DropBuilder({
        collectionAddress : undefined,
        provider : window.provider,
        ipfsGateway : window.ipfsGateway,
        ipfsIndexer: window.ipfsIndex,
        nftDisplayElementCriteriaBuilder : nftDisplayElement,
        loveDropFactoryAddress:"0xfCD69606969625390C79c574c314b938853e1061"
    });



    
    //copy paste filters
    //detect if filters feed into them selfs

}
window.onload = runOnLoad;







