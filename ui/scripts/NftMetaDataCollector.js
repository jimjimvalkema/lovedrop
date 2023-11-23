
//const { error } = require("console");

//import assertion are not supported in firefox :((
import { ethers } from "./ethers-5.2.esm.min.js"
import { allExtraMetaData }  from "./extraMetaData.js"
import { ERC721ABI }  from "../abi/ERC721ABI.js"

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
        function (v) {
            isFulfilled = true;
            isPending = false;
            return v;
        },
        function (e) {
            isRejected = true;
            isPending = false;
            throw e;
        }
    );

    result.isFulfilled = function () { return isFulfilled; };
    result.isPending = function () { return isPending; };
    result.isRejected = function () { return isRejected; };
    return result;
}

export function isFulfilled(x) {
    if (x !== undefined) {
        return x.isFulfilled()
    } else {
        return false
    }

}

const delay = ms => new Promise(res => setTimeout(res, ms));

export class NftMetaDataCollector {
    alchemyApiKey = ""
    contractObj = undefined;
    provider = undefined
    extraMetaData = undefined;

    uriCache = []
    baseUriIsNonStandard = undefined;
    totalSupply = undefined
    baseURICache = undefined;
    ipfsGateway = undefined;
    idsPerAttribute = undefined;
    useCustomCompressedImages = false;
    idStartsAt = undefined;
    contractName = undefined;
    idsOfOwnerCache = {};
    baseUriExtension = "";
    attributeFormat = {
        pathToAttributeList: ["attributes"],
        traitTypeKey: "trait_type",
        valueKey: "value"
    } //TODO make this customizable with extraUriMetaDataFile
    //TODO fix naming
    constructor(
        _contractAddr,
        _provider,
        _ipfsGateway = "https://ipfs.io",
        _customCompressedImages = true
        )
        
        {
        this.contractObj = new ethers.Contract(_contractAddr, ERC721ABI, _provider);;
        this.ipfsGateway = _ipfsGateway;
        this.useCustomCompressedImages = _customCompressedImages;
        this.provider = _provider
        this.extraMetaData = this.getExtraUriMetaData(_contractAddr, allExtraMetaData);
    }

    getExtraUriMetaData(contractAddr, allExtraMetaData) {
        if (contractAddr in allExtraMetaData) {
            return allExtraMetaData[contractAddr]
        } else {
            console.log(`Nft contract: ${contractAddr} not found in extraUriMetaData:, setting to default values`)
            return {
                "type": "standard"
            }
        }
    }

    async getNftImgElement(id) {
        const img = document.createElement("img")
        img.src = await this.getImage(id)

        if (img.src.startsWith(this.ipfsGateway)) {
            img.crossOrigin='anonymous'
        } 
        return img
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
        return await this.getUrlByProtocol(( this.extraMetaData.compressedImages), true);

    }

    async fetchAllExtraMetaData(buildMissingData = true) {
        this.idsOfOwnerCache = await this.getCachedIdsOfOwner()
        if (!(typeof (localStorage) === "undefined") && localStorage.hasOwnProperty(await this.contractObj.address)) {
            console.log(`${this.contractObj.address} extraMetaDataFile was found in local storage :D`)
            const data = JSON.parse(localStorage.getItem(await this.contractObj.address));
            this.idsPerAttribute = data.idsPerAttribute;
            this.idStartsAt = data.idStartsAt;
            if ("totalsupply" in data) {
                this.totalSupply = parseInt(data.totalsupply)

            }
        } else if (buildMissingData) {
            await this.getIdsPerAttribute();
            if ("idStartsAt" in this.extraMetaData && Number.isInteger(this.extraMetaData.idStartsAt)) {
                this.idStartsAt =  this.extraMetaData.idStartsAt
            }
            if ("type" in this.extraMetaData) {
                switch (this.extraMetaData.type) {
                    case "milady":
                        this.totalSupply = 9999 //contract is bugged and gives a total supply that too large
                        break;
                    case "blockedCors":
                        this.uriCache = await this.syncUriCache();
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
        if (this.useCustomCompressedImages && ("compressedImages" in this.extraMetaData)) {
            let extension = ".jpg"
            if ("imageFileExtesion" in (this.extraMetaData)) {
                //console.log( await (this.extraUriMetaData).imageFileExtesion)
                extension = (this.extraMetaData).imageFileExtesion
            }
            return `${await this.getCompressedImages()}/${id}${extension}`;
        }

        let imgURL = "";
        switch (this.extraMetaData.type) {
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
            try {
                id = (await this.contractObj.totalSupply()).toNumber()

            } catch (error) {
                console.warn("uriHandeler had a error")
                console.warn(error)
                return undefined
            }

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

    async getContractName() {
        if(this.contractName) {
            return this.contractName

        } else {
            this.contractName = await this.contractObj.name()
            return this.contractName
        }
    
    }

    async getContractSymbol() {
        if(this.contractSymbol) {
            return this.contractSymbol

        } else {
            this.contractSymbol = await this.contractObj.symbol()
            return this.contractSymbol
        }
    
    }


    async getTokenName(id, timeout=90000) {

        const tokenUri = await this.getTokenUri(id, timeout)

        if (tokenUri && "name" in tokenUri) {
            return tokenUri["name"]
        } else {
            console.warn(`name for id ${id} not found in tokenUri using "contractName + id" instead`)
            let name = (await this.getContractName())
            if (name.length >10) {
                name=name.slice(0,9)+"-"
            }
            return `${name} ${id}`
        }
    }

    async getBaseURI() {
        let baseUri = undefined;
        //TODO test
        //TODO IPFS
        //TODO get base uri by striping result .getTokenUri() becuase scatter doesnt have baseURI exposed :(
        if (this.baseURICache == null) {
            if ("type" in  this.extraMetaData && ( this.extraMetaData.type === "milady")) {
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

            for (let id = startId; id < endId; id++) {


                allUris.push(MakeQuerablePromise(this.getTokenUriNoCache(id)))

                let fulfilledIndex = allUris.findIndex((x) => isFulfilled(x))
                allUrisFulFilled[fulfilledIndex] = allUris[fulfilledIndex]
                delete allUris[fulfilledIndex]

                const tempOnlyPromisses = allUris.filter((x) => x !== undefined)

                if (tempOnlyPromisses.length >= chunkSize) {
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
        Object.assign(allUris, allUrisFulFilled)
        allUris = await Promise.all(allUris)
        return allUris
    }

    async getUrlByProtocol(urlString, returnOnlyUrl = false, timeout=null) {
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
            if (timeout) {
                const controller = new AbortController();
                const id = setTimeout(() => controller.abort(), 5000);
              
                const response = await fetch(newUrlString, {signal: controller.signal });
                clearTimeout(id);
                return response;

            } else {
                return await fetch(newUrlString);
            }
        }
    }

    async syncUriCache(startId = 0, endId = null, chunkSize = 200) {
        // const traitTypeKey = this.attributeFormat.traitTypeKey
        // const valueKey = this.attributeFormat.valueKey
        if ( this.extraMetaData.metaDataArray) {
            this.uriCache = await (await this.getUrlByProtocol( this.extraMetaData.metaDataArray)).json()
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

    async getTokenUriNoCache(id, timeout=null) {
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
        while (retries < 1) {
            try {
                //await (await fetch("https://arweave.net/LGlMDKAWgcDyvYoft1YV6Y2pBBAwjWaFuZrDP9yD-RY/13.json")).json()
                //console.log(`${await this.getBaseURI()}${id}${this.baseUriExtension}`)
                const URI = await (await this.getUrlByProtocol(uriString, timeout)).json()
                //await (await fetch(`${await this.getBaseURI()}${id}`)).json();
                return URI
            } catch (error) {
                console.log(`errored on id: ${id} re-tried ${retries} times`)
                console.log(`error is: ${error}`);
                console.log(error)
                console.log(`request was: ${uriString}`)
                await delay(50);
            }
            retries += 1;
        }
    }

    async getTokenUri(id, timeout=null) {
        if (this.uriCache[id]) {
            return await this.uriCache[id]
        } else {
            this.uriCache[id] = await this.getTokenUriNoCache(id, timeout)
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

    hasAttributeWithIdsPerAttribute(id, attribute) {
        const traitTypeKey = this.attributeFormat.traitTypeKey;
        const valueKey = this.attributeFormat.valueKey;
        const traitType = attribute[traitTypeKey]
        const value = attribute[valueKey]
        const index = this.idsPerAttribute[traitType].attributes[value].ids.indexOf(JSON.stringify(id))
        return index !== -1

    }

    async hasAttribute(id, attribute) {
        if (this.idsPerAttribute) {
            return this.hasAttributeWithIdsPerAttribute(id, attribute)
        } else {
            return await this.hasAttributeWithTokenUri(id, attribute)
        }
    }

    getIdsWithIdsPerAttribute(attribute) {
        if (!this.idsPerAttribute) {
            throw Error(`idsPerAttribute is: ${this.idsPerAttribute}`)
        } else {

            return this.idsPerAttribute[attribute[this.attributeFormat.traitTypeKey]].attributes[attribute[this.attributeFormat.valueKey]].ids
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

            if (this.idsPerAttribute) {
                let allIds = this.getIdsWithIdsPerAttribute(attribute)
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
            if (this.idsPerAttribute) {
                let allIds = this.getIdsWithIdsPerAttribute(attribute)
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

    amountOfItemsInInputs(inputs) {
        let itemsCount = 0;
        for (const inputType in inputs) {
            itemsCount += inputs[inputType].length
        }
        return itemsCount
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

        if ((!("NOT" in condition) && !("inputs" in condition)) ||
            ((this.amountOfItemsInInputs(condition.NOT) === 0) && (this.amountOfItemsInInputs(condition.inputs) === 0))) {
            const firstId = await this.getIdStartsAt()
            return new Set([...Array((await this.getTotalSupply()) - firstId).keys()].map(i => i + firstId))

        }

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

        if ((!("NOT" in condition) && !("inputs" in condition)) ||
            ((this.amountOfItemsInInputs(condition.NOT) === 0) && (this.amountOfItemsInInputs(condition.inputs) === 0))) {
            const firstId = await this.getIdStartsAt()
            return new Set([...Array((await this.getTotalSupply()) - firstId).keys()].map(i => i + firstId))

        }

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
            inputs["stop"] = Number((await this.getTotalSupply())) + 1
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

    async buildIdsPerAttributeFromUriCache(uriCache, keepIds = true) {

        if (!this.uriCache || !this.uriCache.length) {
            this.uriCache = await this.syncUriCache()
        }
        this.totalSupply = this.uriCache.length - 1

        let idsPerAttribute = {}
        const uriKeys = Object.keys(this.uriCache).map(((x) => parseInt(x)));

        for (let id = 0; id < this.uriCache.length; id++) {
            const metaData = this.uriCache[id]
            if ("attributes" in metaData) {//uricache somtimes gets empty results from nft with broken max supplies like jay peg automart smh
                for (const attr of metaData.attributes) {
                    const traitType = attr[this.attributeFormat.traitTypeKey]
                    const value = attr[this.attributeFormat.valueKey]

                    if (!(traitType in idsPerAttribute)) {
                        const valueAsFloat = parseFloat(value)
                        if (isNaN(valueAsFloat)) { //check if value is number
                            idsPerAttribute[traitType] = { "dataType": "string", "attributes": {} };
                        } else {
                            idsPerAttribute[traitType] = { "dataType": "number", "min": valueAsFloat, "max": valueAsFloat, "attributes": {} };
                        }

                        idsPerAttribute[traitType]["attributes"][value] = { "amount": 1 }
                        if (keepIds) {
                            idsPerAttribute[traitType]["attributes"][value]["ids"] = [id];
                        }
                    } else {
                        if (!(value in idsPerAttribute[traitType]["attributes"])) { //checks if value is in list
                            if (idsPerAttribute[traitType]["dataType"] == "number") {
                                const valueAsFloat = parseFloat(value)
                                if (isNaN(valueAsFloat)) {
                                    idsPerAttribute[traitType]["dataType"] = "string";
                                    delete idsPerAttribute[traitType].min
                                    delete idsPerAttribute[traitType].max
                                } else {
                                    idsPerAttribute[traitType].min = Math.min(idsPerAttribute[traitType].min, valueAsFloat);
                                    idsPerAttribute[traitType].max = Math.max(idsPerAttribute[traitType].max, valueAsFloat);
                                }
                            }
                            idsPerAttribute[traitType]["attributes"][value] = { "amount": 1 };

                            if (keepIds) {
                                idsPerAttribute[traitType]["attributes"][value]["ids"] = [id];
                            }
                        } else {
                            idsPerAttribute[traitType]["attributes"][value]["amount"] += 1;
                            if (keepIds) {
                                idsPerAttribute[traitType]["attributes"][value]["ids"].push(id);
                            }

                        }

                    }
                }
            } else {
                if (!("noAttributes" in idsPerAttribute)) {
                    idsPerAttribute["noAttributes"] = { "attributes": { "nothing": { "ids": [id] } } }
                    idsPerAttribute["noAttributes"]["attributes"]["nothing"]["amount"] = 1
                    idsPerAttribute["noAttributes"]["dataType"] = "string"
                } else {
                    idsPerAttribute.noAttributes.attributes.nothing.ids.push(id)
                    idsPerAttribute["noAttributes"]["attributes"]["nothing"]["amount"] += 1
                }

            }
            if (this.uriCache[id] === undefined) { //if undefined means totalsupply on contract is wrong

                this.totalSupply = id - 1
            }
        }
        console.log(idsPerAttribute)
        this.idsPerAttribute = idsPerAttribute
        return idsPerAttribute

    }


    /**TODO handle when urichache possible to fetch
     * @returns {Object} attributes
     */
    async getIdsPerAttribute(forceResync = false, keepIds = true, uriCache = this.uriCache) {


        //TODO make format global var

        if (!forceResync &&  this.extraMetaData.idsPerAttributeCbor) {
            if ( this.extraMetaData.idsPerAttributeCbor) {
                console.log(`found preprossed data for contract: ${this.contractObj.address}, at  ${ this.extraMetaData.idsPerAttributeCbor}`)
                const r = await this.getUrlByProtocol( this.extraMetaData.idsPerAttributeCbor)
                this.idsPerAttribute = CBOR.decode(await r.arrayBuffer())
            }

            //this.idsPerAttribute = await (await this.getUrlByProtocol((await this.extraUriMetaData).idsPerAttribute)).json()
        } else {
            console.log(`no premade metadata found for ntf contract: ${await this.contractObj.address} :( collecting attributes manually!`)
            this.idsPerAttribute = await this.buildIdsPerAttributeFromUriCache(uriCache, keepIds)
            try {
                if (!(typeof (localStorage) === "undefined")) {
                    localStorage.setItem(await this.contractObj.address, JSON.stringify({ "idStartsAt": this.idStartsAt, "totalsupply": (await this.getTotalSupply()), "idsPerAttribute": this.idsPerAttribute }));

                }

            } catch (e) {
                console.warn("Couldnt save to local storage. Is it full?")
                console.log(e)
            }

        }
        return this.idsPerAttribute
    }

    async eventScanInChunks(contrObj, filter, startBlock, endBlock, chunkSize = 4000, maxRequests = 10) {
        const amountOfScans = Math.ceil((endBlock - startBlock) / chunkSize)
        let startChunk = startBlock
        let endChunk = startChunk + chunkSize
        let events = []
        for (let i = 0; i < amountOfScans; i++) {
            if (i > maxRequests) {
                console.log("scanned events", contrObj.address, startChunk, endBlock)
                events = await Promise.all(events)
                maxRequests = maxRequests * 2
            }

            events.push(await contrObj.queryFilter(filter, startChunk, endChunk))
            startChunk += chunkSize
            endChunk += chunkSize
        }
        return (await Promise.all(events)).flat()

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
        console.log(`scanning for transfer event from nft: ${await this.contractObj.name()}  at ${ownerAddres} starting from block: ${startBlockEventScan} till ${endBlock}`)
        const toOwnerEventFilter = nftContrObj.filters.Transfer(null, ownerAddres)
        const fromOwnerEventFilter = nftContrObj.filters.Transfer(ownerAddres, null)
        let toOwnerEvents
        let fromOwnerEvents
        let tries = 0;
        toOwnerEvents =  this.eventScanInChunks(nftContrObj, toOwnerEventFilter, startBlockEventScan, endBlock)
        fromOwnerEvents =  this.eventScanInChunks(nftContrObj, fromOwnerEventFilter, startBlockEventScan, endBlock)
        // while (tries < 3) {
        //     try {
        //         toOwnerEvents = await nftContrObj.queryFilter(toOwnerEventFilter, startBlockEventScan, endBlock)
        //         fromOwnerEvents = await nftContrObj.queryFilter(fromOwnerEventFilter, startBlockEventScan, endBlock)
        //         break
        //     } catch (error) {
        //         tries += 1
        //         console.warn(`whoops fetching transfer events for ${ownerAddres} failed tried ${tries} times `)
        //         await delay(2000 * tries)
        //     }
        // }
        for (const id of (await toOwnerEvents).map((x) => Number(x.args[2]))) {
            if (idTransferCount[id]) {
                idTransferCount[id] += 1
            } else {
                idTransferCount[id] = 1
            }
        }
        for (const id of (await fromOwnerEvents).map((x) => Number(x.args[2]))) {
            if (idTransferCount[id]) {
                idTransferCount[id] -= 1
            } else {
                //prob cant happen but who knows
                console.warn(`id: ${id} was send from ${ownerAddres} without recieving it first`)
                idTransferCount[id] = -1
            }
        }
        const foundIds = Object.keys(idTransferCount).filter((x) => idTransferCount[x] > 0)
        this.idsOfOwnerCache[ownerAddres] = { ["startBlock"]: startBlockOfResults, ["endBlock"]: endBlock, ["ids"]: foundIds }
        this.saveOwnerIdsCacheToStorage()
        console.log(`done scanning for transfer event from nft: ${await nftContrObj.name()}  at ${ownerAddres} starting from block: ${startBlockEventScan} till ${endBlock}`)
        return foundIds
    }

    async getIdsOfownerWithOwnerByindex(ownerAddres, nftContrObj = this.contractObj) {
        let foundIds = []
        const balance = await nftContrObj.balanceOf(ownerAddres);
        //test if it works so we error early
        if (balance) { await this.contractObj.tokenOfOwnerByIndex(ownerAddres, 0) }
        for (let i = 0; i < balance; i++) {
            foundIds.push(this.contractObj.tokenOfOwnerByIndex(ownerAddres, i))
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
        if ((await this.contractObj.balanceOf(ownerAddres)).toNumber() === 0) { return [] }
        //ownerAddres = await ethers.utils.getAddress(ownerAddres)
        let foundIds = []
        const nftAddr = await this.contractObj.address
        let tokenOfOwnerByindexFailed = false;
        console.log(ownerAddres, nftContrObj.address)
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
            const endBlock = (await this.provider.getBlock("latest")).number
            const cacheLocalStorage = JSON.parse(localStorage.getItem(`balancesOf-${await this.contractObj.address}`))
            // console.log(cacheLocalStorage.endBlock,(endBlock-4000*10),cacheLocalStorage.endBlock>(endBlock-4000*10) )
            // console.log(Boolean(cacheLocalStorage))
            if (cacheLocalStorage && ownerAddres in cacheLocalStorage && cacheLocalStorage[ownerAddres].endBlock > (endBlock - 4000 * 4)) {
                const cacheLocalStorage = JSON.parse(localStorage.getItem(`balancesOf-${await this.contractObj.address}`))
                this.idsOfOwnerCache = cacheLocalStorage
                foundIds = await this.getIdsOfownerByEventScanning(ownerAddres, cacheLocalStorage[ownerAddres].endBlock, this.contractObj)
                return foundIds

            } else {
                try {
                    const options = { method: 'GET', headers: { accept: 'application/json' } };
                    const apiKey = this.alchemyApiKey //please dont grift i dont have money for premium :(
                    const reqString = `https://eth-mainnet.g.alchemy.com/nft/v3/${apiKey}/getNFTsForOwner?owner=${ownerAddres}&contractAddresses[]=${this.contractObj.address}&withMetadata=true&pageSize=100`
                    const r = await (await fetch(reqString, options)).json()
                    const ids = r.ownedNfts.map((x) => x.tokenId)
                    const endBlock = (await this.provider.getBlock("latest")).number
                    this.idsOfOwnerCache[ownerAddres] = { ["startBlock"]: 0, ["endBlock"]: endBlock, ["ids"]: ids }
                    this.saveOwnerIdsCacheToStorage()
                    return ids
                } catch (error) {
                    console.log(error)
                    console.log("bro nothing is working and we now have to resort to scanning events this is going to take forever :(((")
                    //this.idsOfOwnerCache = cacheLocalStorage
                    foundIds = await this.getIdsOfownerByEventScanning(ownerAddres, startBlockEventScan, this.contractObj)
                    return foundIds

                }
            }
            //console.warn(`nft: ${nftAddr} doesnt have ownerBalanceToken or tokenOfOwnerByIndex we need to scan transfer events now wich might take a while `)

        }






        return foundIds
    }


    async getCachedIdsOfOwner(source = this.extraMetaData.idsOfOwner) {
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

    async saveOwnerIdsCacheToStorage(outputFilePath = undefined) {
        let fromStorage = JSON.parse(localStorage.getItem(`balancesOf-${await this.contractObj.address}`))
        this.idsOfOwnerCache = { ...fromStorage, ...this.idsOfOwnerCache }
        //TODO cleanup
        try {
            if (!(typeof (localStorage) === "undefined")) {
                localStorage.setItem(`balancesOf-${await this.contractObj.address}`, JSON.stringify(this.idsOfOwnerCache));
            }
            if (outputFilePath) {
                try {
                    console.log(`writing to ${outputFilePath}`)
                    await Bun.write(outputFilePath, JSON.stringify(this.idsOfOwnerCache, null, 2));

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