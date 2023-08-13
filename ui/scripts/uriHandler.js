const delay = ms => new Promise(res => setTimeout(res, ms));

class uriHandler {
    contractObj = null;
    uriType = "standard"
    uriCache = []
    baseURICache = null;
    constructor(contractObj,typesJsonFile ,uriType=null) {
        this.contractObj = contractObj;
        if (uriType==null) {
            this.uriType = this.getURIType(contractObj, typesJsonFile)
        }

    }

    async getImage(id) {
        let reqObj = {
            method: 'GET',
            headers: {
                'Content-Type': '*'
            }
        }
        console.log(this.contractObj);
        console.log(this.uriType);
        let imgURL = ""; 
        switch (this.uriType) {
            case "standard":
                imgURL = (await fetch(await this.contractObj.tokenURI(id), reqObj))["image"];
                break;
            case "milady":
                // miladymaker.net cors wont allow me to get metadata :(
                imgURL = `https://www.miladymaker.net/milady/${id}.png`;
                break;
            default:
                imgURL = `https://www.miladymaker.net/milady/${id}.png`;
                //imgURL = (await fetch(await this.contractObj.tokenURI(id), reqObj))["image"];
                break;
        }
        console.log(imgURL)
        return imgURL;
            
  
    }

    async getBaseURI() {
        //TODO test
        //TODO IPFS
        if (this.baseURICache == null) {
            this.baseURICache = (await this.contractObj.baseURI());
        }
        return this.baseURICache;
    }

    async getURIType(contractObj, typesJsonFile) {
        let typesJson = await (await fetch(typesJsonFile)).json();
        const contractAddr = (await contractObj.address).toLowerCase()
        console.log("bbbbbbbb")
        console.log(typesJson)
        console.log(contractAddr)
        if (contractAddr in typesJson) {
            return typesJson[contractAddr]["type"]
        } else {
            return "standard"
        }
        
    } 

    async getUrisInBulk(startId=0,  endId=null, idList =null) {
        let uris = [];
        //iter from startId to endId
        if (idList === null) {
            //do entire supply if endId is null
            if (endId===null) {
                endId=(await this.contractObj.totalSupply()).toNumber()
            }
            for (let i=startId; i<endId; i++) {
                let id = i
                uris.push( this.getTokenUriNoCache(id));
            }
        
        //iter ofer idList
        } else {
            for (let i=0; i<idList.length; i++) {
                let id = idList[i]
                uris.push(this.getTokenUriNoCache(id));
            }
        }
        return Promise.all(uris)
    }


    async syncUriCacheBulkInChunks(startId=0,  endId=null, idList =null, chunkSize=100) {
        //iter from startId to endId
        if (idList === null) {
            //do entire supply if endId is null
            if (endId===null) {
                endId=(await this.contractObj.totalSupply()).toNumber()
            }
            
            let endChunk = 0;
            for (let startChunk = 0; startChunk<endId;) {
                endChunk += chunkSize;
                console.log(startChunk, endChunk);
                if (endChunk>endId) { //brain cooked prob not good fix TODO
                    endChunk=endId
                }
                let uris = await this.getUrisInBulk(startChunk,endChunk);
                //console.log("sdf")
                //console.log(uris)
                this.uriCache = [...this.uriCache, ...uris];

                startChunk += chunkSize
            }
        
        //iter ofer idList
        } else {console.error("TODO not implemeted")}
        // else {
        //     for (let i=0; i<idList.length; i++) {
        //         let id = idList[i]
        //         this.uriCache[id] = this.getTokenUriNoCache(id);
        //     }
        // }
        return this.uriCache
    }


    async getTokenUri(id) {
        if (this.uriCache[id]) {
            return await this.uriCache[id]
        } else {
            this.uriCache[id] = await this.getTokenUriNoCache(id)
            return this.uriCache[id]
        }

    }

    async getTokenUriNoCache(id) {
        //const reqObj = {method: 'GET'}
        let retries = 0;
        while (retries < 10) {
            try {
                const URI =  await (await fetch(`${await this.getBaseURI()}${id}`)).json();
                return URI
            } catch(error) {
                console.log(`errored on id: ${id} tried ${retries} times`)
                console.log(`error is: ${error}`);
                await delay(500);
            }
            retries += 1;
        }
    }

    async hasAttribute(id, attribute) {
        //attribute = {"trait_type": "Background","value": "bjork"},
        //just incase this standart changes
        let attributeFormat = {
            pathToAttributeList : ["attributes"],
            traitTypeKey : "trait_type",
            valueKey : "value"
        }
        let tokenURI = null
        try {
            tokenURI = await this.getTokenUri(id)
        } catch(error) {
            console.error(`couldn't get token uri from token id: ${id} at base URI ${await this.getBaseURI()}. The error below is wat triggered this:`)
            console.error(error);
            return false
        }
        //console.log(tokenURI);
        for (let i=0; i<attributeFormat.pathToAttributeList.length; i++) {
            tokenURI = tokenURI[attributeFormat.pathToAttributeList[i]]
        }
        let attributeList = tokenURI;
        
        for (let i=0; i<attributeList.length; i++) {
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

    async getIdsByAttribute(attribute, startId=0,  endId=null, idList =null) {
        let matchingIds = []
        if (idList === null) {
            if (endId===null) {
                endId=(await this.contractObj.totalSupply()).toNumber()
            }
            for (let i=startId; i<endId; i++) {
                let id = i
                //console.log(id)
                if (await this.hasAttribute(id, attribute) === true) {
                    matchingIds.push(id)
                }
            }
        } else {
            for (let i=0; i<idList.length; i++) {
                let id = idList[i]
                if (await this.hasAttribute(id, attribute) === true) {
                    matchingIds.push(id)
                }
            }
        }
        return matchingIds
    }
}