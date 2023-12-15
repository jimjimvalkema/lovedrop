import { NftDisplay } from "../../scripts/NftDisplay.js"
import { NftMetaDataCollector } from "../../scripts/NftMetaDataCollector.js"

export class FilterBuilder {
    validFilterTypes = ["RANGE", "AND", "OR"]
    filterTemplate = { "type": "OR", "inputs": { "idList": [], "conditions": [], "attributes": [] }, "NOT": { "idList": [], "conditions": [], "attributes": [] } }

    nftMetaData;

    /**
     * 
     * @param {string} collectionAddress 
     * @param {ethers.providers} provider 
     * @param {*} ipfsGateway 
     */
    constructor({ collectionAddress, provider, ipfsGateway = "https://ipfs.io", displayElementId = "nftDisplay" }) {
        this.nftMetaData = new NftMetaDataCollector(collectionAddress, provider, ipfsGateway)
        this.NftDisplay = new NftDisplay({
            collectionAddress: collectionAddress,
            provider: provider,
            displayElementId: displayElementId,
            ipfsGateway: ipfsGateway,
            nftMetaData: this.nftMetaData
        })
        this.collectionAddress = collectionAddress

        document.getElementById("inputTypeSelecterInput").addEventListener("change",(event)=>this.setInputTypeHandler(event))
        this.setInputTypeHandler({"target":{"value":"attribute"}})
    }

    #formatFilterType(filter) {
        if (!("type" in filter)) {
            filter["type"] = "RANGE"
        } else {
            if (this.validFilterTypes.indexOf(filter["type"]) == -1) {
                filter["type"] = "RANGE"
            }
        }
    }

    #formatInputs(filter) {
        if (!("inputs" in filter)) {
            filter["inputs"] = structuredClone(this.filterTemplate.inputs)
        } else {
            if (filter["type"] === "RANGE") {
                if (!"start" in filter.inputs) {
                    filter.inputs["start"] = this.uriHandler.idStartsAt
                }
            }
            const inputs = Object.keys(this.filterTemplate["inputs"])
            for (let i = 0; i < inputs.length; i++) {
                const inputName = inputs[i]
                if ((!(inputName in filter["inputs"])) || !(filter["inputs"][inputName])) {
                    filter["inputs"][inputName] = []
                }
            }
        }
    }

    #formatNOTInputs(filter) {
        if (!("NOT" in filter)) {
            filter["NOT"] = structuredClone(this.filterTemplate.NOT)
        } else {
            const NOTInputs = Object.keys(this.filterTemplate["NOT"])
            for (let i = 0; i < NOTInputs.length; i++) {
                const inputName = NOTInputs[i]
                if (!(inputName in filter["NOT"]) || !(filter["NOT"][inputName])) {
                    filter["NOT"][inputName] = []
                }
            }
        }
    }

    formatNewFilter(filter, index) {
        const keys = Object.keys(this.filterTemplate)
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            switch (key) {
                case "type":
                    this.#formatFilterType(filter)
                    continue

                case "inputs":
                    this.#formatInputs(filter)
                    continue

                case "NOT":
                    this.#formatNOTInputs(filter)
                    continue
            }
        }

        filter.filterIndex = index
        if (!("filterName" in filter)) {
            filter.filterName = `${filter.type}FILTER${filter.filterIndex}`
        }
        return filter
    }

    async getAllExtraMetaData() {
        return await this.nftMetaData.fetchAllExtraMetaData()
    }

    async getIdsPerAttribute() {
        if (!this.nftMetaData.idsPerAttribute) {
            await this.getAllExtraMetaData()
        }
        return this.nftMetaData.idsPerAttribute
    }


    async #attributeSelectorDropDown(attributeType) {
        const idsPerAttribute = await this.getIdsPerAttribute()
        const dataType = idsPerAttribute[attributeType].dataType

        const dropDownDiv = document.createElement("div")
        dropDownDiv.id = `attributeDropdown-${attributeType}-${this.collectionAddress}`
        dropDownDiv.hidden = true
        dropDownDiv.style = "border: solid; border-right: none; margin: 1px; margin-left: 0.5em;"

        let attributeElements = []
        for (const attribute in idsPerAttribute[attributeType]["attributes"]) {
            const amount = idsPerAttribute[attributeType]["attributes"][attribute].amount

            const attributeSpan = document.createElement("span")
            attributeSpan.innerText = attribute
            //TODO this is not  proof since the amount can be to large or display to small 
            //which can cause the attribute name and amount not to be on the same line
            attributeSpan.style = "display:inline-block; width: 8em; text-overflow: ellipsis; overflow: hidden;"


            const amountSpan = document.createElement("span")
            amountSpan.innerText = amount
            amountSpan.style = "color: grey; float:right;"
            amountSpan.className = "amount"

            const input = document.createElement("input")
            input.type = "checkbox"
            input.id = `${attributeType}-${attribute}-${this.collectionAddress}`
            input.name = `${attributeType}-${attribute}`


            const label = document.createElement("label")
            label.for = `${attributeType}-${attribute}-${this.collectionAddress}`
            label.append(attributeSpan, amountSpan)

            const wrapper = document.createElement("div")
            wrapper.class = "attributeDropDownItem"
            wrapper.append(input, label)

            attributeElements.push([wrapper, Number(amount)])
        }

        attributeElements = attributeElements.sort((a, b) => b[1] - a[1])
        attributeElements.forEach((i) => dropDownDiv.append(i[0]))
        const hideButton = document.createElement("button")
        hideButton.style = "float: right; margin-left: 10em" //14em-4em TODO automatticly take up the rest of the space
        hideButton.innerText = "hide"
        hideButton.onclick = ()=>dropDownDiv.hidden = true
        dropDownDiv.append(hideButton)
        return dropDownDiv

    }


    async #setAttributeTypeSelector(elementId = "inputSelecter") {
        const idsPerAttribute = await this.getIdsPerAttribute()
        const inputSelecterElement = document.getElementById(elementId)

        for (const attributeType in idsPerAttribute) {
            const dropDownElement = await this.#attributeSelectorDropDown(attributeType)
            inputSelecterElement.append(await this.#attributeSelectorDropDown(attributeType))

            const newAttributeTypeElement = document.createElement("button")
            
            newAttributeTypeElement.onclick = () => {
                if (dropDownElement.hidden) {
                    dropDownElement.hidden = false
                } else {
                    dropDownElement.hidden = true
                }
            }

            newAttributeTypeElement.innerText = attributeType
            inputSelecterElement.append(newAttributeTypeElement, document.createElement("br"), dropDownElement)
        }
    }

    setInputTypeHandler(event,elementId = "inputSelecter") {
        document.getElementById(elementId).innerHTML = ""

        const inputType = event.target.value
        switch (inputType) {
            case "attribute":
                this.#setAttributeTypeSelector(elementId)
                break;
            case "id":
                document.getElementById(elementId).innerHTML = `<label>add id <input style="width:7em" type="number" /></label><button >add</button> (TODO)`
                break
            case "filter":
                document.getElementById(elementId).innerHTML = `
                <select name="filterInput" id="filterInput">
                    <option value="">--choose filter--</option>
                    <option value="filter1">filter1</option>
                    <option value="filter2">filter2</option>
                </select>
                <button>add</button>
                (TODO)
         
                `
                break
            default:
     
                break;
        }
    }


}