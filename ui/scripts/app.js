import { uriHandler } from "./uriHandler.js";

let provider;
if (window.ethereum) {
<<<<<<< HEAD
    window.provider = new ethers.providers.Web3Provider(window.ethereum);
} else {
    console.log("couldn't connect to inject ethereum provide, connecting to external provicer")
    window.provider = new ethers.providers.JsonRpcProvider('https://eth.llamarpc.com');
=======
    provider = new ethers.providers.Web3Provider(window.ethereum);
} else {
    console.log("couldn't connect to inject ethereum provide, connecting to external provicer")
    provider = new ethers.providers.JsonRpcProvider('https://eth.llamarpc.com');
>>>>>>> 0bc37d9fa994a5eb6a5d61f27eaa985d86314249
}

//TODO remove
const attr1 = { "trait_type": "Hat", "value": "cake hat" }
const attr2 = { "trait_type": "Race", "value": "black" }
const attr3 = { "trait_type": "Background", "value": "bushland" }
const attr4 = { "trait_type": "Shirt", "value": "maf creeper" }
//const attr5 = {"trait_type":"Hat","value":"cake hat"}
const attr6 = { "trait_type": "Hair", "value": "tuft brown" }

//[9,8,7,6,5,6,7,8,9,10,11,12] that have [attr1] but exclude those that have attr2
//window.f1 ={"type":"AND", "inputs":{"idList":[9,8,7,6,5,6,7,8,9,10,11,12,6999,5825,9796,6143],"conditions":[], "attributes":[attr1]},"NOT":{"idList":[],"conditions":[],"attributes":[attr2]}}
let f1 = { "type": "OR", "inputs": { "attributes": [{ "trait_type": "Hat", "value": "cake hat" }, { "trait_type": "Hat", "value": "alien hat" },  { "trait_type": "Hat", "value": "migoko hat" }] }, "NOT":{"attributes":[{"trait_type": "Race","value": "clay"}, {"trait_type": "Race","value": "black"},{"trait_type": "Race","value": "tan"} ]} }
//includes [90,80,70,60,50], [attr3,attr4] but not [1,2,3,4]
let f2 = { "type": "OR", "inputs": { "idList": [90, 80, 70, 60, 50], "conditions": [], "attributes": [attr3, attr4] }, "NOT": { "idList": [2748, 2986], "conditions": [], "attributes": [] } }

//0 till 5000 except attr4
let f3 = { "type": "RANGE", "inputs": { "start": 0, "stop": 5000 }, "NOT": { "idList": [], "conditions": [], "attributes": [attr4] } }
// everything except f3
let f4 = { "type": "RANGE", "inputs": { "start": 0, "stop": null }, "NOT": { "idList": [], "conditions": [f3], "attributes": [] } }

//includes results from [f1,f2] and those with [attr6] but excludes [f4]
//every att6(tuft brown), f1 (9-12,6999,5825,9796,6143 that has cake hat and isnt black), f2 90,80,70,60,50 = all bushland + all maf creeper but not 2748,2986
// but not f4 (5001-10000 but cakehat is allowed)

window.f5 = { "type": "OR", "inputs": { "idList": [], "conditions": [f1, f2], "attributes": [attr6] }, "NOT": { "idList": [], "conditions": [f4], "attributes": [] } }

let f6 = { "type": "AND", "inputs": { "idList": [], "conditions": [], "attributes": [{ "trait_type": "Hat", "value": "alien hat" }, {"trait_type":"Eyes","value":"teary"}] }, "NOT": { "idList": [], "conditions": [], "attributes": [] } }

let f7 = { "type": "OR", "inputs": { "idList": [], "conditions": [f6], "attributes": [{ "trait_type": "Hat", "value": "cake hat" }, { "trait_type": "Hat", "value": "migoko hat" }] }, "NOT": { "idList": [], "conditions": [], "attributes": [] } }

let f8 = { "type": "AND", "inputs": { "conditions": [f1, f2, f3, f4, f5, f6] } }

window.f9 = { "type": "RANGE", "inputs": { "idList": [], "conditions": [], "attributes": [] }, "NOT": { "idList": [], "conditions": [], "attributes": [] } }


window.BlueHair = {"type":"OR","inputs":{"idList":[],"conditions":[],"attributes":[{"trait_type":"Hair","value":"bowl blue"},{"trait_type":"Hair","value":"tuft blue"},{"trait_type":"Hair","value":"short blue"},{"trait_type":"Hair","value":"og blue"},{"trait_type":"Hair","value":"braid blue"}]},"NOT":{"idList":[],"conditions":[],"attributes":[]},"filterName":"blueHair","filterIndex":9}

window.BlueEyesAndHair= {"type":"AND","inputs":{"idList":[],"conditions":[window.BlueHair],"attributes":[{"trait_type":"Eye Color","value":"blue"}]},"NOT":{"idList":[],"conditions":[],"attributes":[]},"filterName":"BlueEyesAndHair","filterIndex":10}

window.blackTennisPlayers = {"type":"AND","inputs":{"idList":[],"conditions":[],"attributes":[{"trait_type":"Race","value":"black"},{"trait_type":"Background","value":"tennis"}]},"NOT":{"idList":[],"conditions":[],"attributes":[]},"filterName":"newFilter12","filterIndex":11}
window.emptyFilter = {"type":"RANGE","inputs":{"idList":[],"conditions":[],"attributes":[]},"NOT":{"idList":[],"conditions":[],"attributes":[]},"filterName":"emptyfilter1","filterIndex":12}

function message(message) {
    console.log(message);
    document.getElementById("message").innerHTML = message;
}


async function connectSigner() {
    // MetaMask requires requesting permission to connect users accounts
    await provider.send("eth_requestAccounts", []);
    window.signer = await provider.getSigner();
    if (isWalletConnected()) {
        //TODO make run on connect function
        await loadAllContracts()
        await refreshDeployedContractsUi();
        provider.on(
            miladyDropFactoryContract.filters.CreateNewDrop(await window.signer.getAddress()), (log, event) => {
                window.deployedDropAddress = ethers.utils.defaultAbiCoder.decode(["address"], log.data)[0]
                refreshDeployedContractsUi();
                message(`confirmed at: ${log.transactionHash} ,deployed at: ${window.deployedDropAddress} `);
                // Emitted whenever a contract from the user is deploye
            }
        )
        return [provider, signer];
    }

}
//TODO do event listeners
window.connectSigner = connectSigner

async function getMiladyDropContract(provider, urlVars) {
    mildayDropAddress = urlVars["mildayDropAddress"]
    //const mildayDropAbi = 
    // The Contract object
    mildayDropContract = new ethers.Contract(mildayDropAddress, mildayDropAbi, provider);
    return mildayDropContract;
}
//TODO do event listeners
window.getMiladyDropContract = getMiladyDropContract

async function getMiladyDropFactoryContract(provider, mildayDropFactoryAddress, mildayDropFactoryAbi = window.mildayDropFactoryAbi) {
    window.mildayDropFactoryContract = new ethers.Contract(mildayDropFactoryAddress, mildayDropFactoryAbi, provider);
    return mildayDropFactoryContract;
}

async function getAirdropTokenContract(provider, nftAddress) {
    const airDropTokenAddress = await mildayDropContract.airdropTokenAddress();
    // The ERC-20 Contract ABI, which is a common contract interface
    // for tokens (this is the Human-Readable ABI format)
    // The Contract object
    const airdropTokenContract = new ethers.Contract(airDropTokenAddress, ERC20ABI, provider);
    return airdropTokenContract;
}
//TODO do event listeners
window.getAirdropTokenContract = getAirdropTokenContract

async function getNftContract(provider, nftContractAddress) {
    // The Contract object
    window.nftContract = new ethers.Contract(nftContractAddress, ERC721ABI, provider);
    return nftContract;

}

async function getUserNftIds(userAddress) {
    var ids = [];
    let userBalance = (await window.nftContract.balanceOf(userAddress)).toNumber();
    for (let i = 0; i < userBalance; i++) {
        ids.push((await window.nftContract.tokenOfOwnerByIndex(userAddress, i)).toNumber());

    }
    return ids;
}
//TODO do event listeners
window.getUserNftIds = getUserNftIds

async function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}

function isWalletConnected() {
    let message = "";
    if (signer == null) {
        message = "wallet not connected";
        console.log(message);
        document.getElementById("message").innerHTML = message;
        return false
    } else {
        document.getElementById("message").innerHTML = message;
        return true;
    }
}

function readFile(input) {
    let file = input.files[0];
    let result = ""

    let reader = new FileReader();
    window.currenFileName = file["name"];


    reader.readAsText(file);
    reader.onload = function () {
        result += reader.result;
    }

    reader.onloadend = function () {
        window.currentFileString = result;
    }
};
//TODO do event listeners
window.readFile = readFile

function isInterger(string) {

    if (isNaN(parseInt(string))) {
        return (false)
    } else {
        return (true);
    }
};

function formatBalanceMap(balanceMap) {
    let formatedBalanceMap = {}
    for (var i = 0; i < balanceMap.length; i++) {
        const line = balanceMap[i];
        const address = line[0];
        const amount = line[1];
        if (ethers.utils.isAddress(address) && isInterger(amount)) {
            formatedBalanceMap[balanceMap[i][0]] = balanceMap[i][1];

        } else {
            console.log("skipped this line");
            console.log(line);
        };
    };
    return (formatedBalanceMap);
};
//TODO do event listeners
window.toggleExclude = toggleExclude

function downloadString(text, fileType, fileName) {
    var blob = new Blob([text], { type: fileType });

    var a = document.createElement('a');
    a.download = fileName;
    a.href = URL.createObjectURL(blob);
    a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
}
//TODO do event listeners
window.toggleExclude = toggleExclude

function formatBalanceMapIds(balanceMap) {
    let formatedBalanceMap = {}
    for (var i = 0; i < balanceMap.length; i++) {
        const line = balanceMap[i];
        const id = line[0];
        const amount = line[1];
        if (isInterger(id) && isInterger(amount)) {
            formatedBalanceMap[balanceMap[i][0]] = balanceMap[i][1]

        } else {
            message(`cant read this line: ${line} \n skipped it.`)
        }
    }
    return (formatedBalanceMap);
}

function csvToBalanceMapJSON(file) {
    message(`parsing csv`)
    var balanceMap = Papa.parse(file)["data"];
    var formatedBalanceMap = formatBalanceMapIds(balanceMap);
    message(`building merkle tree on: ${Object.keys(formatedBalanceMap).length} claims.`)
    let merkle = uniswapMerkle.parseBalanceMapOnIds(formatedBalanceMap);
    let newFilename = currenFileName.split(".")[0] + ".json";
    //downloadString(JSON.stringify(merkle, null, 2), "json", newFilename)
    return merkle;
}

function goToclaim() {
    window.x = document.getElementById("infuraIpfsForm").elements;
    const currentUrl = new URL(window.location.href)
    //TODO set address
    location.replace(`/?mildayDropAddress=${window.deployedDropAddress}&ipfsApi=${x.ipfsApi.value}&projectId=${x.projectId.value}&projectSecret=${x.keySecret.value}`)
}
//TODO do event listeners
window.goToclaim = goToclaim

async function claimIndexIpfsFromCsv(csvString = window.currentFileString) {
    const merkle = await csvToBalanceMapJSON(csvString);
    message(`created merkle tree with merkle root: ${merkle['merkleRoot']}`)
    window.dropsRootHash = await window.ipfsIndex.createIpfsIndex(merkle, 780, { "merkleRoot": merkle['merkleRoot'] });

}
//TODO do event listeners
window.claimIndexIpfsFromCsv = claimIndexIpfsFromCsv

//TODO remove default value
async function deployDropContract(requiredNFTAddress = "0xbaa9cbdac7a1e3f376192dfac0d41fce4fc4a564", airDropTokenAddress = "0xaf98D8B8C7611F68cf630A43b117A0e1f666d2EA", ipfsIndex = window.ipfsIndex) {
    const merkleRoot = ipfsIndex.metaData.merkleRoot;
    const claimDataIpfs = ipfsIndex.dropsRootHash;


    if (isWalletConnected()) {
        message(`creating deploy tx with ${requiredNFTAddress}, ${airDropTokenAddress}, ${merkleRoot}, ${claimDataIpfs}`)
        window.tx = window.miladyDropFactoryContractWithSigner.createNewDrop(requiredNFTAddress, airDropTokenAddress, merkleRoot, claimDataIpfs);
    }
    message(`submitted transaction at: ${(await tx).hash}`);
    const confirmedTX = (await (await (await tx).wait(1)).transactionHash);
    window.reciept = (await provider.getTransactionReceipt(confirmedTX));
    window.deployedDropAddress = await ethers.utils.defaultAbiCoder.decode(["address"], reciept.logs[0].data)[0];
    message(`confirmed transaction at: ${(await tx).hash}, deployed at: ${window.deployedDropAddress}`);


    return 0;

}
//TODO do event listeners
window.deployDropContract = deployDropContract

async function getDeployedContractsFromUser(userAddress = window.signer.getAddress()) {
    let contractAddresses = [];

    for (let i = 0; i < 1000000; i++) {
        try {
            let drop = await miladyDropFactoryContract.DeployedDrops(i);
            console.log(drop)
            if (drop["deployerAddress"] === await userAddress) {
                contractAddresses.push(await drop["dropAddress"])
            }
        }
        catch {
            break
        }
    }
    document.getElementById("deployedDropsList").innerHTML = JSON.stringify(contractAddresses, 2);
    return contractAddresses

}

function copyClaimUrl(index) {
    // Get the text field
    var url = window.claimUrls[index];

    // Select the text field
    // copyText.select();
    // copyText.setSelectionRange(0, 99999); // For mobile devices

    // Copy the text inside the text field
    navigator.clipboard.writeText(url);
}
//TODO do event listeners
window.copyClaimUrl = copyClaimUrl

async function displayDeployedContracts(contractAddresses) {
    window.claimUrls = []
    let html = ""
    for (let i = 0; i < contractAddresses.length; i++) {
        window.claimUrls.push(`${new URL(window.location.href).origin}/claim/?mildayDropAddress=${contractAddresses[i]}`)
        html += `
        <div class="tooltip" onclick="copyClaimUrl(${i})"> \n 
            ${window.claimUrls[i]} \n
            <span class="tooltiptext">Click to copy</span>
        </div> 
        <br/>
        `
        //`<p onclick="copyClaimUrl(${i})"> ${window.claimUrls[i]}</p><br> \n`
    }
    console.log(`${html}`)
    document.getElementById("deployedDropsList").innerHTML = `${html}`;

}

async function refreshDeployedContractsUi() {
    let contractAddresses = await getDeployedContractsFromUser(window.signer.getAddress())
    await displayDeployedContracts(contractAddresses);
}

function updatedDisplayedNft(id, target) {
    const NOTidList = fBuilder.getCurrentFilter().NOT.idList
    const index = NOTidList.indexOf(id)
    if(index === -1 ) {
        document.getElementById(`exlcudeStatusDiv${id}`).textContent ="excuded click to undo";
        document.getElementById(`exlcudeStatusDiv${id}`).style.background="rgba(100, 100, 100, 0.8)";
        fBuilder.addItem(fBuilder.currentFilterIndex, id, target)
    } else {
        document.getElementById(`exlcudeStatusDiv${id}`).textContent ="click to exclude"
        document.getElementById(`exlcudeStatusDiv${id}`).style.background="rgba(20, 50, 200, 0.8)";
        fBuilder.removeItem(fBuilder.currentFilterIndex, index, target)
        
    }

}

async function toggleExclude(id, target) {
    //displayNfts(0, 12)
    updatedDisplayedNft(id,target)
    //await fBuilder.displayFilter(fBuilder.currentFilterIndex)
    document.getElementById("editFilter").innerHTML = fBuilder.getEditFilterUi()
}
//TODO do event listeners
window.toggleExclude = toggleExclude

function getImageWidth(availableWidth) {
    const amountImages = Math.round(0.001829*screen.availWidth + 2.488)
    const margin = 1//(availableWidth/amountImages)*0.001;
    return (availableWidth/amountImages - margin)

}

function getRowSize(availableWidth) {
    return Math.round(availableWidth/(getImageWidth(availableWidth)+1))
}

<<<<<<< HEAD
async function displayNfts(currentPage, maxPerPage = 12, availableWidth,sort="id") {
    const URI = window.URI //TODO
    const ids = window.currentIdsDisplay;
=======
async function displayNfts(currentPage, maxPerPage = 12, availableWidth) {
    const ids = window.currentIdsDisplay;
    const URI = window.URI //TODO
>>>>>>> 0bc37d9fa994a5eb6a5d61f27eaa985d86314249
    let images = ""
    for (let i = 0; i < maxPerPage; i++) {
        if ((currentPage * maxPerPage + i) > (ids.length - 1)) {
            break
        }
        //cancel pending loading images
        try {
            document.getElementById(`image${i}`).src = ""
        } catch { }

        let id = ids[currentPage * maxPerPage + i]
        const NOTidList = fBuilder.getCurrentFilter().NOT.idList
        let exlcudeStatusDivMsg
        let exlcudeStatusDivColor
        if(NOTidList.indexOf(id) === -1 ) {
            exlcudeStatusDivMsg ="click to exclude"
            exlcudeStatusDivColor ="rgba(20, 50, 200, 0.8)"
            //fBuilder.addItem(fBuilder.currentFilterIndex, target, id)
        } else {
            exlcudeStatusDivMsg ="excluded click to undo"
            exlcudeStatusDivColor ="rgba(100, 100, 100, 0.8)"
            //const index = NOTidList.indexOf(id)
            //fBuilder.removeItem(fBuilder.currentFilterIndex, target, index)
            
        }
  
        const url = await URI.getImage(id)
<<<<<<< HEAD
        let priceDiv =""
        if (id in window.fBuilder.formattedListings) {
            const price = `${window.fBuilder.formattedListings[id][0].value/10**18} ${window.fBuilder.formattedListings[id][0].currency}`
            priceDiv = `<div id="price${id}"            style="font-size: 0.6em;float: right; position: absolute; right: 0px; top: 0px; z-index: 1; background-color: rgba(140, 140, 140, 0.8); padding: 5px; color: #FFFFFF; font-weight: bold;">\n 
            ${price}\n 
            </div>\n `

        }
        images += `<div id="NFT${id}" onclick="toggleExclude(${id}, [\'NOT\',\'idList\'] )" ; style="position: relative; margin: 2px; cursor:pointer; 
                width: ${getImageWidth(availableWidth)}vw; display: inline-block;" >\n 
                <img src="${url}" id="image${i}" style="max-width: 100%; max-height: 100%;">\n 
                <div id="exlcudeStatusDiv${id}" style="font-size: 0.6em;float: right; position: absolute; left: 0px; bottom: 2px; z-index: 1; background-color: ${exlcudeStatusDivColor}; padding: 5px; color: #FFFFFF; font-weight: bold;">\n 
                ${exlcudeStatusDivMsg}\n 
                </div>
                ${priceDiv}
=======
        images += `<div id="NFT${id}" onclick="toggleExclude(${id}, [\'NOT\',\'idList\'] )" ; style="position: relative; margin: 2px; cursor:pointer; 
                width: ${getImageWidth(availableWidth)}vw; display: inline-block;" >\n 
                <img src="${url}" id="image${i}" style="max-width: 100%; max-height: 100%;">\n 
                <div id="exlcudeStatusDiv${id}" style="font-size: 0.8em;float: right; position: absolute; left: 0px; bottom: 0px; z-index: 1; background-color: ${exlcudeStatusDivColor}; padding: 5px; color: #FFFFFF; font-weight: bold;">\n 
                ${exlcudeStatusDivMsg}\n 
                </div>\n 
>>>>>>> 0bc37d9fa994a5eb6a5d61f27eaa985d86314249
            </div>\n `
    }
    //TODO make field for "go to page: x"
    const amountPages = Math.ceil(ids.length / maxPerPage - 1)
    const pageSelecter = `
        <button onclick="displayNfts(${Math.max(0, currentPage - 1)},${maxPerPage}, ${availableWidth})">prev</button><button onclick="displayNfts(${Math.min(amountPages, currentPage + 1)},${maxPerPage}, ${availableWidth})">next</button> <button onclick="displayNfts(0,${maxPerPage}, ${availableWidth})">first</button><button onclick="displayNfts(${amountPages},${maxPerPage}, ${availableWidth})">last</button>
        page: ${currentPage + 1} of: ${amountPages + 1} pages \n`
    document.getElementById("nftImages").innerHTML = `${pageSelecter} </br> ${images} </br> ${pageSelecter}`
}

function getAmountOfRows(availWidth=screen.availWidth) {
    return Math.abs(Math.ceil(-0.001948*availWidth + 6.701))
} 

<<<<<<< HEAD


=======
>>>>>>> 0bc37d9fa994a5eb6a5d61f27eaa985d86314249
window.displayNfts = displayNfts

async function runFilter(currentFilter=fBuilder.getCurrentFilter()) {
    let start = Date.now();
    document.getElementById('nftImages').style.display = 'none' //TODO this applies only after the function is done

<<<<<<< HEAD
    window.currentIdsDisplay = [...structuredClone(await fBuilder.runFilter("asc"))]
    //window.currentIdsDisplay.sort(())
=======
    window.currentIdsDisplay = [...structuredClone(await fBuilder.runFilter())]
>>>>>>> 0bc37d9fa994a5eb6a5d61f27eaa985d86314249

    displayNfts(0, getRowSize(77)*getAmountOfRows(), 77) //3 rows
    document.getElementById('nftImages').style.display = 'initial'

    let timeTaken = Date.now() - start;   
    console.log("running filter took: " + timeTaken + " milliseconds");
    document.getElementById("message").innerHTML = `width:${screen.availWidth} height:${screen.availHeight}`
}
window.runFilter = runFilter

function hideDiv(id) {
    document.getElementById(id).setAttribute("hidden", "hidden")
}

function showDiv(id) {
    document.getElementById("message").removeAttribute("hidden")
}

function isPrivateIP(ip="") {
    if (ip.startsWith("localhost")) {
        return (true)
    }
    var parts = ip.split('.');
    return parts[0] === '10' || 
       (parts[0] === '172' && (parseInt(parts[1], 10) >= 16 && parseInt(parts[1], 10) <= 31)) || 
       (parts[0] === '192' && parts[1] === '168') || (parts[0] === '127');
 }

async function test() {
    //let response = await fetch('./merkle_proofs/index.json')
    // if (!isWalletConnected()) {
    //     return 0http://127.0.0.1:45005
    // }



    window.URI = await new uriHandler(nftContract, window.urlVars["ipfsGateway"],true, "./scripts/extraUriMetaDataFile.json")
    window.baseURI = await window.URI.getBaseURI()
    let fullUrl = "nonstandard tokenURI function TODO"
    if (!(await window.URI.extraUriMetaData).everyAttributeCbor && (!localStorage.hasOwnProperty(window.URI.contractObj.address))) {
        
        let comment = "note: fetching large amount of data from external providers can cause rate limiting"
        if(window.baseURI !== undefined) {
            fullUrl = await window.URI.getUrlByProtocol(window.baseURI,true)

        }
        if ((window.baseURI !== undefined) && (new URL(window.baseURI)).protocol ==="ipfs:") {
            if (isPrivateIP(new URL(window.urlVars["ipfsGateway"]).hostname)) {
                comment = `you'r using a local ipfs node. Based :D`
            }
        }
        showDiv("message")
        document.getElementById("message").innerHTML = `
        pre processed data for nft contract: ${window.URI.contractObj.address} is not found.</br>
        Want to build it now? <button onclick='getFilterBuilderUi(window.URI)'>yes</button><button onclick='hideDiv("message")'>no</button></br>
        </br>
        Total supply is: ${await window.URI.getTotalSupply()}</br> 
        metadata will be fetched from: ${fullUrl}</br>

        This can take 1min to 10min</br>
        <a style='font-size:0.4cm'>${comment}</a>
        `
    } else {
        console.log("hiiiiiii")
        getFilterBuilderUi(window.URI,fullUrl)

    }
    

};

async function getFilterBuilderUi(URI,fullUrl="") {
    let start = Date.now();
    document.getElementById("message").innerHTML = `this may take between 1min to 10min</br> fetching from ${fullUrl}
    <div id='messageProgress'></div>`
    await URI.fetchAllExtraMetaData()
<<<<<<< HEAD
    window.fBuilder = await new FilterBuilder(window.URI, structuredClone([f1,f2,window.emptyFilter, window.BlueHair, window.BlueEyesAndHair]))
    //fBuilder.displayFilter(0)
    fBuilder.currentFilterIndex=4;
=======
    window.fBuilder = await new FilterBuilder(window.URI, structuredClone([f1,f2,window.emptyFilter]))
    //fBuilder.displayFilter(0)
    fBuilder.currentFilterIndex=2;
>>>>>>> 0bc37d9fa994a5eb6a5d61f27eaa985d86314249
    

    console.log(window.currentIdsDisplay)
    if (window.urlVars["filter"]) {
        fBuilder.importFilterBase58CBOR(window.urlVars["filter"])
    } else {
        fBuilder.getUi();
    }
<<<<<<< HEAD
    await fBuilder.syncListings()
=======
>>>>>>> 0bc37d9fa994a5eb6a5d61f27eaa985d86314249
    await runFilter()
    let timeTaken = Date.now() - start;   
    console.log("fetching metadata took: " + timeTaken + " milliseconds");
    hideDiv("message")

}
window.getFilterBuilderUi = getFilterBuilderUi

window.onload = runOnLoad;

async function runOnLoad() {
    window.urlVars = await getUrlVars();
    //TODO
    // u = new URL(window.location.href)
    // base = u.host+u.pathname
    window.mildayDropFactoryAbiFile = await fetch('./abi/mildayDropFactoryAbi.json');
    console.log(await (await fetch('./abi/mildayDropAbi.json')).json())
    console.log(window)
    window.mildayDropAbiFile = await fetch('./abi/mildayDropAbi.json');
    let ERC721ABIFile = await fetch('./abi/ERC721ABI.json');
    let ERC20ABIFile = await fetch('./abi/ERC20ABI.json');
    //mildayDropAbi = await window.mildayDropAbiFile.json();
    window.mildayDropFactoryAbi = await window.mildayDropFactoryAbiFile.json();
    window.ERC721ABI = await ERC721ABIFile.json();
    window.ERC20ABI = await ERC20ABIFile.json();

    //TODO make function to connect ipfs indexer and option for is gateway in ui
    //TODO test if can connect 
    //connect api
    window.ipfsApi = window.urlVars["ipfsApi"]
    window.auth = null;
    if (window.urlVars["projectId"] != null) {
        const projectId = window.urlVars["projectId"]
        const projectSecret = window.urlVars["projectSecret"]
        window.auth = "Basic " + btoa(projectId + ":" + projectSecret);

    } else {
        window.auth = null
    }
    console.log(window.auth)
    window.ipfsIndex = new ipfsIndexer(window.ipfsApi, window.auth, false);

    await loadAllContracts()
    test()

}


async function loadAllContracts() {
    window.urlVars = await getUrlVars();
    //window.miladyDropContract = await getMiladyDropContract(provider, urlVars);
    //window.miladyDropContractWithSigner = window.miladyDropContract.connect(signer);
    window.miladyDropFactoryContract = await getMiladyDropFactoryContract(provider, urlVars["mildayDropFactoryAddress"]);
    window.miladyDropFactoryContractWithSigner = await window.miladyDropFactoryContract.connect(window.signer);
    //on claim ui -> window.nftContract = await getNftContract(provider, "0xbAa9CBDAc7A1E3f376192dFAC0d41FcE4FC4a564");
    window.nftContract = await getNftContract(provider, urlVars["nft"]);
    //load indexer
    //claimDataIpfsHash = await mildayDropContract.claimDataIpfs(); //await window.ipfsIndex.createIpfsIndex(balanceMapJson, splitSize=780);//"bafybeigdvozivwvzn3mrckxeptstjxzvtpgmzqsxbau5qecovlh4r57tci"
    //window.ipfsIndex = new ipfsIndexer(window.ipfsApi, window.auth , isGateway=false);
    //await window.ipfsIndex.loadIndex(claimDataIpfsHash);
}
window.loadAllContracts = loadAllContracts
