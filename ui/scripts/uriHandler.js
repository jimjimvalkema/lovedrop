//const { error } = require("console");

const delay = ms => new Promise(res => setTimeout(res, ms));

//TODO maybe attibute finder is better name? or maybe split classes
class uriHandler {
    contractObj = undefined;
    extraUriMetaData = undefined;
    uriCache = []
    baseURICache = undefined;
    ipfsGateway = undefined;
    everyAttribute = undefined;
    useCustomCompressedImages;
    attributeFormat = {
        pathToAttributeList: ["attributes"],
        traitTypeKey: "trait_type",
        valueKey: "value"
    } //TODO make this customizable with extraUriMetaDataFile
    //TODO fix naming
    constructor(contractObj, _ipfsGateway = "http://localhost:48084",customCompressedImages=true, extraUriMetaDataFile = "./claim/scripts/extraUriMetaDataFile.json", _extraUriMetaData = undefined) {
        this.contractObj = contractObj;
        this.ipfsGateway = _ipfsGateway;
        this.useCustomCompressedImages = customCompressedImages;
        if (extraUriMetaDataFile) {
            this.extraUriMetaData = this.getExtraUriMetaData(contractObj, extraUriMetaDataFile)
        } else {
            this.extraUriMetaData = _extraUriMetaData
        }
        
    }

    async getCompressedImages() {
        return await this.getUrlByProtocol(((await this.extraUriMetaData).baseUriCompressed), true);

    }

    async fetchAllExtraMetaData() {
        //await this.syncUriCache();
        await this.getEveryAttributeType();
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
        if (this.useCustomCompressedImages) {
            return `${await this.getCompressedImages()}/${id}.jpg`;
        }

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
        return imgURL;


    }
    async getTotalSupply(){
        //TODO remove temp test value and add metadata to extraUriMetaDataFile to handle this and default to a better error handling when this value is incorrect
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
                    throw new Error(`NFT contract does not have baseURI() function and it's tokenURI() function return a non standard string: \n ${s}`)
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

    async getUrlByProtocol(urlString, returnOnlyUrl=false) {
        let reqObj = {
            method: 'POST',
            // headers: {
            //     'Authorization': this.auth
            // },
            //body: form
        }
        let newUrlString = "";
        let urlObj = new URL(urlString)
        switch (urlObj.protocol) {
            case ("ipfs:"):
                newUrlString = `${this.ipfsGateway}/ipfs/${urlObj.pathname.slice(2)}`;
                break
            case ("http:"):
                newUrlString = urlString;
                break
            case ("https"):
                newUrlString = urlString;
                break
        }

        if (returnOnlyUrl===true) {
            return newUrlString
        } else {
            return await fetch(newUrlString);
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
        //console.log(tokenURI);
        for (let i = 0; i < this.attributeFormat.pathToAttributeList.length; i++) {
            tokenURI = tokenURI[this.attributeFormat.pathToAttributeList[i]]
        }
        let attributeList = tokenURI;

        for (let i = 0; i < attributeList.length; i++) {
            let attributeType = JSON.stringify(attribute[this.attributeFormat.traitTypeKey]);
            let nftAttributeType = JSON.stringify(attributeList[i][this.attributeFormat.traitTypeKey]);
            let attributeValue = JSON.stringify(attribute[this.attributeFormat.valueKey]);
            let nftValue = JSON.stringify(attributeList[i][this.attributeFormat.valueKey]);
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

    hasAttributeWithEveryAttribute(id,attribute) {
        const traitTypeKey = this.attributeFormat.traitTypeKey;
        const valueKey = this.attributeFormat.valueKey;
        const traitType = attribute[traitTypeKey]
        const value = attribute[valueKey]
        const index = this.everyAttribute[traitType].attributes[value].ids.indexOf(JSON.stringify(id))
        return index !== -1

    }

    async hasAttribute(id, attribute) {
        if (this.everyAttribute) {
            return this.hasAttributeWithEveryAttribute(id,attribute)
        } else {
            return await this.hasAttributeWithTokenUri(id,attribute)
        }
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

        if ("idList" in inputs && typeof(inputs.idList) === "object" && Object.keys(inputs.idList).length) {
            idSet = new Set(inputs.idList) //idList = ids that we be checked if they have specified attributes and conditions
        }

        // if ("attributes" in inputs && inputs.attributes)  {
        //     console.log(inputs.attributes)
        //     //prob better not to do parallelization
        //     for (const attribute of inputs.attributes) {
        //         //console.log(`${JSON.stringify(attribute)}, ${0}, ${null}, ${JSON.stringify(idSet)}, ${excludeIdSet}`);
        //         const newIdSet = await this.getIdsByAttribute(attribute, 0, null, idSet, excludeIdSet) //excludeIdSet is passed to prevent unnecessarily checking ids
        //         //console.log(attrIds)
        //         idSet = newIdSet
        //     }
        // }

        //TODO do it like in the OR,RANGE,NOT with paralelzation but do first itter in serial to drasticly reduce O(n) (becuase this is a AND)
        //and dont flatten and do for loop with setIntersection
        if ("attributes" in inputs && typeof(inputs.attributes) === "object" && Object.keys(inputs.attributes).length)  {
            //do 1 attribute first to reduce the set of ids before parallelisation 
            const attributesCopy = [ ...inputs.attributes]
            const firstAttr = attributesCopy.shift()
            const newIdSet = await this.getIdsByAttribute(firstAttr, 0, null, idSet, excludeIdSet)
            idSet = newIdSet;

            let newIdSets = []
            for (const attribute of inputs.attributes) {
                newIdSets.push(this.getIdsByAttribute(attribute, 0, null, idSet, excludeIdSet) ) //idSet excluded so theyre not processed (they're allready)
            }
            for (const newIdSet of (await Promise.all(newIdSets))) {
                idSet= this.setIntersection(idSet, newIdSet)
            }
        }


        if ("conditions" in inputs && typeof(inputs.conditions) === "object" && Object.keys(inputs.conditions).length) {//TODO this can be a function?
            let newIdSets = []
            for (const con of inputs.conditions) {
                if (!"idList" in con.NOT || !con.NOT.idList) {
                    con.NOT.idList = []
                }
                con.NOT.idList = [...new Set([...idSet, ...con.NOT.idList])] //prevents that condition from checking ids that are already checked
                newIdSets.push(this.processCondition(con))
            }
            //paralelization TODO also do this for attributes?
            //TODO check if correct
            for (const newIdSet of (await Promise.all(newIdSets))) {
                idSet= this.setIntersection(idSet, newIdSet)
            }
        }

        // if ("conditions" in inputs && inputs.conditions) {
        //     for (const con of inputs.conditions) {
        //         if (!"idList" in con.NOT || !con.NOT.idList) {
        //             con.NOT.idList = []
        //         }
        //         const newIdSet = await this.processCondition(con)
        //         idSet = this.setIntersection(idSet, newIdSet);
        //     }
        // }

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

        if ("idList" in inputs && typeof(inputs.idList) === "object" && Object.keys(inputs.idList).length) {
            idSet = new Set(inputs.idList) //idList = ids that we add to everything else
        } 

        if ("attributes" in inputs && typeof(inputs.attributes) === "object" && Object.keys(inputs.attributes).length)  {
            let newIdSets = []
            for (const attribute of inputs.attributes) {
                newIdSets.push(this.getIdsByAttribute(attribute, 0, null, null, new Set([...excludeIdSet, ...idSet])) ) //idSet excluded so theyre not processed (they're allready)
            }
            //paralelization
            newIdSets = await Promise.all(newIdSets);
            newIdSets = newIdSets.map((x) => [...x]);
            idSet = new Set([...idSet, ...newIdSets.flat()])
        }

        if ("conditions" in inputs && typeof(inputs.conditions) === "object" && Object.keys(inputs.conditions).length) {//TODO this can be a function?
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
        if ("idList" in inputs && typeof(inputs.idList) === "object" && Object.keys(inputs.idList).length) {
            idSet = new Set(inputs.idList)
            console.log(idSet)
        } 
        //if ("attributes" in inputs && inputs.attributes)  {
        if ("attributes" in inputs && typeof(inputs.attributes) === "object" && Object.keys(inputs.attributes).length)  {
            let newIdSets = []
            for (const attribute of inputs.attributes) {
                newIdSets.push(this.getIdsByAttribute(attribute, 0, null, null, idSet) ) //idSet excluded so theyre not processed (they're allready)
            } //TODO this one is O(n*totalsupply) n=attributes but runs paralel. in serial it can be O(n-newIdSet) where n reduces on every iter since the ids already found can be skipped since theyre already included
            //paralelization
            newIdSets = await Promise.all(newIdSets);
            newIdSets = newIdSets.map((x) => [...x]);
            idSet = new Set([...idSet, ...newIdSets.flat()])
        }
        
        if ("conditions" in inputs && typeof(inputs.conditions) === "object" && Object.keys(inputs.conditions).length) {//TODO this can be a function?
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
        //console.log(inputs)


        if (!"start" in inputs || !inputs.start) {
            inputs.start = 0
        }

        if (!"stop" in inputs || !inputs.stop || inputs.stop === "totalSupply") {
            inputs.stop = await this.getTotalSupply()
        }

        let idSet = new Set([...Array(inputs.stop-inputs.start).keys()].map(i => i + inputs.start)) //range(inputs.start, inputs.stop)

        if ("idList" in inputs && typeof(inputs.idList) === "object" && Object.keys(inputs.idList).length) {
            idSet = new Set([...idSet, ...inputs.idList])
        } 

        if ("NOT" in condition && condition.NOT) {
            //console.log(condition.NOT)
            excludeIdSet = await this.processNotCondition(condition.NOT)
            //console.log(excludeIdSet)
        }

        if ("conditions" in inputs && typeof(inputs.conditions) === "object" && Object.keys(inputs.conditions).length) {//TODO this can be a function?
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
        return idSet;

    }

    //needs this for deep clone to prevent not idlist sticking around
    async processFilter(filterObj) {
        return this.processCondition(structuredClone(filterObj))
    }


    /**TODO handle when urichache possible to fetch
     * @returns {Object} attributes
     */
    async getEveryAttributeType(forceResync=false,keepIds=true,uriCache=null) {
        

        //TODO make format global var

        if (!forceResync && (await this.extraUriMetaData).everyAttribute) {
            console.log(`found prerpossed data for contract: ${this.contractObj.address}, at  ${(await this.extraUriMetaData).everyAttribute}`)
            const r = await u.getUrlByProtocol("ipfs://bafybeichhvd4y4uyh6z7macd56xh4dk6bzfd5ckzninqbywc56up22kaom")
            this.everyAttribute = CBOR.decode(await r.arrayBuffer())

            //this.everyAttribute = await (await this.getUrlByProtocol((await this.extraUriMetaData).everyAttribute)).json()
        } else {
            console.log(`no premade metadata found for ntf contract: ${await this.contractObj.address} :( collecting attribute manually!`)
            if (!uriCache) {
                await this.syncUriCache()
                uriCache = this.uriCache;
            }
  

            let everyAttribute = {}
            const uriKeys = Object.keys(uriCache);

            for (const id of uriKeys) {
                const metaData = uriCache[id]
                for (const attr of metaData.attributes) {
                    const traitType = attr[this.attributeFormat.traitTypeKey]
                    const value = attr[this.attributeFormat.valueKey]
                    
                    if (!(traitType in everyAttribute)) {
                        const valueAsFloat = parseFloat(value)
                        if (isNaN(valueAsFloat)) { //check if value is number
                            everyAttribute[traitType] = {"dataType":"string", "attributes":{}}; 
                        } else {
                            everyAttribute[traitType] = {"dataType":"number","min":valueAsFloat, "max":valueAsFloat, "attributes":{}};
                        }

                        everyAttribute[traitType]["attributes"][value] = {"amount":1}
                        if (keepIds) {
                            everyAttribute[traitType]["attributes"][value]["ids"] = [id];
                        }
                    } else {
                        if (! (value in everyAttribute[traitType]["attributes"])) { //checks if value is in list
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
                            everyAttribute[traitType]["attributes"][value] = {"amount": 1};

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
            }
            this.everyAttribute = everyAttribute
        }
        return this.everyAttribute
    }

    // /**
    //  * 
    //  * @param {Object} everyAttribute 
    //  * @returns {Object} formattedEveryAttribute
    //  */
    // async getFormatEveryAttributeObject() {
    //     formattedEveryAttribute = {}
    //     everyAttribute = this.getEveryAttributeType()
    //     for (let key of Object.keys(everyAttribute)) {
    //         formattedEveryAttribute[key] = {"length":everyAttribute[key].length}
    //         for (let item of everyAttribute[key])
    //     }

    // }
}