
//import {ethers} from "../ui/scripts/ethers-5.2.umd.min.js"
import {uriHandler, MakeQuerablePromise} from "../../ui/scripts/uriHandler.js";

//import {ethers} from "ethers"

import {ethers} from "ethers"
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


async function getAllPools(sudoswapPairFactory, provider,preSyncFilePath= "../output/sudoswapv2/allPoolFromSudoswapV2.json", startBlockEvenScan=17309202) {
    let poolPerNft={};

    let preSyncFile
    if(preSyncFilePath) {
        preSyncFile = Bun.file(preSyncFilePath)
        if (preSyncFile.size) {
            const preSyncJson = await preSyncFile.json()
            startBlockEvenScan = preSyncJson.block
            poolPerNft =preSyncJson.poolPerNft;
        } else {
            console.warn(`${preSyncFilePath} is empty or doesn exist. scanning for sudoswap pools from block ${startBlockEvenScan} now`)
        }
    } else {
        console.warn(`no preSynced file was found for all pools from sudoSwapV2. scanning for sudoswap pools from block ${startBlockEvenScan} now`)
    }



    const blockNumber =(await provider.getBlock("latest")).number;
    //console.log(blockNumber)
    let eventFilter = sudoswapPairFactory.filters.NewERC721Pair()
    let events = await sudoswapPairFactory.queryFilter(eventFilter, startBlockEvenScan)
    let nftAddrs = []
    for (const i in events) {
        const event =events[i]
        const pairAddress = event.args[0]
        const pairContractObj = await getContractObj(pairAddress, `${workinDirBunFile}/../abi/sudoSwapERC721ABIOnlyNft.json`, provider)
        nftAddrs.push( pairContractObj.nft())
    }
    nftAddrs =await Promise.all(nftAddrs)
    for (const i in nftAddrs) {
        const nftAddr = nftAddrs[i]
        const event =events[i]
        const pairAddress = event.args[0]
        if (nftAddr in poolPerNft) {
            poolPerNft[nftAddr].push({
                ["pairAddress"]:pairAddress,
                ["deploymentBlock"]:event.blockNumber
            })//TODO deployent block
        } else {
            poolPerNft[nftAddr] = 
            [{
                ["pairAddress"]:pairAddress,
                ["deploymentBlock"]:event.blockNumber
            }]
        }
    }

    const data = JSON.stringify(({["block"]:blockNumber,["poolPerNft"]:poolPerNft}))
    await Bun.write(`${workinDirBunFile}/../output/sudoswapv2/allPoolFromSudoswapV2.json`, data);
    return poolPerNft
}


//TODO put this into URIHandler
function isFulfilled(x) {
    if (x !== undefined) {
        return x.isFulfilled()
    } else {
        return false
    }

}

async function getPricesFromSudoSwapPools(pools,URIHandler, provider,maxRequest=5) {
    //const nftContrObj = await getContractObj(nftAddr, `../ui/abi/ERC721ABI.json`, provider)
    const sudoSwapRouterAddr = "0x090C236B62317db226e6ae6CD4c0Fd25b7028b65";
    const routerObj = await getContractObj(sudoSwapRouterAddr, `${workinDirBunFile}/../abi/sudoSwap2RouterABI.json`, provider)
    let pricesPerNft = {}
    let pricesPerPoolsIndex = []
    let idsPerPoolsIndex = []
    let idsPerPoolsIndexFulFilled = []
    for (const i in pools) {
        const pool = pools[i]
        const poolAddr = pool.pairAddress
        const startBlockEvenScan = pool.deploymentBlock
        pricesPerPoolsIndex[i] = routerObj.getNFTQuoteForBuyOrderWithPartialFill(poolAddr,1,0,0)

        //should split up this task into chunks since its not very scalable currently
        idsPerPoolsIndex[i] = MakeQuerablePromise(URIHandler.getIdsOfowner(poolAddr, startBlockEvenScan))
        //idsPerPoolsIndex[i] = URIHandler.getIdsOfowner(poolAddr, startBlockEvenScan)

        let fulfilledIndex = idsPerPoolsIndex.findIndex((x)=>isFulfilled(x))
        idsPerPoolsIndexFulFilled[fulfilledIndex] = idsPerPoolsIndex[fulfilledIndex]
        delete idsPerPoolsIndex[fulfilledIndex]

        const tempOnlyPromisses = idsPerPoolsIndex.filter((x)=>x!==undefined)

        if (tempOnlyPromisses.length>=maxRequest) {
            console.log(`max request reached waiting till another finished to start proccess ${i}/${pools.length}`)
            console.log(`pending requests: ${tempOnlyPromisses.length}`)
            await Promise.any(tempOnlyPromisses)
        }

    
    }
    Object.assign(idsPerPoolsIndex, idsPerPoolsIndexFulFilled)
    
    for (const i in (await Promise.all(idsPerPoolsIndex))) {
        const pool = pools[i]
        const poolAddr = pool.pairAddress 
        for (const id of (await idsPerPoolsIndex[i])) {
            if (id in pricesPerNft) {
                pricesPerNft[id].push({["price"]:Number(await pricesPerPoolsIndex[i]),["currency"]:"ETH",["source"]:"SudoSwapV2", ["poolAddr"]:poolAddr})
    
            }else {
                //TODO other currency
                pricesPerNft[id] = [{["price"]:Number(await pricesPerPoolsIndex[i]),["currency"]:"ETH",["source"]:"SudoSwapV2", ["poolAddr"]:poolAddr}]
            }
        }

    }

    return pricesPerNft
    
}
const workingDir = import.meta.url.split("/").slice(null,-1).join("/")
const workinDirBunFile = structuredClone(workingDir).slice(7)
async function main() {

    const rpcProvider = Bun.argv[2]
    const nftAddress = ethers.utils.getAddress(Bun.argv[3])
    let startTime = Date.now();
    const contractAddr = "0xA020d57aB0448Ef74115c112D18a9C231CC86000"
    const provider = new ethers.providers.JsonRpcProvider(`${rpcProvider}`);
    const sudoswapPairFactory = await getContractObj(contractAddr, `${workinDirBunFile}/../abi/sudoswapFactoryABI.json`, provider)
    const latestBlock = await provider.getBlock("latest")
    const nftContrObj = await getContractObj(nftAddress, `${workinDirBunFile}/../../ui/abi/ERC721ABI.json`, provider)

    console.log(`${workingDir}../../ui/scripts/extraUriMetaDataFile.json`)
    const URI =  new uriHandler(nftContrObj, "http://127.0.0.1:8080",true, `${workingDir}/../../ui/scripts/extraUriMetaDataFile.json`, provider)


    console.log(latestBlock.number)

    URI.extraUriMetaData = await URI.extraUriMetaData
    let idsOfOwnerFilePath = `${workingDir}/../output/sudoswapv2/allBalancesOfOwners-${await nftContrObj.address}.json`
    if ((await Bun.file(idsOfOwnerFilePath.slice(7))).size) {
        URI.extraUriMetaData.idsOfOwner = idsOfOwnerFilePath
    }
    await URI.fetchAllExtraMetaData(false, URI.extraUriMetaData)

    const pools = await getAllPools(sudoswapPairFactory,provider,`${workinDirBunFile}/../output/sudoswapv2/allPoolFromSudoswapV2.json`)

    let maxRequest = 50
    if(rpcProvider.split(".").indexOf("dappnode")!==-1) {
        console.log("local node setting lower max requests")
        maxRequest = 5
    }
    const pricesFound = await getPricesFromSudoSwapPools(pools[URI.contractObj.address],URI, provider, maxRequest)


    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
    console.log(`${workinDirBunFile}/../output/sudoswapv2/pricesTest3${await nftContrObj.name()}.json`)
    Bun.write(`${workinDirBunFile}/../output/sudoswapv2/pricesTest3${await nftContrObj.name()}.json`,JSON.stringify(pricesFound, null, 2))
    await URI.saveOwnerIdsCacheToStorage(idsOfOwnerFilePath.slice(7) )


    //TODO 
    //make a flag to only get save blocks since re-orgs can mess with things currently

    //if a nft collection has a lot of pools doing a iter over a 10k collection with ownerOf might be faster then scanning events
    //
    //current stat on molady: 24277 ms llamarpc (6234 ms with cached sudo swap pools :D)
    //current stat on molady: 66397 ms infura (5692 ms with cached sudo swap pools :D)
    //current stat on molady: 96136 ms local full node (92333 ms with cached sudo swap pools :/) (http://geth.dappnode:8545)


    //when caching both ids and sudoswap pools
    //657 milliseconds local node :0
    //1330 milliseconds llamarpc 
    //6603 milliseconds infura


    //full sync with paralelsation:
    //29837 milliseconds local node
    //10398 milliseconds llamarpc 
    //3946 milliseconds infura

    //cached  with paralelsation:
    //145 milliseconds local node
    //439 milliseconds llamarpc 
    //3008 milliseconds infura
    let timeTaken = Date.now() - startTime;   
    console.log("script ran for: " + timeTaken + " milliseconds");
}


//not used since scatter collection uses proxies thus have no code to annalyze :(
//unless u take the time to implement a way to read the slot with the implementation ofc
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

//bun run bun/scripts/getAllSudoSwapPools.js https://eth.llamarpc.com 0x3Fc3a022EB15352D3f5E4e6D6f02BBfC57D9C159
main()