
//const { error } = require("console");

//import  {ethers} from "../scripts/ethers-5.2.esm.min.js"
/**
 * This function allow you to modify a JS Promise by adding some status properties.
 * Based on: http://stackoverflow.com/questions/21485545/is-there-a-way-to-tell-if-an-es6-promise-is-fulfilled-rejected-resolved
 * But modified according to the specs of promises : https://promisesaplus.com/
 * https://ourcodeworld.com/articles/read/317/how-to-check-if-a-javascript-promise-has-been-fulfilled-rejected-or-resolved
 */
export function MakeQuerablePromise(promise) {
    // Don't modify any promise that has been already modified.
    if (promise.isFulfilled) return promise;

    // Set initial state
    var isPending = true;
    var isRejected = false;
    var isFulfilled = false;

    // Observe the promise, saving the fulfillment in a closure scope.
    var result = promise.then(
        function(v) {
            isFulfilled = true;
            isPending = false;
            return v; 
        }, 
        function(e) {
            isRejected = true;
            isPending = false;
            throw e; 
        }
    );

    result.isFulfilled = function() { return isFulfilled; };
    result.isPending = function() { return isPending; };
    result.isRejected = function() { return isRejected; };
    return result;
}

//TODO put this into URIHandler
export function isFulfilled(x) {
    if (x !== undefined) {
        return x.isFulfilled()
    } else {
        return false
    }

}

const delay = ms => new Promise(res => setTimeout(res, ms));

//TODO maybe attibute finder is better name? or maybe split classes
export class uriHandler {
    contractObj = undefined;
    provider = undefined
    extraUriMetaData = undefined;

    uriCache = []
    baseUriIsNonStandard = undefined;
    totalSupply = undefined
    baseURICache = undefined;
    ipfsGateway = undefined;
    everyAttribute = undefined;
    useCustomCompressedImages;
    idStartsAt = undefined;
    idsOfOwnerCache = {};
    ERC721ArchetypeScatterABI = undefined;
    baseUriExtension = "";
    attributeFormat = {
        pathToAttributeList: ["attributes"],
        traitTypeKey: "trait_type",
        valueKey: "value"
    } //TODO make this customizable with extraUriMetaDataFile
    //TODO fix naming
    constructor(contractObj, _ipfsGateway = "http://localhost:48084", _customCompressedImages = true, _extraUriMetaDataFile = "./extraUriMetaDataFile.json", _provider, _extraUriMetaData = undefined) {
        this.contractObj = contractObj;
        this.ipfsGateway = _ipfsGateway;
        this.useCustomCompressedImages = _customCompressedImages;
        this.provider = _provider
        if (_extraUriMetaDataFile) {
            this.extraUriMetaData = this.getExtraUriMetaData(contractObj, _extraUriMetaDataFile)
        } else {
            this.extraUriMetaData = _extraUriMetaData
        }

    }


    async getIdStartsAt() {
        //cheeky way to check for off by one errors :p
        if (this.idStartsAt === undefined) {
            try {
                await this.contractObj.ownerOf(0)
            } catch (error) {
                this.idStartsAt = 1
                return 1
            }
            this.idStartsAt = 0
            return 0
        } else {
            return this.idStartsAt
        }

    }

    async getCompressedImages() {
        return await this.getUrlByProtocol(((await this.extraUriMetaData).baseUriCompressed), true);

    }

    async fetchAllExtraMetaData(buildMissingData = true, extraUriMetaData = this.extraUriMetaData) {
        this.extraUriMetaData = await extraUriMetaData
        this.idsOfOwnerCache = await this.getCachedIdsOfOwner()
        if (!(typeof (localStorage) === "undefined") && localStorage.hasOwnProperty(await this.contractObj.address)) {
            console.log(`${this.contractObj.address} extraMetaDataFile was found in local storage :D`)
            const data = JSON.parse(localStorage.getItem(await this.contractObj.address));
            this.everyAttribute = data.everyAttribute;
            this.idStartsAt = data.idStartsAt;
            if ("totalsupply" in data) {
                this.totalSupply = parseInt(data.totalsupply)

            }
        } else if (buildMissingData) {
            await this.getEveryAttributeType();
            if ("idStartsAt" in (await this.extraUriMetaData) && Number.isInteger((await this.extraUriMetaData).idStartsAt)) {
                this.idStartsAt = (await this.extraUriMetaData).idStartsAt
            }
            if ("type" in (await this.extraUriMetaData)) {
                switch ((await this.extraUriMetaData).type) {
                    case "milady":
                        this.totalSupply = 9999 //contract is bugged and gives a total supply that too large
                        break;
                    default:
                        break;
                }
            }

        }
    }

    async getImage(id) {
        let reqObj = {
            method: 'GET',
            headers: {
                'Content-Type': '*'
            }
        }
        if (this.useCustomCompressedImages && ((await this.extraUriMetaData).baseUriCompressed)) {
            return `${await this.getCompressedImages()}/${id}.jpg`;
        }

        let imgURL = "";
        switch ((await this.extraUriMetaData).type) {
            case "standard":
                imgURL = (await this.getUrlByProtocol((await this.getTokenUri(id))["image"], true)) //(await fetch(await this.contractObj.tokenURI(id), reqObj))["image"];
                break;
            case "milady":
                // miladymaker.net cors wont allow me to get metadata :(
                imgURL = `https://www.miladymaker.net/milady/${id}.png`;
                break;
            default:
                //imgURL = `https://www.miladymaker.net/milady/${id}.png`;
                imgURL = (await this.getUrlByProtocol((await this.getTokenUri(id))["image"], true))
                break;
        }
        return imgURL;


    }
    async getTotalSupply() {
        //TOD assumption totalsupply staysthesame
        //TODO remove temp test value and add metadata to extraUriMetaDataFile to handle this and default to a better error handling when this value is incorrect
        if (this.totalSupply !== undefined) {

            return this.totalSupply
        } else {
            let id = 0;
            id = (await this.contractObj.totalSupply()).toNumber()
            //of by 100 error fix :P
            for (let tries = 0; tries < 100; tries++)
                try {
                    (await this.contractObj.ownerOf(id))
                    break
                } catch (error) {
                    id -= 1
                    console.warn(`bro what is the real last id lmao. am at ${id}`)
                }

            this.totalSupply = id
            return id
        }
    }

    async getBaseURI() {
        let baseUri = undefined;
        //TODO test
        //TODO IPFS
        //TODO get base uri by striping result .getTokenUri() becuase scatter doesnt have baseURI exposed :(
        if (this.baseURICache == null) {
            if ("type" in (await this.extraUriMetaData) && ((await this.extraUriMetaData).type === "milady")) {
                baseUri = this.getUrlByProtocol("ipfs://bafybeiawqw7zaoliz2rjgiqwzyykwzjsmr24i3a6paazalmqijsldtfg7i/", true)

            } else {
                try {
                    baseUri = (await this.contractObj.baseURI());
                    // base uri is always standard :)
                } catch {
                    let s;
                    try {
                        const i = 1
                        s = (await this.contractObj.tokenURI(i))

                        //TODO do a series of checks 
                        if (s.endsWith(`${i}`)) {
                            baseUri = s.slice(0, -1);
                        } else if (s.endsWith(`${i}.json`)) {
                            baseUri = s.slice(0, -6)
                            this.baseUriExtension = ".json"
                        } else {
                            console.warn(`NFT contract does not have baseURI() function and it's tokenURI() function return a non standard string: \n ${s}\n rolling with expensive rpc calls for now`)
                            this.baseUriIsNonStandard = true
                            baseUri = s
                        }
                    } catch (error) {
                        console.warn(`NFT contract does not have baseURI() function and it's tokenURI() function return a non standard string: \n ${s}\n rolling with expensive rpc calls for now`)
                        this.baseUriIsNonStandard = true
                        baseUri = s

                    }
                }
            }
        } else {
            return this.baseURICache
        }
        this.baseURICache = baseUri
        return baseUri;
    }

    async getExtraUriMetaData(contractObj, extraUriMetaDataFile) {
        let extraUriMetaData = await (await fetch(extraUriMetaDataFile)).json();
        const contractAddr = (await contractObj.address).toLowerCase()
        console.log(contractAddr, extraUriMetaData[contractAddr])

        if (contractAddr in extraUriMetaData) {
            return extraUriMetaData[contractAddr]
        } else {
            console.log(`Nft contract: ${contractAddr} not found in extraUriMetaDataFile: ${extraUriMetaDataFile}, setting to default values`)
            return { "found": false }
        }

    }

    async getUrisInBulk(startId = 0, endId = null, idList = null) {
        let uris = [];
        //iter from startId to endId
        if (idList === null) {
            //do entire supply if endId is null
            if (endId === null) {
                endId = await this.getTotalSupply()
            }
            for (let i = startId; i < endId; i++) {
                let id = i
                if (!(id % 200)) {
                    const m = `id:${id} out of:${await this.getTotalSupply()}`
                    console.log(m)
                    if (!(typeof (document) === "undefined")) {
                        document.getElementById("messageProgress").innerHTML = m

                    }
                }
                uris.push(this.getTokenUriNoCache(id));
            }

            //iter ofer idList
        } else {
            for (let i = 0; i < idList.length; i++) {
                let id = idList[i]
                uris.push(this.getTokenUriNoCache(id));
            }
        }
        return Promise.all(uris)
    }


    async syncUriCacheByScraping(startId = 0, endId = null, chunkSize = 300, idList = null) {
        let allUris = [];
        let allUrisFulFilled = [];
        //iter from startId to endId
        if (idList === null) {
            //do entire supply if endId is null
            if (endId === null) {
                endId = await this.getTotalSupply()
            }

            for(let id=startId; id<endId;id++) {
                

                allUris.push(MakeQuerablePromise( this.getTokenUriNoCache(id)))

                let fulfilledIndex = allUris.findIndex((x)=>isFulfilled(x))
                allUrisFulFilled[fulfilledIndex] = allUris[fulfilledIndex]
                delete allUris[fulfilledIndex]

                const tempOnlyPromisses = allUris.filter((x)=>x!==undefined)

                if (tempOnlyPromisses.length>=chunkSize) {
                    //console.log(`max request reached waiting till another finished to start proccess ${id}/${endId}`)
                    //console.log(`pending requests: ${tempOnlyPromisses.length}`)
                    await Promise.any(tempOnlyPromisses)
                }

                if (!(id % 20)) {
                    const m = `id:${id} out of:${this.totalSupply}`
                    //console.log(m)
                    if (!(typeof (document) === "undefined")) {
                        document.getElementById("messageProgress").innerText = m

                    }
                }
        
            }

            // let endChunk = 0;
            // for (let startChunk = 0; startChunk < endId;) {
            //     endChunk += chunkSize;
            //     if (endChunk > endId) { //brain cooked prob not good fix TODO
            //         endChunk = endId
            //     }
            //     let uris = await this.getUrisInBulk(startChunk, endChunk);
            //     allUris = [...allUris, ...uris];

            //     startChunk += chunkSize
            // }

            //iter ofer idList
        } else { console.error("TODO not implemeted") }
        // else {
        //     for (let i=0; i<idList.length; i++) {
        //         let id = idList[i]
        //         this.uriCache[id] = this.getTokenUriNoCache(id);
        //     }
        // }
        Object.assign(allUris,allUrisFulFilled)
        allUris = await Promise.all(allUris)
        console.log(allUris)
        return allUris
    }

    async getUrlByProtocol(urlString, returnOnlyUrl = false) {
        //console.log(urlString)
        let reqObj = {
            method: 'POST',
            // headers: {
            //     'Authorization': this.auth
            // },
            //body: form
        }
        let newUrlString = "";
        let urlObj = new URL(urlString)
        //console.log(urlObj)
        //console.log(`urlObj.pathname: ${urlObj.pathname}`)
        switch (urlObj.protocol) {
            case ("ipfs:"):
                newUrlString = `${this.ipfsGateway}/ipfs/${urlString.slice(7)}`//`${this.ipfsGateway}/ipfs/${urlObj.pathname.slice(2)}`;
                break
            case ("http:"):
                newUrlString = urlString;
                break
            case ("https:"):
                newUrlString = urlString;
                break
            default:
                newUrlString = urlString;
        }
        //console.log(newUrlString)
        if (returnOnlyUrl === true) {

            return newUrlString
        } else {
            return await fetch(newUrlString);
        }
    }

    async syncUriCache(startId = 0, endId = null, chunkSize = 200) {
        // const traitTypeKey = this.attributeFormat.traitTypeKey
        // const valueKey = this.attributeFormat.valueKey
        if ((await this.extraUriMetaData).scrapedUriData) {
            this.uriCache = await (await this.getUrlByProtocol((await this.extraUriMetaData).scrapedUriData)).json()
        } else {
            console.log(`no premade metadata found for ntf contract: ${await this.contractObj.address} :( collecting attribute manually!`)
            //syncUriCacheByScraping already
            //this.uriCache = 
            this.uriCache = await this.syncUriCacheByScraping(startId, endId, chunkSize)
            let emptyIdFormat = { "name": "WhoopsDoesntexist:p", "description": "WhoopsDoesntexist:p", "image": "WhoopsDoesntexist:p", "attributes": [] }

            this.uriCache = this.uriCache.map(function (element) {
                if (element === undefined) {
                    return emptyIdFormat
                } else {
                    return element
                }
            });
            //assumes that it starts either at 0 or 1 ofc
            if (this.uriCache[0].attributes.length === 0) {
                this.idStartsAt = 1
            }
        }
        return this.uriCache
    }

    async getTokenUriNoCache(id) {
        if (id < this.startId) {
            throw Error(`id: ${id} doenst exist`)
        }

        //const reqObj = {method: 'GET'}
        let retries = 0;
        let uriString = ""
        if (this.baseUriIsNonStandard) {
            try {
                uriString = (await this.contractObj.tokenURI(id))

            } catch (error) {
                console.log(`whoops errored on getting tokeUri from contract at id: ${id} it probably hasn't minted yet :(`)
                return undefined

            }

        } else {
            uriString = `${await this.getBaseURI()}${id}${this.baseUriExtension}`
        }

        //const URI =  await (await this.getUrlByProtocol()).json()
        while (retries < 4) {
            try {
                //await (await fetch("https://arweave.net/LGlMDKAWgcDyvYoft1YV6Y2pBBAwjWaFuZrDP9yD-RY/13.json")).json()
                //console.log(`${await this.getBaseURI()}${id}${this.baseUriExtension}`)
                const URI = await (await this.getUrlByProtocol(uriString)).json()
                //await (await fetch(`${await this.getBaseURI()}${id}`)).json();
                return URI
            } catch (error) {
                console.log(`errored on id: ${id} re-tried ${retries} times`)
                console.log(`error is: ${error}`);
                console.log(error)
                await delay(200);
            }
            retries += 1;
        }
    }

    async getTokenUri(id) {
        if (this.uriCache[id]) {
            return await this.uriCache[id]
        } else {
            this.uriCache[id] = await this.getTokenUriNoCache(id)
            return this.uriCache[id]
        }

    }

    async hasAttributeWithTokenUri(id, attribute) {
        //attribute = {"trait_type": "Background","value": "bjork"},
        //just incase this standart changes
        let tokenURI = null
        try {
            tokenURI = await this.getTokenUri(id)
        } catch (error) {
            console.error(`couldn't get token uri from token id: ${id} at base URI ${await this.getBaseURI()}. The error below is wat triggered this:`)
            console.error(error);
            return false
        }
        for (let i = 0; i < this.attributeFormat.pathToAttributeList.length; i++) {
            tokenURI = tokenURI[this.attributeFormat.pathToAttributeList[i]]
        }
        let attributeList = tokenURI;

        for (let i = 0; i < attributeList.length; i++) {
            let attributeType = JSON.stringify(attribute[this.attributeFormat.traitTypeKey]);
            let nftAttributeType = JSON.stringify(attributeList[i][this.attributeFormat.traitTypeKey]);
            let attributeValue = JSON.stringify(attribute[this.attributeFormat.valueKey]);
            let nftValue = JSON.stringify(attributeList[i][this.attributeFormat.valueKey]);
            if ((attributeType === nftAttributeType) && (attributeValue === nftValue)) {
                return true
            }
        }
        return false
    }

    hasAttributeWithEveryAttribute(id, attribute) {
        const traitTypeKey = this.attributeFormat.traitTypeKey;
        const valueKey = this.attributeFormat.valueKey;
        const traitType = attribute[traitTypeKey]
        const value = attribute[valueKey]
        const index = this.everyAttribute[traitType].attributes[value].ids.indexOf(JSON.stringify(id))
        return index !== -1

    }

    async hasAttribute(id, attribute) {
        if (this.everyAttribute) {
            return this.hasAttributeWithEveryAttribute(id, attribute)
        } else {
            return await this.hasAttributeWithTokenUri(id, attribute)
        }
    }

    getIdsWithEveryAtrribureObj(attribute) {
        console.log(attribute)
        if (!this.everyAttribute) {
            throw Error(`everyAttribute is: ${this.everyAttribute}`)
        } else {

            return this.everyAttribute[attribute[this.attributeFormat.traitTypeKey]].attributes[attribute[this.attributeFormat.valueKey]].ids
        }
    }


    getNumberWithinRange(arr, start, stop) {
        //TODO can we assume it sorted?
        // arr.sort(function(a, b) {
        //     return a - b;
        //   });
        return arr.filter(function (x) {
            return (x > start && x < stop);
        });
    }

    /**
     * returns set object with all matchin attributes
     * @param {Object} attribute 
     * @param {Int} startId 
     * @param {Int} endId 
     * @param {Set} idSet 
     * @param {Set} excludeIdSet
     * @return {Set} matchingIds
     */
    async getIdsByAttribute(attribute, startId = 0, endId = null, idSet = null, excludeIdSet = new Set()) {
        let matchingIds = new Set()
        if (!idSet || idSet.size === 0) {
            if (endId === null) {
                endId = await this.getTotalSupply()
            }

            if (this.everyAttribute) {
                let allIds = this.getIdsWithEveryAtrribureObj(attribute)
                if (startId === 0 && endId === await this.getTotalSupply()) {
                    matchingIds = new Set([...allIds])
                } else {
                    matchingIds = new Set([...this.getNumberWithinRange(allIds, startId, endId)])
                }

            } else {
                for (let id = startId; id < endId; id++) {
                    if (!excludeIdSet.has(id) && await this.hasAttribute(id, attribute) === true) {
                        matchingIds.add(id)
                    }
                }
            }
        } else {
            if (this.everyAttribute) {
                let allIds = this.getIdsWithEveryAtrribureObj(attribute)
                matchingIds = this.setIntersection(idSet, new Set([...allIds]))

            } else {
                for (const id of idSet) {
                    if (!excludeIdSet.has(id) && await this.hasAttribute(id, attribute) === true) {
                        matchingIds.add(id)
                    }
                }
            }

        }
        return matchingIds
    }

    /**
     * 
     * @param {Set} idSet 
     */
    async removeAttributeFromSet(attribute, idSet) {
        for (const id of idSet) {
            if (await this.hasAttribute(id, attribute) === true) {
                idSet.delete(id)
            }
        }
        return idSet

    }

    /**
     * 
     * @param {Object} attribute 
     * @param {Set} idSet 
     */
    async addAttributeToSet(attribute, idSet, startId = 0, endId = null) {
        if (endId === null) {
            endId = await this.getTotalSupply()
        }
        for (let id = startId; id < endId; id++) {
            if (!idSet.has(id)) {
                if (await this.hasAttribute(id, attribute) === true) {
                    idSet.add(id)
                }
            }

        }
        return idSet

        //range(startId,endId)
        //let newIdSet = new Set([...Array(endId-startId).keys()].map(i => i + startId));
    }
    setIntersection(setA, setB) {
        window.setA = setA
        window.setB = setB
        let intersectionSet = new Set();

        for (let i of setB) {
            if (setA.has(i)) {
                intersectionSet.add(i);
            }
        }
        return intersectionSet;
    }

    setComplement(setA, setB) {
        return new Set([...setA].filter(x => !setB.has(x)));
    }


    /**
     * 
     * @param {Object} inputs 
     * @return {Object} idSet
     */
    async processAndCondition(condition) {
        const inputs = condition.inputs //TODO make cleaner
        //const inputTypesOrder = ["idList", "attributes", "conditions"]
        let excludeIdSet = new Set();
        let idSet = new Set(); //maybe const if u do if else TODO

        if ("NOT" in condition && condition.NOT) {
            excludeIdSet = await this.processNotCondition(condition.NOT)
        }

        if ("idList" in inputs && typeof (inputs.idList) === "object" && Object.keys(inputs.idList).length) {
            idSet = new Set(inputs.idList) //idList = ids that we be checked if they have specified attributes and conditions
        }
        if ("attributes" in inputs && typeof (inputs.attributes) === "object" && Object.keys(inputs.attributes).length) {
            //do 1 attribute first to reduce the set of ids before parallelisation 
            const attributesCopy = [...inputs.attributes]
            const firstAttr = attributesCopy.shift()
            const firstAttrSet = (await this.getIdsByAttribute(firstAttr, 0, null, idSet, excludeIdSet))
            if (idSet.size) {
                idSet = this.setIntersection(idSet, firstAttrSet)
            } else {
                idSet = firstAttrSet
            }

            let newIdSets = []
            for (const attribute of attributesCopy) {
                newIdSets.push(this.getIdsByAttribute(attribute, 0, null, idSet, excludeIdSet)) //idSet excluded so theyre not processed (they're allready)
            }
            if (newIdSets.length) {
                for (const newIdSet of (await Promise.all(newIdSets))) {
                    idSet = this.setIntersection(idSet, newIdSet)
                }
            }
        }


        if ("conditions" in inputs && typeof (inputs.conditions) === "object" && Object.keys(inputs.conditions).length) {//TODO this can be a function?
            const conditionsClone = structuredClone(inputs.conditions)
            let newIdSets = []
            for (const con of conditionsClone) {
                con.idSetFromAndParent = idSet
                newIdSets.push(this.processCondition(con))
            }

            //paralelization TODO also do this for attributes?
            //TODO check if correct
            const resolvedNewIdSets = await Promise.all(newIdSets);
            //const resolvedNewIdSets = newIdSets.map((x) => [...x]);
            if (resolvedNewIdSets.length) {
                for (const newIdSet of resolvedNewIdSets) {
                    idSet = this.setIntersection(await idSet, await newIdSet)
                }

            }
        }
        idSet = this.setComplement(idSet, excludeIdSet)
        return idSet
    }


    /**
    * 
    * @param {Object} inputs 
    * @return {Object} idSet
    */
    async processOrCondition(condition) {
        const inputs = condition.inputs //TODO make cleaner
        //const inputTypesOrder = ["idList", "attributes", "conditions"]
        let excludeIdSet = new Set();;
        let idSet = new Set();

        if ("NOT" in condition && condition.NOT) {
            excludeIdSet = await this.processNotCondition(condition.NOT)
        }

        if ("idList" in inputs && typeof (inputs.idList) === "object" && Object.keys(inputs.idList).length) {
            idSet = new Set(inputs.idList) //idList = ids that we add to everything else
        }

        if ("attributes" in inputs && typeof (inputs.attributes) === "object" && Object.keys(inputs.attributes).length) {
            let newIdSets = []
            for (const attribute of inputs.attributes) {
                if ("idSetFromAndParent" in condition) {
                    newIdSets.push(this.getIdsByAttribute(attribute, 0, null, condition.idSetFromAndParent, new Set([...excludeIdSet, ...idSet]))) //idSet excluded so theyre not processed (they're allready)

                } else {
                    newIdSets.push(this.getIdsByAttribute(attribute, 0, null, null, new Set([...excludeIdSet, ...idSet]))) //idSet excluded so theyre not processed (they're allready)
                }

            }
            //paralelization
            newIdSets = await Promise.all(newIdSets);
            newIdSets = newIdSets.map((x) => [...x]);
            idSet = new Set([...idSet, ...newIdSets.flat()])
        }

        if ("conditions" in inputs && typeof (inputs.conditions) === "object" && Object.keys(inputs.conditions).length) {//TODO this can be a function?
            let newIdSets = []
            for (const con of inputs.conditions) {
                if (!"idList" in con.NOT || !con.NOT.idList) {
                    con.NOT.idList = []
                }
                con.NOT.idList = [...new Set([...idSet, ...con.NOT.idList])] //prevents that condition from checking ids that are already checked
                newIdSets.push(this.processCondition(con))
            }
            //paralelization
            newIdSets = await Promise.all(newIdSets);
            newIdSets = newIdSets.map((x) => [...x]);
            idSet = new Set([...idSet, ...newIdSets.flat()])
        }

        if (excludeIdSet.size) {
            idSet = this.setComplement(idSet, excludeIdSet);
        }
        return idSet

    }

    async processNotCondition(condition) {
        const inputs = condition //TODO make cleaner
        let idSet = new Set();
        if ("idList" in inputs && typeof (inputs.idList) === "object" && Object.keys(inputs.idList).length) {
            idSet = new Set(inputs.idList.map((x) => parseInt(x)))
        }
        //if ("attributes" in inputs && inputs.attributes)  {
        if ("attributes" in inputs && typeof (inputs.attributes) === "object" && Object.keys(inputs.attributes).length) {
            let newIdSets = []
            for (const attribute of inputs.attributes) {
                newIdSets.push(this.getIdsByAttribute(attribute, 0, null, null, idSet)) //idSet excluded so theyre not processed (they're allready)
            } //TODO this one is O(n*totalsupply) n=attributes but runs paralel. in serial it can be O(n-newIdSet) where n reduces on every iter since the ids already found can be skipped since theyre already included
            //paralelization
            newIdSets = await Promise.all(newIdSets);
            newIdSets = newIdSets.map((x) => [...x]);
            idSet = new Set([...idSet, ...newIdSets.flat()])
        }

        if ("conditions" in inputs && typeof (inputs.conditions) === "object" && Object.keys(inputs.conditions).length) {//TODO this can be a function?
            let newIdSets = []
            for (const con of inputs.conditions) {
                if (!"idList" in con.NOT || !con.NOT.idList) {
                    con.NOT.idList = []
                }
                con.NOT.idList = [...new Set([...idSet, ...con.NOT.idList])] //prevents that condition from checking ids that are already checked
                newIdSets.push(this.processCondition(con))
            }
            //paralelization
            newIdSets = await Promise.all(newIdSets);
            newIdSets = newIdSets.map((x) => [...x]);
            idSet = new Set([...idSet, ...newIdSets.flat()])
        }

        return idSet
    }

    async processRangeCondition(condition) { //TODO idlist?
        const inputs = condition.inputs //TODO make cleaner
        let excludeIdSet = new Set();
        if ((!("start" in inputs)) || !inputs.start || inputs.start === NaN) {
            inputs["start"] = Number(await this.getIdStartsAt())
        }

        if (!"stop" in inputs || !inputs.stop || inputs.stop === "totalSupply") {
            inputs["stop"] =  Number((await this.getTotalSupply())) + 1
        }
        let idSet = new Set([...Array(inputs.stop - inputs.start).keys()].map(i => i + inputs.start)) //range(inputs.start, inputs.stop)

        if ("idList" in inputs && typeof (inputs.idList) === "object" && Object.keys(inputs.idList).length) {
            idSet = new Set([...idSet, ...inputs.idList])
        }

        if ("NOT" in condition && condition.NOT) {
            excludeIdSet = await this.processNotCondition(condition.NOT)
        }

        if ("conditions" in inputs && typeof (inputs.conditions) === "object" && Object.keys(inputs.conditions).length) {//TODO this can be a function?
            let newIdSets = []
            //conditionsCopy = structuredClone(inputs.conditions)
            for (const con of inputs.conditions) {
                if (!"idList" in con.NOT || !con.NOT.idList) {
                    con.NOT.idList = []
                }
                con.NOT.idList = [...new Set([...idSet, ...con.NOT.idList])] //prevents that condition from checking ids that are already checked
                newIdSets.push(this.processCondition(con))
            }
            //paralelization
            newIdSets = await Promise.all(newIdSets);
            newIdSets = newIdSets.map((x) => [...x]);
            idSet = new Set([...idSet, ...newIdSets.flat()])

        }

        idSet = this.setComplement(idSet, excludeIdSet);
        return idSet


    }

    /**
     * 
     * @param {Object} condition 
     * @returns {Set} idSet
     */
    async processCondition(condition) {
        let idSet;
        //{"type":"OR", "input":{"idList":[]],"conditions":[], "attributes":[]}, "NOT":{"idList":[]],"conditions":[],"attributes":[]]}}
        switch (condition.type) {
            case ("AND"):
                idSet = await this.processAndCondition(condition)
                break
            case ("OR"):
                idSet = await this.processOrCondition(condition)
                break
            case ("RANGE"):
                idSet = await this.processRangeCondition(condition);
                break
            default:
                throw new Error(`Condition type: ${condition.type} not recognized'`);
        }
        return idSet;

    }

    //needs this for deep clone to prevent not idlist sticking around
    async processFilter(filterObj) {
        return this.processCondition(structuredClone(filterObj))
    }

    async getEveryAttributeTypeFromUriCache(uriCache, keepIds = true) {

        if (!uriCache || !uriCache.length) {
            uriCache = await this.syncUriCache()
        }
        this.totalSupply = uriCache.length - 1

        let everyAttribute = {}
        const uriKeys = Object.keys(uriCache).map(((x) => parseInt(x)));

        for (let id = 0; id < uriCache.length; id++) {
            const metaData = uriCache[id]
            if ("attributes" in metaData) {//uricache somtimes gets empty results from nft with broken max supplies like jay peg automart smh
                for (const attr of metaData.attributes) {
                    const traitType = attr[this.attributeFormat.traitTypeKey]
                    const value = attr[this.attributeFormat.valueKey]

                    if (!(traitType in everyAttribute)) {
                        const valueAsFloat = parseFloat(value)
                        if (isNaN(valueAsFloat)) { //check if value is number
                            everyAttribute[traitType] = { "dataType": "string", "attributes": {} };
                        } else {
                            everyAttribute[traitType] = { "dataType": "number", "min": valueAsFloat, "max": valueAsFloat, "attributes": {} };
                        }

                        everyAttribute[traitType]["attributes"][value] = { "amount": 1 }
                        if (keepIds) {
                            everyAttribute[traitType]["attributes"][value]["ids"] = [id];
                        }
                    } else {
                        if (!(value in everyAttribute[traitType]["attributes"])) { //checks if value is in list
                            if (everyAttribute[traitType]["dataType"] == "number") {
                                const valueAsFloat = parseFloat(value)
                                if (isNaN(valueAsFloat)) {
                                    everyAttribute[traitType]["dataType"] = "string";
                                    delete everyAttribute[traitType].min
                                    delete everyAttribute[traitType].max
                                } else {
                                    everyAttribute[traitType].min = Math.min(everyAttribute[traitType].min, valueAsFloat);
                                    everyAttribute[traitType].max = Math.max(everyAttribute[traitType].max, valueAsFloat);
                                }
                            }
                            everyAttribute[traitType]["attributes"][value] = { "amount": 1 };

                            if (keepIds) {
                                everyAttribute[traitType]["attributes"][value]["ids"] = [id];
                            }
                        } else {
                            everyAttribute[traitType]["attributes"][value]["amount"] += 1;
                            if (keepIds) {
                                everyAttribute[traitType]["attributes"][value]["ids"].push(id);
                            }

                        }

                    }
                }
            } else {
                if (!("noAttributes" in everyAttribute)) {
                    everyAttribute["noAttributes"] = { "attributes": { "nothing": { "ids": [id] } } }
                    everyAttribute["noAttributes"]["attributes"]["nothing"]["amount"] = 1
                    everyAttribute["noAttributes"]["dataType"] = "string"
                } else {
                    everyAttribute.noAttributes.attributes.nothing.ids.push(id)
                    everyAttribute["noAttributes"]["attributes"]["nothing"]["amount"] += 1
                }

            }
            if (uriCache[id] === undefined) { //if undefined means totalsupply on contract is wrong

                this.totalSupply = id - 1
            }
        }
        return everyAttribute

    }


    /**TODO handle when urichache possible to fetch
     * @returns {Object} attributes
     */
    async getEveryAttributeType(forceResync = false, keepIds = true, uriCache = this.uriCache) {


        //TODO make format global var

        if (!forceResync && (await this.extraUriMetaData).everyAttributeCbor) {
            if ((await this.extraUriMetaData).everyAttributeCbor) {
                console.log(`found preprossed data for contract: ${this.contractObj.address}, at  ${(await this.extraUriMetaData).everyAttributeCbor}`)
                const r = await this.getUrlByProtocol((await this.extraUriMetaData).everyAttributeCbor)
                this.everyAttribute = CBOR.decode(await r.arrayBuffer())
            }

            //this.everyAttribute = await (await this.getUrlByProtocol((await this.extraUriMetaData).everyAttribute)).json()
        } else {
            console.log(`no premade metadata found for ntf contract: ${await this.contractObj.address} :( collecting attributes manually!`)
            this.everyAttribute = await this.getEveryAttributeTypeFromUriCache(uriCache, keepIds)
            try {
                if (!(typeof (localStorage) === "undefined")) {
                    localStorage.setItem(await this.contractObj.address, JSON.stringify({ "idStartsAt": this.idStartsAt, "totalsupply": (await this.getTotalSupply()), "everyAttribute": this.everyAttribute }));

                }

            } catch (e) {
                console.warn("Couldnt save to local storage. Is it full?")
                console.log(e)
            }

        }
        return this.everyAttribute
    }

    async getIdsOfownerByEventScanning(ownerAddres, startBlockEventScan, nftContrObj = this.contractObj) {
        //ownerAddres = await ethers.utils.getAddress(ownerAddres)
        let idTransferCount = {}
        let startBlockOfResults = startBlockEventScan
        if (
            this.idsOfOwnerCache &&
            (ownerAddres in this.idsOfOwnerCache) &&
            (this.idsOfOwnerCache[ownerAddres].startBlock <= startBlockEventScan)
            
        ) {
            startBlockEventScan = this.idsOfOwnerCache[ownerAddres].endBlock
            startBlockOfResults = this.idsOfOwnerCache[ownerAddres].startBlock
            const ids = this.idsOfOwnerCache[ownerAddres].ids
            idTransferCount = Object.fromEntries(ids.map(key => [key, 1])); //set all founds ids to initial value of 1

        }   

        // to keep results consistent both to and from end scan at the same block
        const endBlock = (await this.provider.getBlock("latest")).number
        console.log(`scanning for transfer event from nft: ${await nftContrObj.name()}  at ${ownerAddres} starting from block: ${startBlockEventScan} till ${endBlock}`)
        const toOwnerEventFilter = nftContrObj.filters.Transfer(null, ownerAddres)
        const fromOwnerEventFilter = nftContrObj.filters.Transfer(ownerAddres, null)
        let toOwnerEvents
        let fromOwnerEvents
        let tries =0;
        while (tries < 10) {
            try {
                toOwnerEvents =  await nftContrObj.queryFilter(toOwnerEventFilter, startBlockEventScan, endBlock)
                fromOwnerEvents =  await nftContrObj.queryFilter(fromOwnerEventFilter, startBlockEventScan, endBlock)
                break 
            } catch (error) {
                tries +=1
                console.warn(`whoops fetching transfer events for ${ownerAddres} failed tried ${tries} times `)
                await delay(2000*tries) 
            }
        }
        for (const id of  toOwnerEvents.map((x) => Number(x.args[2]))) {
            if (idTransferCount[id]) {
                idTransferCount[id] += 1
            } else {
                idTransferCount[id] = 1
            }
        }
        for (const id of fromOwnerEvents.map((x) => Number(x.args[2]))) {
            if (idTransferCount[id]) {
                idTransferCount[id] -= 1
            } else {
                //prob cant happen but who knows
                console.warn(`id: ${id} was send from ${ownerAddres} without recieving it first`)
                idTransferCount[id] = -1
            }
        }
        const foundIds = Object.keys(idTransferCount).filter((x) => idTransferCount[x] > 0)
        this.idsOfOwnerCache[ownerAddres] = {["startBlock"]: startBlockOfResults,["endBlock"]:endBlock, ["ids"]:foundIds}
        //this.saveOwnerIdsCacheToStorage()
        console.log(`done scanning for transfer event from nft: ${await nftContrObj.name()}  at ${ownerAddres} starting from block: ${startBlockEventScan} till ${endBlock}`)
        return foundIds
    }

    async getIdsOfownerWithOwnerByindex(ownerAddres, nftContrObj = this.contractObj) {
        let foundIds = []
        const balance = await nftContrObj.balanceOf(ownerAddres);
        for (let i = 0; i < balance; i++) {
            foundIds.push(this.contractObj.tokenOfOwnerByIndex(ownerAddres,i))
        }
        //if (foundIds.length < balance-1) { throw Error(`balance is smaller then id found (${foundIds.length}). contract porbably doesnt support tokenOfOwnerByindex()`) }
        return Promise.all(foundIds)
    }

    async getIdsOfownerWithTokensOfOwner(ownerAddres, nftContrObj = this.contractObj) {
        const foundIds = (await nftContrObj.tokensOfOwner(ownerAddres)).map((x) => x.toNumber())
        return foundIds
    }

    //search id is only there to save on rpc calls when contract doesnt have tokenOfOwnerByindex 
    //17309202 = deployment block sudoswap2Factory
    async getIdsOfowner(ownerAddres, startBlockEventScan = 0, nftContrObj = this.contractObj) {
        //ownerAddres = await ethers.utils.getAddress(ownerAddres)
        let foundIds = []
        const nftAddr = await this.contractObj.address
        let tokenOfOwnerByindexFailed = false;
        //TODO do try catch becuase mfrs be deploying proxys 
        //if ((await contractHasFunction(nftAddr,"tokenOfOwnerByIndex(address,uint256)","../ui/abi/ERC721ABI.json", provider ))) {//wil just return empty array id tokenOfOwnerByindex doesnt exist :(
        try {
            foundIds = await this.getIdsOfownerWithOwnerByindex(ownerAddres, nftContrObj)
        } catch (error) {
            console.log(error)
            //console.log(`OfownerWithOwnerByindex failed trying TokensOfOwner`)
            tokenOfOwnerByindexFailed = true
        }

        let idsOfownerWithTokensOfOwnerFailed = false;
        if (tokenOfOwnerByindexFailed) {// scatter does proxis smh if(await contractHasFunction(nftAddr,"ownerBalanceToken(address)","./ERC721ArchetypeScatterABI.json", provider )) {
            try {
                //TODO getContractObj, ERC721ArchetypeScatterABI
                foundIds = await this.getIdsOfownerWithTokensOfOwner(ownerAddres, nftContrObj)

            } catch (error) {
                idsOfownerWithTokensOfOwnerFailed = true
            }
        }

        if (idsOfownerWithTokensOfOwnerFailed) {
            //console.warn(`nft: ${nftAddr} doesnt have ownerBalanceToken or tokenOfOwnerByIndex we need to scan transfer events now wich might take a while `)
            foundIds = await this.getIdsOfownerByEventScanning(ownerAddres, startBlockEventScan, nftContrObj)
        }
        return foundIds
    }


    async getCachedIdsOfOwner(source = this.extraUriMetaData.idsOfOwner) {
        console.log(`fetching id from ${source}`)
        if (Object.keys(this.idsOfOwnerCache).length) {
            return this.idsOfOwnerCache
        }
        if (source) {
    
            this.idsOfOwnerCache = await (await this.getUrlByProtocol(source)).json()
            return this.idsOfOwnerCache
        } else {
            return {}
        }
    }


    //might be faster then event scanning but can also be innaccurate becuase not every ownerOf() call is in the same block
    async getOwnerOfIdsWithOwnerOf(ids = undefined) {
        if (!ids || ids.length === 0) {
            const totalSupply = await this.getTotalSupply()
            const firstId = await this.getIdStartsAt()
            console.log(totalSupply)
            console.log(firstId)
            ids = [...Array(totalSupply - firstId).keys()].map(i => i + firstId) //await URIHandler.getTotalSupply()
        }
        let r = []
        for (const id of ids) {
            //console.log(id)
            try {
                r[id] = await this.contractObj.ownerOf(id)
            } catch (error) {

            }
        }
        await Promise.all(r)
        const endBlock = (await this.provider.getBlock("latest")).number
        let ownerIds = {}
        for (const id in r) {
            const addr = r[id]
            if (addr in ownerIds) {
                ownerIds[addr]["ids"].push(id);
            } else {
                ownerIds[addr] = {
                    ["endBlock"]: endBlock,
                    ["startBlock"]: 0,
                    ["ids"]: [id]
                }
            }
        }

        this.idsOfOwnerCache = ownerIds
        this.saveOwnerIdsCacheToStorage()

        return ownerIds
    }

    async saveOwnerIdsCacheToStorage(outputFilePath=undefined) {
        //TODO cleanup
        try {
            if (!(typeof (localStorage) === "undefined")) {
                localStorage.setItem(`balancesOf-${await this.contractObj.address}`, JSON.stringify(this.idsOfOwnerCache));
            }
            if (outputFilePath) {
                try {
                    console.log(`writing to ${outputFilePath}`)
                    await Bun.write(outputFilePath, JSON.stringify(this.idsOfOwnerCache,null,2));

                } catch (error) {
                    console.log("failed to write")
                    console.log(error)
                }
            }


        } catch (e) {
            console.warn("Couldnt save to local storage. Is it full?")
            console.log(e)
        }
    }



}