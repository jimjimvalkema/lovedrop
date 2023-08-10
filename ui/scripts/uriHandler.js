class uriHandler {
    contractObj = null;
    uriType = "standard"
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
        return (await this.contractObj.baseURI())
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

    async getTokenUri(id) {
        const reqObj = {method: 'GET'}
        const r = (await fetch(await this.contractObj.tokenURI(id), reqObj))
        return await r.json();
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