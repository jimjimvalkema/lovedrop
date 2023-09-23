
//import {ethers} from "../ui/scripts/ethers-5.2.umd.min.js"
import {uriHandler} from "../ui/scripts/uriHandler.js";

//import {ethers} from "ethers"

import { ethers } from "../ui/scripts/ethers-5.2.umd.min.js"
//const { ethers } = require("ethers");
function getWorkingDir() {
    const scriptFilePath = structuredClone(Bun.argv[1])
    let workingDir = scriptFilePath.split("/");
    workingDir.pop()
    workingDir = workingDir.join("/")
    return workingDir
}
async function addToIpfs(ApiUrl,data, filename, pin=true, cidVersion=1, auth=null) {
    const form = new FormData();
    form.append('file', new File([data], `/${filename}`));
    let reqObj = {
        method: 'POST',
        headers: {
            'Authorization': auth
        },
        body: form
    }
    if (auth==null) {
        delete reqObj.headers
    }
    console.log(`${ApiUrl}/api/v0/add?pin=${pin}&cid-version=${cidVersion}`)
    let r = await fetch(`${ApiUrl}/api/v0/add?pin=${pin}&cid-version=${cidVersion}`, reqObj);
    console.log({"ok":r.ok,"url":r.url,"status":r.status})
    return r.json();
}

async function getContractObj(address="",abiFile,provider) {
    let sudoswapFactoryABIFile =Bun.file(abiFile);
    let sudoswapFactoryABI = await sudoswapFactoryABIFile.json();
    return  new ethers.Contract(address, sudoswapFactoryABI, provider);
}


async function getAllPools(sudoswapPairFactory, provider,  startBlockEvenScan=17309202) {
    let poolPerNft={};
    let preSyncFile = undefined;

    preSyncFile = Bun.file("./output/allPoolFromSudoswapV2.json")
    
    if (preSyncFile.size) {
        const preSyncJson = await preSyncFile.json()
        startBlockEvenScan = preSyncJson.block
        poolPerNft =preSyncJson.poolPerNft;
    } else {
        console.warn(`./output/allPoolFromSudoswapV2.json is empty or doesn exist. scanning for sudoswap pool from block ${startBlockEvenScan} now`)
    }


    const blockNumber =(await provider.getBlock("latest")).number;
    //console.log(blockNumber)
    let eventFilter = sudoswapPairFactory.filters.NewERC721Pair()
    let events = await sudoswapPairFactory.queryFilter(eventFilter, startBlockEvenScan)
    for (const event of events) {
        const pairAddres = event.args[0]
        const pairContractObj = await getContractObj(pairAddres, `./sudoSwapERC721ABIOnlyNft.json`, provider)
        const nftAddr = (await pairContractObj.nft())
        if (nftAddr in poolPerNft) {
            poolPerNft[nftAddr].push(pairAddres)//TODO deployent block
        } else {
            poolPerNft[nftAddr] = [pairAddres]
        }
    }

    const data = JSON.stringify(({["block"]:blockNumber,["poolPerNft"]:poolPerNft}))
    await Bun.write("./output/allPoolFromSudoswapV2.json", data);
    return poolPerNft
}

async function contractHasFunction(contractAddr,methodString,abiFile,provider) {
    // In the following line, you could either provide a complete smart contract
    // ABI that is imported from a JSON file; or you could just define it for
    // the single function signature that you're searching for.
    //const abi = ["function methodName(methodType1,methodType2,...)"];
    //"methodName(methodType1,methodType2,...)"()
    const abi = await Bun.file(abiFile).json()

    const iface = new ethers.utils.Interface(abi);
    const method_selector = iface.getSighash(methodString).substring(2);

    //const contract = new ethers.Contract(contractAddr, abi, signer);
    const bytecode = await provider.getCode(contractAddr);

    if(bytecode.includes(method_selector)) {
        return true
    } else {
        return false
    }
}


//TODO put this into URIHandler

async function getPricesFromSudoSwapPools(poolAddrs,URIHandler, provider,ids=undefined, startBlockEvenScan=17309202) {
    //const nftContrObj = await getContractObj(nftAddr, `../ui/abi/ERC721ABI.json`, provider)
    const sudoSwapRouterAddr = "0x090C236B62317db226e6ae6CD4c0Fd25b7028b65";
    const routerObj = await getContractObj(sudoSwapRouterAddr, `./sudoSwap2RouterABI.json`, provider)
    let prices = {}
    for (const pairAddres of poolAddrs) {
        let price = Number(await routerObj.getNFTQuoteForBuyOrderWithPartialFill(pairAddres,1,0,0))//numnft 1, and rest can be 0 i hope :p
        const matchingIdsInPool = (await URIHandler.getIdsOfowner(pairAddres, startBlockEvenScan))
        console.log(matchingIdsInPool)
        for (const id of matchingIdsInPool) {
            if (id in prices) {

            }else {
                //TODO other currency
                prices[id] = {["price"]:price,["currency"]:"ETH",["source"]:"SudoSwap", ["poolAddr"]:pairAddres}
            }
        }
    }

    return prices
    
}

async function main() {
    let startTime = Date.now();
    const contractAddr = "0xA020d57aB0448Ef74115c112D18a9C231CC86000"
    const provider = new ethers.providers.JsonRpcProvider(`${Bun.argv[2]}`);
    const sudoswapPairFactory = await getContractObj(contractAddr, `./sudoswapFactoryABI.json`, provider)
    const latestBlock = await provider.getBlock("latest")
    const nftContrObj = await getContractObj("0x3Fc3a022EB15352D3f5E4e6D6f02BBfC57D9C159", `../ui/abi/ERC721ABI.json`, provider)

    //const uriHandlerModule = require('../../ui/scripts/uriHandler.js');
    const workingDir = import.meta.url.split("/").slice(null,-1).join("/")
    console.log(`${workingDir}/../ui/scripts/extraUriMetaDataFile.json`)
    let URI =  await new uriHandler(nftContrObj, "http://127.0.0.1:8080",true, `${workingDir}/../ui/scripts/extraUriMetaDataFile.json`, provider)

    // const sudoSwapRouterAddr = "0x090C236B62317db226e6ae6CD4c0Fd25b7028b65";
    // const routerObj = await getContractObj(sudoSwapRouterAddr, `./sudoSwap2RouterABI.json`, provider)
    // let price = await routerObj.getNFTQuoteForBuyOrderWithPartialFill("0x3029Ab8F76cabf6Be5C976452897254532695E78",1,1,1)
    // console.log(price)
    // console.log(Number(price))

;

    console.log(latestBlock.number)
    // const poolAddrs = await getAllPools(sudoswapPairFactory,provider)
    // console.log(`found these pool address:`)
    // console.log(poolAddrs)
    // console.log(`found these prices for ${await URI.contractObj.name()}, ${URI.contractObj.address}`)
    // console.log(await getPricesFromSudoSwapPools(poolAddrs[URI.contractObj.address],URI, provider))
  
    await URI.getOwnerOfIdsWithOwnerOf(undefined, `./output/allBalancesOfOwners-${nftContrObj.address}.json`)

    //TODO speed improvements
    //we can speed things up by making getIdsOfowner and getAllPools keep results and then scan events after the last scanned block
    //getIdsOfowner would cache results as all ids per address
    //getAllPools knows when that address is deployed which can help speed up getIdsOfowner if its scanning events

    //getAllPools might be able to do .nft() with multicall
    //
    //if a nft collection has a lot of pools doing a iter over a 10k collection with ownerOf might be faster then scanning events
    //
    //current stat on molady: 24277 ms llamarpc (6234 ms with cached sudo swap pools :D)
    //current stat on molady: 66397 ms infura (5692 ms with cached sudo swap pools :D)
    //current stat on molady: 96136 ms local full node (92333 ms with cached sudo swap pools :/) (http://geth.dappnode:8545)
    let timeTaken = Date.now() - startTime;   
    console.log("script ran for: " + timeTaken + " milliseconds");
}


main()