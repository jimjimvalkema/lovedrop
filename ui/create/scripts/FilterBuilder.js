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
        console.log(collectionAddress)
        this.NftDisplay = new NftDisplay({
            collectionAddress: collectionAddress,
            provider: provider,
            displayElementId: displayElementId,
            ipfsGateway: ipfsGateway,
            nftMetaData: this.nftMetaData
        })
        this.collectionAddress = collectionAddress
        this.displayElementId = displayElementId

        //input handlers
        document.getElementById("inputTypeSelecterInput").addEventListener("change",(event)=>this.#setInputTypeHandler(event))
        document.getElementById("filterSelectorInput").addEventListener("change",(event)=>this.#filterSelectorHandler(event))
        document.getElementById("filterTypeSelectorInput").addEventListener("change",(event)=>this.#filterTypeHandler(event))
        document.getElementById("filterNameInput").addEventListener("change",(event)=>this.#filterNameHandler(event))
        document.getElementById("inclusionSelectionInput").addEventListener("change",(event)=>this.#inclusionSelectionHandler(event))
        document.getElementById("runFilterButton").addEventListener("click", ()=>this.runFilter())
        this.#setEditInputItemsHandlers()
        
        //initialize ui
        this.#setInputTypeHandler({"target":{"value":"attributes"}})
        const newFilter = this.createNewFilter("AND")
        this.changeCurrentFilter(newFilter.index)

        
        this.runFilter()
    }

    async #onFilterChange() {
        await this.runFilter()
    }

    async runFilter() {
        console.log(this.displayElementId)
        
        
        const oldImgElements = [...document.getElementsByClassName("nftImagesDiv")]
        oldImgElements.forEach((img)=> img.style.opacity = 0);
        this.NftDisplay.clear()

        const currentFilter = this.getCurrentFilter()
        const resultIdSet = await this.nftMetaData.processFilter(currentFilter)
        this.NftDisplay.ids = [...resultIdSet]
        await this.NftDisplay.createDisplay()

        // imgeElements.forEach((img)=> img.style.opacity = 0)
        // setTimeout(() => {
        //    imgeElements.forEach((img)=> img.style.opacity = 1)
        //   }, 250);
        const imgElements = [...document.getElementsByClassName("nftImagesDiv")]
        imgElements.forEach((img)=> img.style.opacity = 0);
        setTimeout(() => {imgElements.forEach((img)=> img.style.opacity = 1)}, 50)
        
   

    }

    #updateInputsDropdowns() {
        const inputTypes = ["inputs", "NOT"]
        const dataTypes = ["attributes", "idList", "conditions"]
        const currentFilter = this.getCurrentFilter()
        for (const inputType of inputTypes) {
            for (const dataType of dataTypes) {
                const items = currentFilter[inputType][dataType]
                console.log(inputType,dataType,items)

                const dropDown = document.getElementById(`${inputType}-${dataType}-dropDown`)
                const removeAllButton = document.getElementById(`${inputType}-${dataType}-removeAllButton`)
                dropDown.innerHTML = "" 
                dropDown.append(removeAllButton)
                
                items.forEach((item)=>{
                    const itemElement = this.#getInputsDropDownItem(inputType,dataType, item)
                    dropDown.insertBefore(itemElement,removeAllButton)
                })
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
                removeAllButton.addEventListener("click",()=>this.#clearAllEditInputHandler(inputType,dataType))
            }
        }

    }

    #getInputsDropDownItem(inputType,dataType, item) {
        const itemIdentifier = this.#getItemIdentifier(dataType, item)
        const itemName = this.#getItemName(dataType,item)

        // const nameSpan = document.createElement("span")
        // nameSpan.innerText = itemName
        // nameSpan.className = "inputsDropDownItemName"

        const itemElement = document.createElement("div")
        itemElement.id = `inputsDropDown-${inputType}-${itemIdentifier}`
        itemElement.className = "inputsDropDownItemWrapper"
//////////////////////////
        const input = document.createElement("input")
        input.type = "checkbox"
        input.id = `remove-${inputType}-${dataType}-${item}` //TODO collection address?
        input.name = `remove ${inputType} ${dataType} ${item}`
        input.className = "inputsDropDownItem"
        input.addEventListener("click", (event)=>this.removeItemFromFilter(item,{inputType, dataType}))
        input.checked = true


        const label = document.createElement("label")
        label.for = input.id 
        label.innerText = itemName
            /////////////////////////
        // const removeButton = document.createElement("checkboc")
        // removeButton.innerText = "X"
        // removeButton.addEventListener("click", (event)=>this.removeItemFromFilter(inputType,dataType,item,{inputType, dataType}))
        // removeButton.className = "editInput-removeAttributeButton"
        
        itemElement.append(input,label)
        return itemElement

    }

    #createInputsDropdownsItems(inputType,dataType, items) {
        const dropdown = document.getElementById(`${inputType}-${dataType}-dropDown`)
        //remove all but keep button
        const removeAllButton = dropdown.lastElementChild
        dropdown.innerHTML = ""
        dropdown.append(removeAllButton)
        
        for (const item of items) {
            const itemElement = this.#getInputsDropDownItem(inputType,dataType, item)
            dropdown.insertBefore(itemElement, dropdown.lastElementChild)
        }

        return dropdown
    }

    #getItemName(dataType,item) {
        let name
        switch (dataType) {
            case "attributes":
                const {trait_type, value} = item
                name = `${trait_type}-${value}`
                break;

            case "conditions":
                name = `${item.filterName}`
                break;

            case "idList":
                name = `${item}`
                break;
        
            default:
                name = `${item}`
                console.warn(`dataType: ${dataType} not recognized`)
                break;
        }


        return name

    }

    #getItemIdentifier(dataType,item) {
        let identifier
        switch (dataType) {
            case "attributes":
                const {trait_type, value} = item
                identifier = `${dataType}-${trait_type}-${value}-${this.collectionAddress}`
                break;

            case "conditions":
                identifier = `${dataType}-${item.index}-${this.collectionAddress}`
                break;
                
            case "idList":
                identifier = `${dataType}-${item}-${this.collectionAddress}`
                break;
        
            default:
                identifier = `${dataType}-${item}-${this.collectionAddress}`
                console.warn(`dataType: ${dataType} not recognized`)
                break;
        }
        return identifier
    }
    async #clearAllEditInputHandler(inputType,dataType,filterIndex=this.currentFilterIndex) {
        this.filters[filterIndex][inputType][dataType] = []
        this.#clearEditInputDropdown(inputType,dataType,filterIndex)
        this.#updateFilterTotalsUi(inputType,dataType);
        if (dataType==="attributes") {
            [...document.getElementsByClassName("attributeCheckbox")].forEach((x)=>x.checked=false)
            await this.#setCheckedStatusAttributes()
        }

    }

    #clearEditInputDropdown(inputType,dataType,filterIndex=this.currentFilterIndex) {
        const dropdown = document.getElementById(`${inputType}-${dataType}-dropDown`)
        const clearAllButton = dropdown.lastElementChild
        dropdown.innerHTML = ""
        dropdown.append(clearAllButton)
        dropdown.hidden = true
        
    }


    removeItemFromFilter(item,inputTarget=undefined,filterIndex=this.currentFilterIndex) {
        if (!inputTarget) {
            inputTarget = this.#getCurrentInputTarget()
        } 
        const {inputType,dataType} = inputTarget


        const itemIdentifier = this.#getItemIdentifier(dataType,item)
        

        
        const inputDropDownItem = document.getElementById(`inputsDropDown-${inputType}-${itemIdentifier}`)
        inputDropDownItem.outerHTML = ""
        
        const filterTotalInputs = document.getElementById(`filterTotalInputs-${inputType}-${dataType}`)
        filterTotalInputs.innerText = Number(filterTotalInputs.innerText ) - 1

        switch (dataType) {
            case "attributes":
                this.#removeAttribute(item, filterIndex, inputTarget)
                break;

            case "conditions":
                this.#removeFilter(item, filterIndex, inputTarget)
                break;
    
            case "idList":
                this.#removeInterger(item, filterIndex, inputTarget)
                break;
        
            default:
                break;
        }

        this.#onFilterChange()
    }

    addItemToFilter(item,inputTarget=undefined,filterIndex=this.currentFilterIndex) {
        if (!inputTarget) {
            inputTarget = this.#getCurrentInputTarget()
        } 
        const {inputType,dataType} = inputTarget
        
        console.log(inputType,dataType,item)

        let isAdded
        switch (dataType) {
            case "attributes":
                isAdded = this.#addAttribute(item, filterIndex, inputTarget)
                break;

            case "conditions":
                isAdded = this.#addFilter(item, filterIndex, inputTarget)
                break;
    
            case "idList":
                isAdded = this.#addInterger(item, filterIndex, inputTarget)
                break;
        
            default:
                console.error(`dataType: ${dataType} is not recognized`)
                break;
        }

        if (isAdded) { //incase its already inthere
            const dropdown = document.getElementById(`${inputType}-${dataType}-dropDown`)
            const itemElement = this.#getInputsDropDownItem(inputType,dataType, item)
            dropdown.insertBefore(itemElement, dropdown.lastElementChild)
            
            const filterTotalInputs = document.getElementById(`filterTotalInputs-${inputType}-${dataType}`)
            filterTotalInputs.innerText = Number(filterTotalInputs.innerText ) + 1    
        }
        this.#onFilterChange()
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

        this.#updateAllFilterTotalsUi()
        this.#updateInputsDropdowns()
        const selectedDataType = document.getElementById("inputTypeSelecterInput").value
        this.#setInputTypeHandler({"target":{"value":selectedDataType}})


    }

    #updateAllFilterTotalsUi() {
        const inputTypes = ["inputs", "NOT"]
        const dataTypes = ["attributes", "idList", "conditions"]
        for (const inputType of inputTypes) {
            for (const dataType of dataTypes) {
                this.#updateFilterTotalsUi(inputType, dataType)
            }
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

        const elementId = `filterTotalInputs-${inputType}-${dataType}`
        document.getElementById(elementId).innerText = amount
    }

    //attribute selector
    #addAttribute(attribute, filterIndex = this.currentFilterIndex, inputTarget=undefined) {
        const {trait_type,  value} = attribute

        if (!inputTarget) {
            inputTarget = this.#getCurrentInputTarget()
        } 
        const {inputType, dataType} = inputTarget 
        if (dataType !== "attributes") {throw error("inputTarget.dataType has to be attributes")}
    
        //{ "trait_type": "Hat", "value": "alien hat" }
        console.log(trait_type, value)
        console.log(this.filters[filterIndex][inputType].attributes)

        const attributeIndex = this.filters[filterIndex][inputType].attributes.findIndex((x)=>(x.trait_type === trait_type && x.value === value))
        console.log(attributeIndex)
        if (attributeIndex===-1) {
            this.filters[filterIndex][inputType].attributes.push(attribute)

            const itemIdentifier = this.#getItemIdentifier(dataType,attribute)
            const attributeInputcheckBox = document.getElementById(`filterInput-checkbox-${itemIdentifier}`)
            attributeInputcheckBox.checked = true
            return true
        } else {
            return false
        }


    }

    #removeAttribute(attribute, filterIndex = this.currentFilterIndex, inputTarget=undefined) {
        const {trait_type,  value} = attribute

        if (!inputTarget) {
            inputTarget = this.#getCurrentInputTarget()
        } 
        const {inputType, dataType} = inputTarget 
    
        //{ "trait_type": "Hat", "value": "alien hat" }
        this.filters[filterIndex][inputType].attributes = this.filters[filterIndex][inputType].attributes.filter((x)=>!(x.trait_type === trait_type && x.value === value))

        const itemIdentifier = this.#getItemIdentifier(dataType,attribute)
        const attributeInputcheckBox = document.getElementById(`filterInput-checkbox-${itemIdentifier}`)
        attributeInputcheckBox.checked = false
    }

    #removeInterger(interger, filterIndex = this.currentFilterIndex, inputTarget=undefined) {
        if (!inputTarget) {
            inputTarget = this.#getCurrentInputTarget()
        } 
        const {inputType, dataType} = inputTarget 
        this.filters[filterIndex][inputType][dataType] = this.filters[filterIndex][inputType][dataType].filter((x)=>x===interger)

        // const itemIdentifier = this.#getItemIdentifier(dataType,interger)
        // const itemInputcheckBox = document.getElementById(`filterInput-checkbox-${itemIdentifier}`)
        // itemInputcheckBox.checked = false
    }

    #addInterger(interger, filterIndex = this.currentFilterIndex, inputTarget=undefined) {
        if (!inputTarget) {
            inputTarget = this.#getCurrentInputTarget()
        } 
        const {inputType, dataType} = inputTarget 

        if (this.filters[filterIndex][inputType][dataType].indexOf(interger) === -1) {
            this.filters[filterIndex][inputType][dataType].push(interger)
            return true
        } else {
            return false
        }
        
    }

    #addFilter(filter, filterIndex = this.currentFilterIndex, inputTarget=undefined) {
        if (!inputTarget) {
            inputTarget = this.#getCurrentInputTarget()
        } 
        const {inputType, dataType} = inputTarget 

        const indexOfFilter = this.filters[filterIndex][inputType][dataType].findIndex((x)=>x.index === filter.index)
        if (indexOfFilter === -1) {
            this.filters[filterIndex][inputType][dataType].push(filter)
            return true
        } else {
            return false
        }
    }

    #removeFilter(filter, filterIndex = this.currentFilterIndex, inputTarget=undefined) {
        if (!inputTarget) {
            inputTarget = this.#getCurrentInputTarget()
        } 
        const {inputType, dataType} = inputTarget 

        this.filters[filterIndex][inputType][dataType] = this.filters[filterIndex][inputType][dataType].filter((x)=>x.index===filter.index)
    }

    #attributeCheckBoxHandler(event, traitType, traitValue) {
        console.log(event.target.checked,traitType, traitValue)
        const inputTarget = this.#getCurrentInputTarget()
        const item = {"trait_type":traitType, "value": traitValue};
        if(event.target.checked === true) { 
            //this.addAttribute(traitType, traitValue, this.currentFilterIndex, this.#getCurrentInputTarget() )
            this.addItemToFilter(item,inputTarget)

        } else  {
            // this.removeAttribute(traitType, traitValue, this.currentFilterIndex, this.#getCurrentInputTarget() )
            this.removeItemFromFilter(item,inputTarget)
        }
    }

    /**
     * creates a checkbox if it doesnt exist, and calls the change event
     * @param {string} traitType 
     * @param {string} attribute  
     * @param {Element} dropDownDiv
     */
    async #attributeAddButtonHandler(traitType, attribute, dropDownDiv, event=undefined) {
        console.log(event)
        //dont trigger on anything other then enter or add button press
        if ((event.key!=="Enter" && event.key!==undefined)) {
            return false
        }
        const attributeCheckBox =  this.#createAttributeCheckBox(await this.getIdsPerAttribute(),traitType,attribute)
        const identifier = this.#getItemIdentifier("attributes", {"trait_type":traitType, "value":attribute})
        const wrapperId = `filterInput-wrapper-${identifier}`
        console.log(`filterInput-wrapper-${identifier}`)

        let checkBox;
        if ([...dropDownDiv.children].findIndex((x)=>x.id===wrapperId) === -1) {
            dropDownDiv.insertBefore(attributeCheckBox, dropDownDiv.lastElementChild)
            checkBox = attributeCheckBox.children[0]
        } else {
            checkBox  = document.getElementById(`filterInput-checkbox-${identifier}`)
        }

        if (!checkBox.checked) {
            checkBox.checked = true
            checkBox.dispatchEvent(new Event('change'));
        }

    }

    #createAttributeCheckBox(idsPerAttribute, attributeType, attribute) {
        const amount = idsPerAttribute[attributeType]["attributes"][attribute].amount
        const dataType = "attributes"
        const item = {"trait_type":attributeType, "value": attribute}
        const identifier = this.#getItemIdentifier(dataType,item)

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
        input.id = `filterInput-checkbox-${identifier}`
        input.name = `${attributeType}-${attribute}`
        input.className = "attributeCheckbox"
        input.addEventListener("change", (event)=>this.#attributeCheckBoxHandler(event, attributeType, attribute))


        const label = document.createElement("label")
        label.for = `${attributeType}-${attribute}-${this.collectionAddress}`
        label.append(attributeSpan, amountSpan)

        const wrapper = document.createElement("div")
        wrapper.class = "attributeDropDownItem"
        wrapper.append(input, label)
        wrapper.id = `filterInput-wrapper-${identifier}`
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
            numberInput.addEventListener("keypress", (event) => this.#attributeAddButtonHandler(traitType, numberInput.value, dropDownDiv, event));
            
            const label = document.createElement("label")
            label.for = numberInput.id
            label.innerText = `${traitType}`

            const button = document.createElement("button")
            button.innerText = "add"
            button.addEventListener("click", (event)=>this.#attributeAddButtonHandler(traitType, numberInput.value, dropDownDiv, event))
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
            case "idList":
                console.log("aa")
                document.getElementById('inputSelecter').innerHTML = ""
                this.#setInputTypeHandler({"target":{"value":"idList"}})
                break;
            case "conditions":
                document.getElementById('inputSelecter').innerHTML = ""
                this.#setInputTypeHandler({"target":{"value":"conditions"}})
                break;
            
            default:
                break;
        }
    }

    #addFilterButtonHandler(selector) {
        const inputTarget = this.#getCurrentInputTarget()
        const {inputType, dataType} =inputTarget
        this.addItemToFilter( this.filters[selector.value], inputTarget, this.currentFilterIndex) //;(this.filters[selector.value], this.currentFilterIndex, {inputType, dataType} )
        //this.#updateFilterTotalsUi(inputType, dataType)
    }

    #setConditionsSelector(elementId) {
        //TODO prevent filters looping back into them selfs somehow
        const {inputType, dataType} = this.#getCurrentInputTarget()
        const inputSelecterElement = document.getElementById(elementId)
        const selector = document.createElement("select")
        selector.name = "filter selector"
        selector.id = `${inputType}-${dataType}-selecter-${this.collectionAddress}`

        const defaultOption = document.createElement("option")
        defaultOption.innerText = "--choose filter--"
        selector.append(defaultOption)

        this.filters.forEach((filter)=> {
            //prevent inputing a filter into it self
            if (filter.index !== this.currentFilterIndex) {
                const option = document.createElement("option")
                option.value = filter.index
                option.innerText = filter.filterName
                selector.append(option)
            }

        })

        const addButton = document.createElement("button")
        if (inputType==="inputs") {
            addButton.innerText = "add"
        } else if (inputType === "NOT") {
            addButton.innerText = "exclude"
        }
        
        addButton.addEventListener("click",(x)=>this.#addFilterButtonHandler(selector))
        inputSelecterElement.append(selector, addButton)
    }

    #addIdButtonHandler(id,event=undefined) {
        console.log(event.key)
        if (!id) {
            return false
        }
        //dont trigger on anything other then enter or add button press
        if ((event.key!=="Enter" && event.key!==undefined)) {
            return false
        }

        const inputTarget = this.#getCurrentInputTarget()
        const {inputType, dataType} =inputTarget
        this.addItemToFilter( id, inputTarget, this.currentFilterIndex)
    }

    async #setIdListInput(elementId) {
        const {inputType, dataType} = this.#getCurrentInputTarget()

        const input = document.createElement("input")
        //TODO better identifier naming scheme to prevent conflicts between collections and criteria
        input.id = `${inputType}-${dataType}-selector`
        input.className = "idList-selector"
        input.type = "number"
        input.min = await this.nftMetaData.getFirstId()
        input.max = await this.nftMetaData.getLastId()
        input.addEventListener("keypress", (event)=> this.#addIdButtonHandler(input.value,event))

        const label = document.createElement("label") 
        const addButton = document.createElement("button")
        
        if (inputType==="inputs") {
            label.innerText = `add id: `
            addButton.innerText = "add"
        } else if(inputType==="NOT") {
            label.innerText = `exclude id: `
            addButton.innerText = "exclude"
        }

        label.append(input)

        addButton.addEventListener("click", (event)=> this.#addIdButtonHandler(input.value,event))
        document.getElementById(elementId).append(label, addButton)
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
            case "idList":
                this.#setIdListInput(elementId)
                //document.getElementById(elementId).innerHTML = `<label>add id <input style="width:7em" type="number" /></label><button >add</button> (TODO)`
                break
            case "conditions":
                this.#setConditionsSelector(elementId)
                // document.getElementById(elementId).innerHTML = `
                // <select name="filterInput" id="filterInput">
                //     <option value="">--choose filter--</option>
                // </select>
                // <button>add</button>
                // `
                break
            default:
     
                break;
        }
    }


}