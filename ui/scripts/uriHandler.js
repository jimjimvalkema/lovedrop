//const { error } = require("console");

const delay = ms => new Promise(res => setTimeout(res, ms));

class uriHandler {
    contractObj = null;
    extraUriMetaData = null;
    uriCache = []
    baseURICache = null;
    ipfsGateway = null;
    //TODO fix naming
    constructor(contractObj, extraUriMetaDataFile = "./claim/scripts/extraUriMetaDataFile.json", _ipfsGateway = "https://ipfs.io", _extraUriMetaData = undefined) {
        this.contractObj = contractObj;
        this.ipfsGateway = _ipfsGateway
        if (extraUriMetaDataFile) {
            this.extraUriMetaData = this.getExtraUriMetaData(contractObj, extraUriMetaDataFile)
        } else {
            this.extraUriMetaData = _extraUriMetaData
        }
    }

    async getImage(id) {
        let reqObj = {
            method: 'GET',
            headers: {
                'Content-Type': '*'
            }
        }
        //console.log(this.contractObj);
        //console.log(this.uriType);
        let imgURL = "";
        switch ((await this.extraUriMetaData).type) {
            case "standard":
                imgURL = (await fetch(await this.contractObj.tokenURI(id), reqObj))["image"];
                break;
            case "milady":
                // miladymaker.net cors wont allow me to get metadata :(
                imgURL = `https://www.miladymaker.net/milady/${id}.png`;
                break;
            default:
                //imgURL = `https://www.miladymaker.net/milady/${id}.png`;
                imgURL = (await fetch(await this.contractObj.tokenURI(id), reqObj))["image"];
                break;
        }
        console.log(imgURL)
        return imgURL;


    }

    async getBaseURI() {
        //TODO test
        //TODO IPFS
        //TODO get base uri by striping result .getTokenUri() becuase scatter doesnt have baseURI exposed :(
        if (this.baseURICache == null) {
            try {
                this.baseURICache = (await this.contractObj.baseURI());
            } catch {
                let s = (await nftContract.tokenURI(1))
                if (s.endsWith("1")) {
                    this.baseURICache = s.slice(0, -1);
                } else if (s.endsWith("1.json")) {
                    this.baseURICache = s.slice(0, -6)
                } else {
                    throw error(`NFT contract does not have baseURI() function and it's tokenURI() function return a non standard string: \n ${s}`)
                }
            }
        }
        return this.baseURICache;
    }

    async getExtraUriMetaData(contractObj, extraUriMetaDataFile) {
        let extraUriMetaData = await (await fetch(extraUriMetaDataFile)).json();
        const contractAddr = (await contractObj.address).toLowerCase()
        if (contractAddr in extraUriMetaData) {
            return extraUriMetaData[contractAddr]
        } else {
            console.log(`Nft contract: ${contractAddr} not found in extraUriMetaDataFile: ${extraUriMetaDataFile}, setting to default values`)
            return { "type": "standart", "name": "standart", "ScrapedUriData": undefined }
        }

    }

    async getUrisInBulk(startId = 0, endId = null, idList = null) {
        let uris = [];
        //iter from startId to endId
        if (idList === null) {
            //do entire supply if endId is null
            if (endId === null) {
                endId = (await this.contractObj.totalSupply()).toNumber()
            }
            for (let i = startId; i < endId; i++) {
                let id = i
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


    async syncUriCacheByScraping(startId = 0, endId = null, chunkSize = 100, idList = null) {
        let allUris = [];
        //iter from startId to endId
        if (idList === null) {
            //do entire supply if endId is null
            if (endId === null) {
                endId = (await this.contractObj.totalSupply()).toNumber()
            }

            let endChunk = 0;
            for (let startChunk = 0; startChunk < endId;) {
                endChunk += chunkSize;
                console.log(startChunk, endChunk);
                if (endChunk > endId) { //brain cooked prob not good fix TODO
                    endChunk = endId
                }
                let uris = await this.getUrisInBulk(startChunk, endChunk);
                //console.log("sdf")
                //console.log(uris)
                allUris = [...allUris, ...uris];

                startChunk += chunkSize
            }

            //iter ofer idList
        } else { console.error("TODO not implemeted") }
        // else {
        //     for (let i=0; i<idList.length; i++) {
        //         let id = idList[i]
        //         this.uriCache[id] = this.getTokenUriNoCache(id);
        //     }
        // }
        return allUris
    }

    async getUrlByProtocol(urlString) {
        let urlObj = new URL(urlString)
        switch (urlObj.protocol) {
            case ("ipfs:"):
                return await fetch(`${this.ipfsGateway}/ipfs/${urlObj.pathname.slice(2)}`);
            case ("http:"):
                return await fetch(urlString);
            case ("https"):
                return await fetch(urlString);
        }
    }

    async syncUriCache(startId = 0, endId = null, chunkSize = 100) {
        console.log((await this.extraUriMetaData).scrapedUriData)
        if ((await this.extraUriMetaData).scrapedUriData) {
            this.uriCache = await (await this.getUrlByProtocol((await this.extraUriMetaData).scrapedUriData)).json()
        } else {
            console.log(`no premade metadata found for ntf contract: ${await this.contractObj.address} :( collecting attribute manually!`)
            //syncUriCacheByScraping already
            //this.uriCache = 
            this.uriCache = await this.syncUriCacheByScraping(startId, endId, chunkSize)
        }
    }

    async getTokenUriNoCache(id) {
        //const reqObj = {method: 'GET'}
        let retries = 0;
        while (retries < 10) {
            try {
                const URI = await (await fetch(`${await this.getBaseURI()}${id}`)).json();
                return URI
            } catch (error) {
                console.log(`errored on id: ${id} re-tried ${retries} times`)
                console.log(`error is: ${error}`);
                await delay(500);
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

    async hasAttribute(id, attribute) {
        //attribute = {"trait_type": "Background","value": "bjork"},
        //just incase this standart changes
        let attributeFormat = {
            pathToAttributeList: ["attributes"],
            traitTypeKey: "trait_type",
            valueKey: "value"
        }
        let tokenURI = null
        try {
            tokenURI = await this.getTokenUri(id)
        } catch (error) {
            console.error(`couldn't get token uri from token id: ${id} at base URI ${await this.getBaseURI()}. The error below is wat triggered this:`)
            console.error(error);
            return false
        }
        //console.log(tokenURI);
        for (let i = 0; i < attributeFormat.pathToAttributeList.length; i++) {
            tokenURI = tokenURI[attributeFormat.pathToAttributeList[i]]
        }
        let attributeList = tokenURI;

        for (let i = 0; i < attributeList.length; i++) {
            let attributeType = JSON.stringify(attribute[attributeFormat.traitTypeKey]);
            let nftAttributeType = JSON.stringify(attributeList[i][attributeFormat.traitTypeKey]);
            let attributeValue = JSON.stringify(attribute[attributeFormat.valueKey]);
            let nftValue = JSON.stringify(attributeList[i][attributeFormat.valueKey]);
            //console.log([attributeType, nftAttributeType, attributeValue, nftValue])
            //console.log([attributeType == nftAttributeType, attributeValue === nftValue])
            //console.log((attributeType === nftAttributeType) && (attributeValue === nftValue))
            if ((attributeType === nftAttributeType) && (attributeValue === nftValue)) {
                //console.log("its trueeeee")
                return true
            }
        }
        return false
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
                endId = (await this.contractObj.totalSupply()).toNumber()
            }
            for (let id = startId; id < endId; id++) {
                //console.log(id)
                if (!excludeIdSet.has(id) && await this.hasAttribute(id, attribute) === true) {
                    matchingIds.add(id)
                }
            }
        } else {
            for (const id of idSet.size) {
                if (!excludeIdSet.has(id) && await this.hasAttribute(id, attribute) === true) {
                    matchingIds.add(id)
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
            endId = (await this.contractObj.totalSupply()).toNumber()
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
    intersection(setA, setB) {
        let intersectionSet = new Set();
    
        for (let i of setB) {
            if (setA.has(i)) {
                intersectionSet.add(i);
            }
        }
        return intersectionSet;
    }


    /**
     * 
     * @param {Object} inputs 
     * @return {Object} idSet
     */
    async processAndCondition(inputs) {
        const inputTypesOrder = ["idList", "attributes", "conditions"]
        const excludeIdSet = new Set(inputs.NOT)
        let idSet = new Set();
        for (const type in inputTypesOrder) {
            switch (type) {
                //TODO check order
                case ("idList"): 
                    idSet = new Set(inputs.idList) //idList = ids that we be checked if they have specified attributes and conditions
                    break
                case ("attributes"):
                    for (attribute in inputs.attributes) {
                        let attrIds = await this.getIdsByAttribute(attribute, 0, null, idSet, excludeIdSet)
                        idSet = new Set(attrIds)
                    }
                    break

                case ("conditions"):
                    for (condition in inputs.conditions) {
                        const newSet = await this.processCondition(condition)
                        idSet = this.intersection(idSet, newSet);
                    }
                    break
            }

        }
        return idSet
    }


     /**
     * 
     * @param {Object} inputs 
     * @return {Object} idSet
     */
    async processOrCondition(inputs) {
        const inputTypesOrder = ["idList", "attributes", "conditions"]
        let idSet = new Set();
        for (const type in inputTypesOrder) {
            switch (type) {
                //TODO check order
                case ("idList"): 
                    idSet = new Set(inputs.idList) //idList = ids that we add to everything else
                    break
                case ("attributes"):
                    for (attribute in inputs.attributes) {
                        let newIdSet = await this.getIdsByAttribute(attribute, 0, null, null, idSet) //idSet excluded so theyre not processed (they're allready)
                        idSet = new Set([...idSet, ...newIdSet])
                    }
                    break

                case ("conditions"):
                    for (condition in inputs.conditions) {
                        const newSet = await this.processCondition(condition)
                        idSet = new Set([...idSet, ...newIdSet])
                    }
                    break
            }

        }
        return idSet

    }

    /**
     * 
     * @param {Object} condition 
     * @returns {Set} idSet
     */
    async processCondition(condition) {
        //{"type":"OR", "input":{"idList":[]],"conditions":[], "attributes":[]}, "NOT":{"idList":[]],"conditions":[],"attributes":[]]}}
        switch (condition.type){
            case ("AND"):
                break
            case ("OR"):
                break
            case ("RANGE"):
                break
            case ("NOT"):
                //prob not needed
                break

        }

    }


    async attributeFilter(filter) {



        //TODO make and or not
    }
}