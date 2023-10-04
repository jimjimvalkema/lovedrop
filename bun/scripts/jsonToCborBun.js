//CBOR is broken borc works :) 
//https://github.com/hildjj/node-cbor/issues/43#issuecomment-901219336
import * as CBOR from "borc";

//import {ipfsIndexer} from "../../ui/scripts/ipfsIndexer";
//const ipfsIndexer = require("../../ui/scripts/ipfsIndexer")
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


//TODO windows different path
//TODO detect if full path or relative
//maybe ./?
const workingDir = getWorkingDir()
const jsonFilePath = `${workingDir}/${Bun.argv[2]}`
const outputCBORPath = `${workingDir}/${Bun.argv[2].split(".")[0]}.CBOR`

const jsonFile = Bun.file(jsonFilePath)
const CBORData =  CBOR.encode((await jsonFile.json()))

const CBORDataAsFile = new File([CBORData], `/${`${Bun.argv[2].split(".")[0]}.CBOR`}`)
await Bun.write(outputCBORPath, CBORDataAsFile);


const hash = (await addToIpfs("http://127.0.0.1:5001/",CBORDataAsFile, `${Bun.argv[2].split(".")[0]}.CBOR`, true, 1)).Hash
console.log(hash)