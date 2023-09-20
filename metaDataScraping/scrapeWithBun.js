//import fetch from "node-fetch";
import {uriHandler} from "../../ui/scripts/uriHandler.js";
import {ethers} from "../../ui/scripts/ethers-5.2.umd.min.js"


async function getContractObj(address="",provider) {
    let ERC721ABIFile =Bun.file(`${import.meta.dir}/../../ui/abi/ERC721ABI.json`);
    let ERC721ABI = await ERC721ABIFile.json();
    return  new ethers.Contract(address, ERC721ABI, provider);

}

async function main() {
    console.log("hello")
    let r = await fetch("https://elementals-metadata.azuki.com/elemental/1000")
    if (r.statusText === "Forbidden") { 
        console.log(":(")
    } else {
        console.log(await r.json())
    }
    //console.log(import.meta.dir)
    const contractAddr = "0xB6a37b5d14D502c3Ab0Ae6f3a0E058BC9517786e"
    const provider = new ethers.providers.JsonRpcProvider('https://geth.577975ff8cb80eb4.dyndns.dappnode.io');
    const contractObj = await getContractObj(contractAddr, provider)

    //const uriHandlerModule = require('../../ui/scripts/uriHandler.js');
    let URI =  new uriHandler(contractObj, "http://127.0.0.1:8080",true, null, {})

    //console.log(await getContractObj("0xbfe47d6d4090940d1c7a0066b63d23875e3e2ac5", provider))
    await URI.fetchAllExtraMetaData()
    //console.log(u)
    await Bun.write(`${import.meta.dir}/${contractAddr}.json`, JSON.stringify(URI.everyAttribute, null, 2));
}

main()