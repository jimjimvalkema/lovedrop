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
        return (await this.contractObj.baseURI)
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

    async getIdsByAttribute(attribute, endId=null,  startId=0) {
        if (endId===null) {
            endId=(await this.contractObj.totalSupply).toNumber()
        }
        for (let i=startId; i<endId; i++) {
            (await fetch(await this.contractObj.tokenURI(id), reqObj))
        }
    }
}