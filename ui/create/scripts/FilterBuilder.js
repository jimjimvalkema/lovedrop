import { NftDisplay } from "../../scripts/NftDisplay.js"
import { NftMetaDataCollector } from "../../scripts/NftMetaDataCollector.js"

export class FilterBuilder {
    validFilterTypes = ["RANGE", "AND", "OR"]
    filterTemplate = { "type": "OR", "inputs": { "idList": [], "conditions": [], "attributes": [] }, "NOT": { "idList": [], "conditions": [], "attributes": [] } }

    nftMetaData;
    filters = [];
    currentFilterIndex=0;
    //TODO better way to set elementIds 
    /**
     * 
     * @param {string} collectionAddress 
     * @param {ethers.providers} provider 
     * @param {*} ipfsGateway 
     */
    constructor({ collectionAddress, provider, ipfsGateway = "https://ipfs.io", displayElementId = "nftDisplay" }) {
        //globals
        this.nftMetaData = new NftMetaDataCollector(collectionAddress, provider, ipfsGateway)
        this.NftDisplay = new NftDisplay({
            collectionAddress: collectionAddress,
            provider: provider,
            displayElementId: displayElementId,
            ipfsGateway: ipfsGateway,
            nftMetaData: this.nftMetaData
        })
        this.collectionAddress = collectionAddress

        //input handlers
        document.getElementById("inputTypeSelecterInput").addEventListener("change",(event)=>this.#setInputTypeHandler(event))
        document.getElementById("filterSelectorInput").addEventListener("change",(event)=>this.#filterSelectorHandler(event))
        document.getElementById("filterTypeSelectorInput").addEventListener("change",(event)=>this.#filterTypeHandler(event))
        document.getElementById("filterNameInput").addEventListener("change",(event)=>this.#filterNameHandler(event))
        document.getElementById("inclusionSelectionInput").addEventListener("change",(event)=>this.#inclusionSelectionHandler(event))
        this.#setEditInputItemsHandlers()
        
        //initialize ui
        this.#setInputTypeHandler()
        const newFilter = this.createNewFilter("AND")
        this.changeCurrentFilter(newFilter.index)
    }

    #updateInputsDropdowns() {
        const inputTypes = ["inputs", "NOT"]
        const dataTypes = ["attributes", "idList", "conditions"]
        const currentFilter = this.getCurrentFilter()
        for (const inputType of inputTypes) {
            for (const dataType of dataTypes) {
                const items = currentFilter[inputType][dataType]

                this.#createInputsDropdownsItems(inputType,dataType, items)
            }
        }
    }

    #setEditInputItemsHandlers() {
        const inputTypes = ["inputs", "NOT"]
        const dataTypes = ["attributes", "idList", "conditions"]
        for (const inputType of inputTypes) {
            for (const dataType of dataTypes) {

                const editButton = document.getElementById(`${inputType}-${dataType}-edit`)
                editButton.addEventListener("click",(event)=>{
                    const dropDown = document.getElementById(`${inputType}-${dataType}-dropDown`)
                    if (dropDown.hidden) {
                        dropDown.hidden = false
                    } else {
                        dropDown.hidden = true
                    }
                })

                const removeAllButton = document.getElementById(`${inputType}-${dataType}-removeAllButton`)
                removeAllButton.addEventListener("click",console.log("TODO"))
            }
        }

    }

    #getInputsDropDonwItem(inputType,dataType, item) {
        const itemIdentifier = this.#getItemIdentifier(dataType, item)
        const itemName = this.#getItemName(dataType,item)

        const itemElement = document.createElement("div")
        itemElement.innerText = itemName
        itemElement.id = `inputsDropDown-${inputType}-${itemIdentifier}`

        const removeButton = document.createElement("button")
        removeButton.innerText = "X"
        removeButton.addEventListener("click", (event)=>this.removeItemFromFilter(inputType,dataType,item,{inputType, dataType}))
        
        itemElement.append(removeButton)
        return itemElement

    }

    #createInputsDropdownsItems(inputType,dataType, items) {
        const dropdown = document.getElementById(`${inputType}-${dataType}-dropDown`)
        //remove all but keep button
        const removeAllButton = dropdown.lastElementChild
        dropdown.innerHTML = ""
        dropdown.append(removeAllButton)
        
        for (const item of items) {
            const itemElement = this.#getInputsDropDonwItem(inputType,dataType, item)
            dropdown.insertBefore(itemElement, dropdown.lastElementChild)
        }

        return dropdown
    }

    #getItemName(dataType,item) {
        let name
        if(dataType==="attributes") {
            const {trait_type, value} = item
            name = `${trait_type}: ${value}`
        } else {
            name = `${dataType}: ${item}`
        }
        return name

    }

    #getItemIdentifier(dataType,item) {
        let identifier
        if(dataType==="attributes") {
            const {trait_type, value} = item
            identifier = `${dataType}-${trait_type}-${value}-${this.collectionAddress}`
        } else {
            identifier = `${dataType}-${item}-${this.collectionAddress}`
        }
        return identifier
    }

    removeItemFromFilter(inputType,dataType,item,inputTarget=undefined,filterIndex=this.currentFilterIndex) {
        if (!inputTarget) {
            inputTarget = this.#getCurrentInputTarget()
        } 

        const itemIdentifier = this.#getItemIdentifier(dataType,item)
        
        const FilterInputcheckBox = document.getElementById(`filterInput-checkbox-${itemIdentifier}`)
        FilterInputcheckBox.checked = false
        
        const inputDropDownItem = document.getElementById(`inputsDropDown-${inputType}-${itemIdentifier}`)
        inputDropDownItem.outerHTML = ""
        
        const filterTotalInputs = document.getElementById(`filterTotalInputs-${inputType}-${dataType}`)
        filterTotalInputs.innerText = Number(filterTotalInputs.innerText ) - 1

        console.log(inputType,dataType,item)
        if (dataType==="attributes") {
            const {trait_type,  value} = item
            this.#removeAttribute(trait_type, value, filterIndex, inputTarget)
        } else {
            this.#removeInterger(item, filterIndex, inputTarget)
        }
        //remove from filter
    }

    addItemToFilter(inputType,dataType,item,inputTarget=undefined,filterIndex=this.currentFilterIndex) {
        if (!inputTarget) {
            inputTarget = this.#getCurrentInputTarget()
        } 

        const itemIdentifier = this.#getItemIdentifier(dataType,item)
        
        const FilterInputcheckBox = document.getElementById(`filterInput-checkbox-${itemIdentifier}`)
        FilterInputcheckBox.checked = true
        
        const dropdown = document.getElementById(`${inputType}-${dataType}-dropDown`)
        const itemElement = this.#getInputsDropDonwItem(inputType,dataType, item)
        dropdown.insertBefore(itemElement, dropdown.lastElementChild)
        
        const filterTotalInputs = document.getElementById(`filterTotalInputs-${inputType}-${dataType}`)
        filterTotalInputs.innerText = Number(filterTotalInputs.innerText ) + 1

        console.log(inputType,dataType,item)
        if (dataType==="attributes") {
            const {trait_type,  value} = item
            this.#addAttribute(trait_type, value, filterIndex, inputTarget)
        } else {
            this.#addInterger(item, filterIndex, inputTarget)
        }
        //remove from filter
    }

    //getters
    getCurrentFilter() {
        return this.filters[this.currentFilterIndex]
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

    //filter fromatting
    #formatFilterType(filter) {
        if (!("type" in filter)) {
            filter["type"] = "RANGE"
        } else {
            if (this.validFilterTypes.indexOf(filter["type"]) === -1) {
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

        filter.index = index
        if (!("filterName" in filter) || !filter.filterName) {
            filter.filterName = `NewFilter${filter.index}`
        }
        return filter
    }

    //filter selector
    createNewFilter(type, name="") {
        //TODO filtername to just name
        //TODO set filter dropdown of criteria field
        const filtersIndex= this.filters.length
        this.filters.push(this.formatNewFilter(
            {
                "type":type, 
                "filterName": name
            }
            ,filtersIndex
        )) 
        const newFilterOption = document.createElement("option")
        newFilterOption.value = filtersIndex
        newFilterOption.innerText = this.filters[filtersIndex].filterName 
        
        const filterSelector = document.getElementById("filterSelectorInput")
        filterSelector.insertBefore(newFilterOption, filterSelector.lastElementChild)
        filterSelector.value = filtersIndex

        return this.filters[filtersIndex]
    } 

    changeCurrentFilter(index) {
        document.getElementById("filterSelectorInput").value = index
        document.getElementById("filterNameInput").value = this.filters[index].filterName
        document.getElementById("filterTypeSelectorInput").value = this.filters[index].type
        this.currentFilterIndex = index
    }

   
    #filterSelectorHandler(event) {
        const filterterIndex = Number(event.target.value)
        if (filterterIndex === -1) {
            const type = document.getElementById("filterTypeSelectorInput").value
            const newFilter = this.createNewFilter(type)
            this.changeCurrentFilter(newFilter.index)
            
        } else {
            this.changeCurrentFilter(filterterIndex)
        }

    }

    changeFilterType(type, index=this.currentFilterIndex) {
        this.filters[index].type = type
        //TODO filter type formatting???
    }

    changeFilterName(name, index=this.currentFilterIndex) {
        if (name) {
            this.filters[index].filterName = name
        } else {
            //name cant be empty
            name =  this.filters[index].filterName
            document.getElementById("filterNameInput").value = this.filters[index].filterName

        }
        const filterSelector = document.getElementById("filterSelectorInput")
        const optionElement = [...filterSelector.children].find((element)=>Number(element.value) === index)
        optionElement.innerText = name
    }

    #filterTypeHandler(event) {
        const type =  event.target.value
        this.changeFilterType(type)
    }

    #filterNameHandler(event) {
        const name = event.target.value
        this.changeFilterName(name)
    }

    #getCurrentInputTarget() {
        const inputTarget = document.getElementById("inclusionSelectionInput").value
        const dataType = document.getElementById("inputTypeSelecterInput").value
        return {inputType: inputTarget, dataType}
    }

    #updateFilterTotalsUi(inputType, dataType) {
        const currentFilter = this.getCurrentFilter()
        const amount = currentFilter[inputType][dataType].length

        const elementId = `${inputType}-${dataType}-amount`
        document.getElementById(elementId).innerText = amount
    }

    //attribute selector
    #addAttribute(traitType, traitValue, filterIndex = this.currentFilterIndex, inputTarget=undefined) {
        if (!inputTarget) {
            inputTarget = this.#getCurrentInputTarget()
        } 
        const {inputType, dataType} = inputTarget 
        if (dataType !== "attributes") {throw error("inputTarget.dataType has to be attributes")}
    
        //{ "trait_type": "Hat", "value": "alien hat" }\
        const attribute = {["trait_type"]:traitType,["value"]:traitValue}
        this.filters[filterIndex][inputType].attributes.push({["trait_type"]:traitType,["value"]:traitValue})
    }

    #removeAttribute(traitType, traitValue, filterIndex = this.currentFilterIndex, inputTarget=undefined) {
        if (!inputTarget) {
            inputTarget = this.#getCurrentInputTarget()
        } 
        const {inputType, dataType} = inputTarget 
    
        //{ "trait_type": "Hat", "value": "alien hat" }
        const attribute = {["trait_type"]:traitType,["value"]:traitValue}
        this.filters[filterIndex][inputType].attributes = this.filters[filterIndex][inputType].attributes.filter((x)=>!(x.trait_type === traitType && x.value === traitValue))
    }

    #removeInterger(interger, filterIndex = this.currentFilterIndex, inputTarget=undefined) {
        if (!inputTarget) {
            inputTarget = this.#getCurrentInputTarget()
        } 
        const {inputType, dataType} = inputTarget 
        this.filters[filterIndex][inputType][dataType] = this.filters[filterIndex][inputType][dataType].filter((x)=>x===interger)
    }

    #addInterger(interger, filterIndex = this.currentFilterIndex, inputTarget=undefined) {
        if (!inputTarget) {
            inputTarget = this.#getCurrentInputTarget()
        } 
        const {inputType, dataType} = inputTarget 

        this.filters[filterIndex][inputType][dataType].push(interger)
    }

    #attributeCheckBoxHandler(event, traitType, traitValue) {
        console.log(event.target.checked,traitType, traitValue)
        const {inputType, dataType} = this.#getCurrentInputTarget()
        const item = {"trait_type":traitType, "value": traitValue};
        if(event.target.checked === true) { 
            //this.addAttribute(traitType, traitValue, this.currentFilterIndex, this.#getCurrentInputTarget() )
            this.addItemToFilter(inputType,dataType,item)

        } else  {
            // this.removeAttribute(traitType, traitValue, this.currentFilterIndex, this.#getCurrentInputTarget() )
            this.removeItemFromFilter(inputType,dataType,item)
        }
    }

    /**
     * creates a checkbox if it doesnt exist, and calls the change event
     * @param {string} traitType 
     * @param {string} attribute  
     * @param {Element} dropDownDiv
     */
    async #attributeAddButtonHandler(traitType, attribute, dropDownDiv) {
        const attributeCheckBox =  this.#createAttributeCheckBox(await this.getIdsPerAttribute(),traitType,attribute)
        const wrapperId = `wrapper-${traitType}-${attribute}-${this.collectionAddress}`

        let checkBox;
        if ([...dropDownDiv.children].findIndex((x)=>x.id===wrapperId) === -1) {
            dropDownDiv.insertBefore(attributeCheckBox, dropDownDiv.lastElementChild)
            checkBox = attributeCheckBox.children[0]
        } else {
            checkBox  = document.getElementById(`${traitType}-${attribute}-${this.collectionAddress}`)
        }

        checkBox.checked = true
        checkBox.dispatchEvent(new Event('change'));
    }

    #createAttributeCheckBox(idsPerAttribute, attributeType, attribute) {
        const amount = idsPerAttribute[attributeType]["attributes"][attribute].amount
        const dataType = "attributes"
        const item = {"trait_type":attributeType, "value": attribute}
        const itemName = this.#getItemIdentifier(dataType,item)

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
        input.id = `filterInput-checkbox-${itemName}`
        input.name = `${attributeType}-${attribute}`
        input.className = "attributeCheckbox"
        input.addEventListener("change", (event)=>this.#attributeCheckBoxHandler(event, attributeType, attribute))


        const label = document.createElement("label")
        label.for = `${attributeType}-${attribute}-${this.collectionAddress}`
        label.append(attributeSpan, amountSpan)

        const wrapper = document.createElement("div")
        wrapper.class = "attributeDropDownItem"
        wrapper.append(input, label)
        wrapper.id = `filterInput-wrapper-${itemName}}`
        return wrapper
    }


    async #attributeSelectorDropDown(traitType) {
        const idsPerAttribute = await this.getIdsPerAttribute()
        

        const dropDownDiv = document.createElement("div")
        dropDownDiv.id = `attributeDropdown-${traitType}-${this.collectionAddress}`
        dropDownDiv.hidden = true
        dropDownDiv.style = "border: solid; border-right: none; margin: 1px; margin-left: 0.5em;"
        dropDownDiv.className = "attributeDropdown"

        const dataType = idsPerAttribute[traitType].dataType
        if (dataType === "number") {
            const numberInput = document.createElement("input")
            numberInput.type = "number"
            numberInput.min = idsPerAttribute[traitType].min
            numberInput.max = idsPerAttribute[traitType].max
            numberInput.id = `${traitType}-${this.collectionAddress}`
            numberInput.addEventListener("beforeinput", (event) => this.#attributeAddButtonHandler(traitType, numberInput.value, dropDownDiv));
            
            const label = document.createElement("label")
            label.for = numberInput.id
            label.innerText = `${traitType}`

            const button = document.createElement("button")
            button.innerText = "add"
            button.addEventListener("click", (event)=>this.#attributeAddButtonHandler(traitType, numberInput.value, dropDownDiv))
            dropDownDiv.append(label, numberInput, button)

        } else if(dataType === "string") {

        

            let attributeElements = []
            for (const attribute in idsPerAttribute[traitType]["attributes"]) {
                const amount = idsPerAttribute[traitType]["attributes"][attribute].amount
                const wrapper = this.#createAttributeCheckBox(idsPerAttribute,traitType,attribute)

                attributeElements.push([wrapper, Number(amount)])
            }

            attributeElements = attributeElements.sort((a, b) => b[1] - a[1])
            attributeElements.forEach((i) => dropDownDiv.append(i[0]))
        }

        const hideButton = document.createElement("button")
        hideButton.style = "float: right; margin-left: 10em" //14em-4em TODO automatticly take up the rest of the space
        hideButton.innerText = "hide"
        hideButton.onclick = ()=> {
            dropDownDiv.hidden = true
            const amountNotHidden = [...document.getElementsByClassName("attributeDropdown")].filter((x)=>!x.hidden).length
            if (amountNotHidden < 1 ) {
                document.getElementById("hideAllAttributeDropdownsButton").hidden = true

            }
        }
        dropDownDiv.append(hideButton)
        return dropDownDiv

    }

    async #setAttributeTypeSelector(elementId = "inputSelecter") {
        const idsPerAttribute = await this.getIdsPerAttribute()
        const inputSelecterElement = document.getElementById(elementId)

        const hideAllButton = document.createElement("button")
        hideAllButton.innerText = "hide all"
        hideAllButton.onclick = ()=>[...document.getElementsByClassName("attributeDropdown")].forEach((x)=>{x.hidden=true; hideAllButton.hidden=true})
        hideAllButton.style ="float: right; margin-left: 8em;"
        hideAllButton.id = "hideAllAttributeDropdownsButton"
        hideAllButton.hidden = true
        


        for (const attributeType in idsPerAttribute) {
            const dropDownElement = await this.#attributeSelectorDropDown(attributeType)
            inputSelecterElement.append(dropDownElement)

            const newAttributeTypeElement = document.createElement("button")
            
            newAttributeTypeElement.onclick = () => {
                if (dropDownElement.hidden) {
                    dropDownElement.hidden = false
                    hideAllButton.hidden = false
                    
                } else {
                    dropDownElement.hidden = true
                    const amountNotHidden = [...document.getElementsByClassName("attributeDropdown")].filter((x)=>!x.hidden).length
                    if (amountNotHidden < 1 ) {
                        hideAllButton.hidden = true

                    }
                }
            }

            newAttributeTypeElement.innerText = attributeType
            inputSelecterElement.append(newAttributeTypeElement, document.createElement("br"), dropDownElement)
        }


        inputSelecterElement.append(hideAllButton)
    }

    async #setCheckedStatusAttributes() {
        const {inputType} = this.#getCurrentInputTarget()
        const dataType = "attributes"
        const currentFilter = this.getCurrentFilter() 
        const currentInputs = currentFilter[inputType][dataType]
        const idsPerAttribute = await this.getIdsPerAttribute()

        for (const attribute of currentInputs) {
            console.log(attribute)
            const {trait_type, value} = attribute
            //const attributeDataType = idsPerAttribute[trait_type].dataType
            const itemName = this.#getItemIdentifier(dataType,attribute)
            let checkBox = document.getElementById(`filterInput-checkbox-${itemName}`)
            if (checkBox) {
                checkBox.checked = true

            } else {
                const dropDownDiv = document.getElementById(`attributeDropdown-${trait_type}-${this.collectionAddress}`)
                const wrapper = this.#createAttributeCheckBox(idsPerAttribute,trait_type,value)
                dropDownDiv.insertBefore(wrapper, dropDownDiv.lastElementChild)
                checkBox = document.getElementById(`${trait_type}-${value}-${this.collectionAddress}`)
                checkBox.checked = true
            }

        }
    }   

    #inclusionSelectionHandler(event) {
        const {inputType,dataType} = this.#getCurrentInputTarget()
        console.log(inputType,dataType)
        switch (dataType) {
            case "attributes":
                [...document.getElementsByClassName("attributeCheckbox")].forEach((x)=>x.checked=false)
                //this.#updateFilterTotalsUi(inputType,dataType,"all")
                this.#setCheckedStatusAttributes()
                break;
            case "id":
                break;
            case "filter":
                break;
            
            default:
                break;
        }
    }

    //input type handler
    async #setInputTypeHandler(event={"target":{"value":"attributes"}}, elementId = "inputSelecter") {
        document.getElementById(elementId).innerHTML = ""
        //TODO maybe hide element instead of removing them is faster render

        const inputType = event.target.value
        console.log(inputType)
        switch (inputType) {
            case "attributes":
                await this.#setAttributeTypeSelector(elementId);
                [...document.getElementsByClassName("attributeCheckbox")].forEach((x)=>x.checked=false)
                this.#setCheckedStatusAttributes()
                break;
            case "conditions":
                document.getElementById(elementId).innerHTML = `<label>add id <input style="width:7em" type="number" /></label><button >add</button> (TODO)`
                break
            case "idList":
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