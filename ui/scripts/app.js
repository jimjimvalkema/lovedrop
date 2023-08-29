// TODO get 3rd party provider incase user doesnt connect 
const provider = new ethers.providers.Web3Provider(window.ethereum);

//TODO remove
const attr1 = { "trait_type": "Hat", "value": "cake hat" }
const attr2 = { "trait_type": "Race", "value": "black" }
const attr3 = { "trait_type": "Background", "value": "bushland" }
const attr4 = { "trait_type": "Shirt", "value": "maf creeper" }
//const attr5 = {"trait_type":"Hat","value":"cake hat"}
const attr6 = { "trait_type": "Hair", "value": "tuft brown" }

//[9,8,7,6,5,6,7,8,9,10,11,12] that have [attr1] but exclude those that have attr2
//window.f1 ={"type":"AND", "inputs":{"idList":[9,8,7,6,5,6,7,8,9,10,11,12,6999,5825,9796,6143],"conditions":undefined, "attributes":[attr1]},"NOT":{"idList":undefined,"conditions":undefined,"attributes":[attr2]}}
window.f1 = { "type": "OR", "inputs": { "attributes": [{ "trait_type": "Hat", "value": "cake hat" }, { "trait_type": "Hat", "value": "alien hat" },  { "trait_type": "Hat", "value": "migoko hat" }] }, "NOT":{"attributes":[{"trait_type": "Race","value": "clay"}, {"trait_type": "Race","value": "black"},{"trait_type": "Race","value": "tan"} ]} }
//includes [90,80,70,60,50], [attr3,attr4] but not [1,2,3,4]
let f2 = { "type": "OR", "inputs": { "idList": [90, 80, 70, 60, 50], "conditions": undefined, "attributes": [attr3, attr4] }, "NOT": { "idList": [2748, 2986], "conditions": undefined, "attributes": undefined } }

//0 till 5000 except attr4
let f3 = { "type": "RANGE", "inputs": { "start": 0, "stop": 5000 }, "NOT": { "idList": undefined, "conditions": undefined, "attributes": [attr4] } }
// everything except f3
let f4 = { "type": "RANGE", "inputs": { "start": 0, "stop": null }, "NOT": { "idList": undefined, "conditions": [f3], "attributes": undefined } }

//includes results from [f1,f2] and those with [attr6] but excludes [f4]
//every att6(tuft brown), f1 (9-12,6999,5825,9796,6143 that has cake hat and isnt black), f2 90,80,70,60,50 = all bushland + all maf creeper but not 2748,2986
// but not f4 (5001-10000 but cakehat is allowed)

window.f5 = { "type": "OR", "inputs": { "idList": undefined, "conditions": [f1, f2], "attributes": [attr6] }, "NOT": { "idList": undefined, "conditions": [f4], "attributes": undefined } }

let f6 = { "type": "OR", "inputs": { "idList": [], "conditions": [{ "type": "AND", "inputs": { "idList": [], "conditions": [], "attributes": [{ "trait_type": "Hat", "value": "alien hat" }, { "trait_type": "Eyes", "value": "teary" }] }, "NOT": { "idList": [], "conditions": [], "attributes": [] } }], "attributes": [{ "trait_type": "Hat", "value": "cake hat" }, { "trait_type": "Hat", "value": "migoko hat" }] }, "NOT": { "idList": [], "conditions": [], "attributes": [] } }

let f7 = { "type": "AND", "inputs": { "conditions": [f1, f2, f3, f4, f5, f6] } }

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
                deployedDropAddress = ethers.utils.defaultAbiCoder.decode(["address"], log.data)[0]
                refreshDeployedContractsUi();
                message(`confirmed at: ${log.transactionHash} ,deployed at: ${deployedDropAddress} `);
                // Emitted whenever a contract from the user is deploye
            }
        )
        return [provider, signer];
    }
}

async function getMiladyDropContract(provider, urlVars) {
    mildayDropAddress = urlVars["mildayDropAddress"]
    //const mildayDropAbi = 
    // The Contract object
    mildayDropContract = new ethers.Contract(mildayDropAddress, mildayDropAbi, provider);
    return mildayDropContract;
}

async function getMiladyDropFactoryContract(provider, mildayDropFactoryAddress, mildayDropFactoryAbi = window.mildayDropFactoryAbi) {
    mildayDropFactoryContract = new ethers.Contract(mildayDropFactoryAddress, mildayDropFactoryAbi, provider);
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

async function getNftContract(provider, nftContractAddress) {
    // The Contract object
    nftContract = new ethers.Contract(nftContractAddress, ERC721ABI, provider);
    return nftContract;

}

async function getUserNftIds(userAddress) {
    var ids = [];
    let userBalance = (await nftContract.balanceOf(userAddress)).toNumber();
    for (let i = 0; i < userBalance; i++) {
        ids.push((await nftContract.tokenOfOwnerByIndex(userAddress, i)).toNumber());

    }
    return ids;
}

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
    currenFileName = file["name"];


    reader.readAsText(file);
    reader.onload = function () {
        result += reader.result;
    }

    reader.onloadend = function () {
        window.currentFileString = result;
    }
};

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
        line = balanceMap[i];
        address = line[0];
        amount = line[1];
        if (ethers.utils.isAddress(address) && isInterger(amount)) {
            formatedBalanceMap[balanceMap[i][0]] = balanceMap[i][1];

        } else {
            console.log("skipped this line");
            console.log(line);
        };
    };
    return (formatedBalanceMap);
};

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

function formatBalanceMapIds(balanceMap) {
    let formatedBalanceMap = {}
    for (var i = 0; i < balanceMap.length; i++) {
        line = balanceMap[i];
        id = line[0];
        amount = line[1];
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

async function claimIndexIpfsFromCsv(csvString = window.currentFileString) {
    merkle = await csvToBalanceMapJSON(csvString);
    message(`created merkle tree with merkle root: ${merkle['merkleRoot']}`)
    window.dropsRootHash = await window.ipfsIndex.createIpfsIndex(merkle, splitSize = 780, metaData = { "merkleRoot": merkle['merkleRoot'] });

}

//TODO remove default value
async function deployDropContract(requiredNFTAddress = "0xbAa9CBDAc7A1E3f376192dFAC0d41FcE4FC4a564", airDropTokenAddress = "0xaf98D8B8C7611F68cf630A43b117A0e1f666d2EA", ipfsIndex = window.ipfsIndex) {
    const merkleRoot = ipfsIndex.metaData.merkleRoot;
    const claimDataIpfs = ipfsIndex.dropsRootHash;


    if (isWalletConnected()) {
        message(`creating deploy tx with ${requiredNFTAddress}, ${airDropTokenAddress}, ${merkleRoot}, ${claimDataIpfs}`)
        window.tx = window.miladyDropFactoryContractWithSigner.createNewDrop(requiredNFTAddress, airDropTokenAddress, merkleRoot, claimDataIpfs);
    }
    message(`submitted transaction at: ${(await tx).hash}`);
    confirmedTX = (await (await (await tx).wait(1)).transactionHash);
    window.reciept = (await provider.getTransactionReceipt(confirmedTX));
    window.deployedDropAddress = await ethers.utils.defaultAbiCoder.decode(["address"], reciept.logs[0].data)[0];
    message(`confirmed transaction at: ${(await tx).hash}, deployed at: ${window.deployedDropAddress}`);


    return 0;

}

async function getDeployedContractsFromUser(userAddress = window.signer.getAddress()) {
    let contractAddresses = [];
    for (i = 0; i < 1000000; i++) {
        try {
            let drop = await miladyDropFactoryContract.DeployedDrops(i);
            if (drop["deployer"] === await userAddress) {
                contractAddresses.push(await drop["dropAddress"])
            }
        }
        catch {
            break
        }
    }
    //document.getElementById("deployedDropsList").innerHTML = JSON.stringify(contractAddresses, 2);
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

async function displayDeployedContracts(contractAddresses) {
    window.claimUrls = []
    html = ""
    for (i = 0; i < contractAddresses.length; i++) {
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
    document.getElementById("deployedDropsList").innerHTML = `${html}`;

}

async function refreshDeployedContractsUi() {
    let contractAddresses = await getDeployedContractsFromUser(window.signer.getAddress())
    await displayDeployedContracts(contractAddresses);
}

async function displayNfts(currentPage, maxPerPage = 12) {
    const ids =await window.idsOnDisplay;
    const URI = window.URI //TODO
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
        url = await URI.getImage(id)
        images += `<div id="NFT${id}" onclick="toggleExclude(${id})" style="position: relative; margin: 2px; cursor:pointer; border:5px solid green; width: 15%; display: inline-block;" >\n 
                <img src="${url}" id="image${i}" style="max-width: 100%; max-height: 100%;">\n 
                <div  style="float: right; position: absolute; left: 0px; bottom: 0px; z-index: 1; background-color: rgba(20, 200, 20, 0.8); padding: 5px; color: #FFFFFF; font-weight: bold;">\n 
                    click to exclude (TODO)\n 
                </div>\n 
            </div>\n `
    }
    //TODO make field for "go to page: x"
    const amountPages = Math.ceil(ids.length / maxPerPage - 1)
    pageSelecter = `
        <p> <button onclick="displayNfts(${Math.max(0, currentPage - 1)},${maxPerPage})">prev</button><button onclick="displayNfts(${Math.min(amountPages, currentPage + 1)},${maxPerPage})">next</button>
        page: ${currentPage + 1} of: ${amountPages + 1} pages </p> \n`
    document.getElementById("nftImages").innerHTML = `${pageSelecter} <br>\n  ${images} ${pageSelecter}`
}


async function test() {
    //let response = await fetch('./merkle_proofs/index.json')
    // if (!isWalletConnected()) {
    //     return 0
    // }


    let start = Date.now();
    u = await new uriHandler(nftContract, window.urlVars["ipfsApi"])
    await u.syncUriCache();
    window.currentIdsDisplay = await u.processFilter(f1)
    let timeTaken = Date.now() - start;
    console.log("Total time taken : " + timeTaken + " milliseconds");
    console.log(window.currentIdsDisplay)

    window.idsOnDisplay = [...window.currentIdsDisplay]
    window.URI = u
    displayNfts(0, 12)

    window.fBuilder = await new FilterBuilder(window.URI, [f1,f2,f3,f4,f5,f6])
    //fBuilder.displayFilter(0)
    fBuilder.filtersDropDown();
    //console.log(html)


};

window.onload = runOnLoad;

async function runOnLoad() {
    window.urlVars = await getUrlVars();
    window.mildayDropFactoryAbiFile = await fetch('./../abi/mildayDropFactoryAbi.json');
    window.mildayDropAbiFile = await fetch('./../abi/mildayDropAbi.json');
    let ERC721ABIFile = await fetch('./../abi/ERC721ABI.json');
    let ERC20ABIFile = await fetch('./../abi/ERC20ABI.json');
    mildayDropAbi = await window.mildayDropAbiFile.json();
    mildayDropFactoryAbi = await window.mildayDropFactoryAbiFile.json();
    ERC721ABI = await ERC721ABIFile.json();
    ERC20ABI = await ERC20ABIFile.json();

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
    window.ipfsIndex = new ipfsIndexer(window.ipfsApi, window.auth, isGateway = false);

    await loadAllContracts()

}


async function loadAllContracts() {
    window.urlVars = await getUrlVars();
    //window.miladyDropContract = await getMiladyDropContract(provider, urlVars);
    //window.miladyDropContractWithSigner = window.miladyDropContract.connect(signer);
    window.miladyDropFactoryContract = await getMiladyDropFactoryContract(provider, urlVars["mildayDropFactoryAddress"]);
    window.miladyDropFactoryContractWithSigner = await window.miladyDropFactoryContract.connect(window.signer);
    window.nftContract = await getNftContract(provider, "0xbAa9CBDAc7A1E3f376192dFAC0d41FcE4FC4a564");
    //load indexer
    //claimDataIpfsHash = await mildayDropContract.claimDataIpfs(); //await window.ipfsIndex.createIpfsIndex(balanceMapJson, splitSize=780);//"bafybeigdvozivwvzn3mrckxeptstjxzvtpgmzqsxbau5qecovlh4r57tci"
    //window.ipfsIndex = new ipfsIndexer(window.ipfsApi, window.auth , isGateway=false);
    //await window.ipfsIndex.loadIndex(claimDataIpfsHash);
}
