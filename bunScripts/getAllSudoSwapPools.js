
//import {ethers} from "../ui/scripts/ethers-5.2.umd.min.js"
import {uriHandler} from "../ui/scripts/uriHandler.js";

//import {ethers} from "ethers"

import { ethers } from "./ethers-5.2.umd.min.js"
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


async function getAllPools(sudoswapPairFactory, provider) {
    const factoryDeployementBlock = 17309202;
    let eventFilter = sudoswapPairFactory.filters.NewERC721Pair()
    let events = await sudoswapPairFactory.queryFilter(eventFilter, factoryDeployementBlock)
    let poolPerNft = {};
    for (const event of events) {
        const pairAddres = event.args[0]
        const pairContractObj = await getContractObj(pairAddres, `./sudoSwapERC721ABIOnlyNft.json`, provider)
        const nftAddr = (await pairContractObj.nft())
        if (nftAddr in poolPerNft) {
            poolPerNft[nftAddr].push(pairAddres)
        } else {
            poolPerNft[nftAddr] = [pairAddres]
        }
    }
    return poolPerNft
}

//because even in 2023 some retards are still deploying contracts without tokenOfOwnerByindex
async function getOwnerOfIds(URIHandler,ids) {
    



    if (!ids) {
        const totalSupply =await URIHandler.getTotalSupply()
        const firstId = await URIHandler.getIdStartsAt()
        console.log(totalSupply)
        console.log(firstId)
        ids = [...Array(totalSupply-firstId).keys()].map(i => i + firstId) //await URIHandler.getTotalSupply()
    }
    let r =[]
    for(const id of ids) {
        //console.log(id)
        try {
            r[id] = await URIHandler.contractObj.ownerOf(id)
        } catch (error) {
            
        }
    }
    await Promise.all(r)

    let ownerIds = {}
    for (const id in r) {
        const addr = r[id]
        if (addr in ownerIds) {
            ownerIds[addr].push(id);
        } else {
            ownerIds[addr] = [id]
        }
    }
    return ownerIds
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
//search id is only there to save on rpc calls when contract doesnt have tokenOfOwnerByindex 
async function getIdsOfowner(ownerAddres , URIHandler, provider, searchIds=undefined, startBlockEventScan=17309202) {
    let startTime = Date.now();
    ownerAddres = ethers.utils.getAddress(ownerAddres)
    let foundIds=[]
    const nftAddr = await URIHandler.contractObj.address
    //TODO do try catch becuase mfrs be deploying proxys 
    if ((await contractHasFunction(nftAddr,"tokenOfOwnerByIndex(address,uint256)","../ui/abi/ERC721ABI.json", provider ))) {//wil just return empty array id tokenOfOwnerByindex doesnt exist :(
        const balance  = URIHandler.contractObj.balanceOf(ownerAddres);
        for (let i = 0; i<balance; i++) {
            foundIds.push(await URIHandler.contractObj.tokenOfOwnerByindex(i))
        }
        let timeTaken = Date.now() - startTime;   
        console.log("ids with tokenOfOwnerByindex of owner took: " + timeTaken + " milliseconds");
        console.log(foundIds)
        return foundIds
    } else {// scatter does proxis smh if(await contractHasFunction(nftAddr,"ownerBalanceToken(address)","./ERC721ArchetypeScatterABI.json", provider )) {
        try {
            const scatterNFTContObj = await getContractObj(nftAddr, "./ERC721ArchetypeScatterABI.json",provider)
            foundIds = (await scatterNFTContObj.tokensOfOwner(ownerAddres)).map((x)=>x.toNumber())

            let timeTaken = Date.now() - startTime;   
            console.log("ids with tokensOfOwner of owner took: " + timeTaken + " milliseconds");
        } catch (error) {
            console.warn(`nft: ${nftAddr} doesnt have ownerBalanceToken or tokenOfOwnerByIndex we need to scan transfer events now wich might take a while `)
            //maybe with events its faster
            if (true) {
                const toOwnerEventFilter = URIHandler.contractObj.filters.Transfer(null,ownerAddres)
                const fromOwnerEventFilter = URIHandler.contractObj.filters.Transfer(ownerAddres,null)
                const toOwnerEvents =  await URIHandler.contractObj.queryFilter(toOwnerEventFilter, startBlockEventScan)
                const fromOwnerEvents =  await URIHandler.contractObj.queryFilter(fromOwnerEventFilter, startBlockEventScan)
                let idTransferCount ={}
                for (const id of toOwnerEvents.map((x)=> Number(x.args[2]))) {
                    if (idTransferCount[id]) {
                        idTransferCount[id] += 1

                    } else {
                        idTransferCount[id] = 1
                    }
                }
                for (const id of fromOwnerEvents.map((x)=> Number(x.args[2]))) {
                    if (idTransferCount[id]) {
                        idTransferCount[id] -= 1

                    } else {
                        //prob cant happen but who knows
                        console.warn(`id: ${id} was send from ${ownerAddres} without recieving it first`)
                        idTransferCount[id] = -1
                    }
                }
                //console.log(idTransferCount)
                foundIds = Object.keys(idTransferCount).filter((x)=>idTransferCount[x]>0)
                let timeTaken = Date.now() - startTime;   
                console.log("ids with by scanning all event of a address took: " + timeTaken + " milliseconds");
                return foundIds
                
            }else {
                //takes forever on lamarpc lol
                const idsAndOwners = await getOwnerOfIds( URIHandler, searchIds)
                if (ownerAddres in idsAndOwners) {
                    let timeTaken = Date.now() - startTime;   
                    console.log("ids with by iter of whole ass supply of owner took: " + timeTaken + " milliseconds");
                    //38980 milliseconds
                    return idsAndOwners[ownerAddres]
                } else {
                    console.log("they dont have any :(")
                    return []
                }
                
            }

            
        }
        return foundIds

    }  


}

async function getPricesFromSudoSwapPools(poolAddrs,URIHandler, provider,ids=undefined) {
    //const nftContrObj = await getContractObj(nftAddr, `../ui/abi/ERC721ABI.json`, provider)
    const sudoSwapRouterAddr = "0x090C236B62317db226e6ae6CD4c0Fd25b7028b65";
    const routerObj = await getContractObj(sudoSwapRouterAddr, `./sudoSwap2RouterABI.json`, provider)
    let prices = {}
    for (const pairAddres of poolAddrs) {
        let price = Number(await routerObj.getNFTQuoteForBuyOrderWithPartialFill(pairAddres,1,0,0))//numnft 1, and rest can be 0 i hope :p
        const matchingIdsInPool = (await getIdsOfowner(pairAddres,URIHandler,provider, ids))
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
    let URI =  new uriHandler(nftContrObj, "http://127.0.0.1:8080",true, null, {})

    // const sudoSwapRouterAddr = "0x090C236B62317db226e6ae6CD4c0Fd25b7028b65";
    // const routerObj = await getContractObj(sudoSwapRouterAddr, `./sudoSwap2RouterABI.json`, provider)
    // let price = await routerObj.getNFTQuoteForBuyOrderWithPartialFill("0x3029Ab8F76cabf6Be5C976452897254532695E78",1,1,1)
    // console.log(price)
    // console.log(Number(price))

    console.log(latestBlock.number)
    //console.log(await URI.contractObj.tokenOfOwnerByindex(1))
    //console.log((await contractHasFunction("0x47957Cf51808f0B0F5C5B953A2A2B6b2B228CA33","ownerBalanceToken(address)","./ERC721ArchetypeScatterABI.json", provider )))
    const poolAddrs = await getAllPools(sudoswapPairFactory,provider)
    console.log(`found these pool address:`)
    console.log(poolAddrs)
    //console.log(await getIdsOfowner("0x3029Ab8F76cabf6Be5C976452897254532695E78", URI, provider))
    console.log(`found these prices for ${URI.contractObj.name}, ${URI.contractObj.address}`)
    console.log(await getPricesFromSudoSwapPools(poolAddrs[URI.contractObj.address],URI, provider))
    let timeTaken = Date.now() - startTime;   
    console.log("script ran for: " + timeTaken + " milliseconds");

    //TODO speed improvements
    //we can speed things up by making getIdsOfowner and getAllPools keep results and then scan events after the last scanned block
    //getIdsOfowner would cache results as all ids per address
    //getAllPools knows when that address is deployed which can help speed up getIdsOfowner if its scanning events

    //getAllPools might be able to do .nft() with multicall
    //
    //if a nft collection has a lot of pools doing a iter over a 10k collection with ownerOf might be faster then scanning events
    //
    //current stat on molady: 24277 ms llamarpc
    //current stat on molady: 66397 ms infura
    //current stat on molady: 96136 ms local full node (http://geth.dappnode:8545)
}


main()