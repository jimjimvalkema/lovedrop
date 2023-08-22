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
    async getTotalSupply(){
        return 9998//(await this.contractObj.totalSupply()).toNumber()
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
                endId = await this.getTotalSupply()
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
                endId = await this.getTotalSupply()
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
                endId = await this.getTotalSupply()
            }
            for (let id = startId; id < endId; id++) {
                //console.log(id)
                if (!excludeIdSet.has(id) && await this.hasAttribute(id, attribute) === true) {
                    matchingIds.add(id)
                }
            }
        } else {
            for (const id of idSet) {
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
        //console.log(inputs)
        //const inputTypesOrder = ["idList", "attributes", "conditions"]
        let excludeIdSet = new Set();
        let idSet = new Set(); //maybe const if u do if else TODO

        if ("NOT" in condition && condition.NOT) {
            excludeIdSet = await this.processNotCondition(condition.NOT)
        }

        if ("idList" in inputs && inputs.idList) {
            idSet = new Set(inputs.idList) //idList = ids that we be checked if they have specified attributes and conditions
        }

        if ("attributes" in inputs && inputs.attributes)  {
            console.log(inputs.attributes)
            for (const attribute of inputs.attributes) {
                //console.log(`${JSON.stringify(attribute)}, ${0}, ${null}, ${JSON.stringify(idSet)}, ${excludeIdSet}`);
                const newIdSet = await this.getIdsByAttribute(attribute, 0, null, idSet, excludeIdSet) //excludeIdSet is passed to prevent unnecessarily checking ids
                //console.log(attrIds)
                idSet = newIdSet
            }
        }

        if ("conditions" in inputs && inputs.conditions) {
            for (const con of inputs.conditions) {
                if (!"idList" in con.NOT || !con.NOT.idList) {
                    con.NOT.idList = []
                }
                const newIdSet = await this.processCondition(con)
                idSet = this.setIntersection(idSet, newIdSet);
            }
        }

        if (excludeIdSet.size) {
            idSet = this.setComplement(idSet, excludeIdSet);
        }

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
        let excludeIdSet = new Set();        ;
        let idSet = new Set();

        if ("NOT" in condition && condition.NOT) {
            excludeIdSet = await this.processNotCondition(condition.NOT)
        }

        if ("idList" in inputs && inputs.idList) {
            idSet = new Set(inputs.idList) //idList = ids that we add to everything else
        } 

        if ("attributes" in inputs && inputs.attributes)  {
            for (const attribute of inputs.attributes) {
                const newIdSet = await this.getIdsByAttribute(attribute, 0, null, null, new Set([...excludeIdSet, ...idSet])) //idSet excluded so theyre not processed (they're allready)
                idSet = new Set([...idSet, ...newIdSet])
            }
        }

        if ("conditions" in inputs && inputs.conditions) {
            for (const con of inputs.conditions) {
                if (!"idList" in con.NOT || !con.NOT.idList) {
                    con.NOT.idList = []
                }
                const newIdSet = await this.processCondition(con)
                idSet = new Set([...idSet, ...newIdSet])
            }
        }

        if (excludeIdSet.size) {
            idSet = this.setComplement(idSet, excludeIdSet);
        }
        return idSet

    }

    async processNotCondition(condition) {
        const inputs = condition //TODO make cleaner
        let idSet = new Set();
        if ("idList" in inputs && inputs.idList) {
            idSet = new Set(inputs.idList)
        } 

        if ("attributes" in inputs && inputs.attributes)  {
            for (const attribute of inputs.attributes) {
                const newIdSet = await this.getIdsByAttribute(attribute, 0, null, null, idSet) //idSet excluded so theyre not processed (they're allready in)
                idSet = new Set([...idSet, ...newIdSet])
            }  
        }
        if ("conditions" in inputs && inputs.conditions) {
            for (const con of inputs.conditions) {
                if (!"idList" in con.NOT || !con.NOT.idList) {
                    con.NOT.idList = []
                }
                con.NOT.idList = [...new Set([...idSet, ...con.NOT.idList])] //prevents that condition from checking ids that are already checked
                const newIdSet = await this.processCondition(con)
                idSet = new Set([...idSet, ...newIdSet])
            }

        }
        return idSet
    }

    async processRangeCondition(condition) { //TODO idlist?
        const inputs = condition.inputs //TODO make cleaner
        let excludeIdSet = new Set();  
        //console.log(inputs)

        if (!"start" in inputs || !inputs.start) {
            inputs.start = 0
        }

        if (!"stop" in inputs || !inputs.stop || inputs.stop === "totalSupply") {
            inputs.stop = await this.getTotalSupply()
        }

        let idSet = new Set([...Array(inputs.stop-inputs.start).keys()].map(i => i + inputs.start)) //range(inputs.start, inputs.stop)

        if ("NOT" in condition && condition.NOT) {
            //console.log(condition.NOT)
            excludeIdSet = await this.processNotCondition(condition.NOT)
            //console.log(excludeIdSet)
        }

        if ("conditions" in inputs && inputs.conditions) {//TODO this can be a function?
            for (const con of inputs.conditions) {
                if (!"idList" in con.NOT || !con.NOT.idList) {
                    con.NOT.idList = []
                }
                condition.NOT.idList = [...new Set([...idSet, ...con.NOT.idList])] //prevents that condition from checking ids that are already checked
                const newIdSet = await this.processCondition(con)
                idSet = new Set([...idSet, ...newIdSet])
            }

        }

        //console.log(idSet, excludeIdSet)
        idSet = this.setComplement(idSet, excludeIdSet);
        return idSet
        

    }

    /**
     * 
     * @param {Object} condition 
     * @returns {Set} idSet
     */
    async processCondition(condition) {
        console.log(condition)
        let idSet;
        //{"type":"OR", "input":{"idList":[]],"conditions":[], "attributes":[]}, "NOT":{"idList":[]],"conditions":[],"attributes":[]]}}
        switch (condition.type){
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
        console.log(idSet)
        return idSet;

    }


    async attributeFilter(filter) {



        //TODO make and or not
    }
}