import { NftDisplay } from "../../scripts/NftDisplay.js"
import { NftMetaDataCollector } from "../../scripts/NftMetaDataCollector.js"
import { ethers } from "../../scripts/ethers-5.2.esm.min.js"

export class FilterBuilder {
    validFilterTypes = ["RANGE", "AND", "OR"]
    filterTemplate = { "type": "OR", "inputs": { "idList": [], "conditions": [], "attributes": [] }, "NOT": { "idList": [], "conditions": [], "attributes": [] } }

    filtersMadePerCollectionCount = {}
    nftMetaData;
    filtersPerCollection = {};
    currentFilterIndex=0;
    onfilterChangeFunc = []

    filterNameInput = "filterNameInput"
    filterSelector = "filterSelectorInput"
    deleteFilterId = "deleteFilter"
    filterSelectors = [this.filterSelector]
    //TODO better way to set elementIds 
    /**
     * 
     * @param {string} collectionAddress 
     * @param {ethers.providers} provider 
     * @param {*} ipfsGateway 
     */
    constructor({ collectionAddress, provider, ipfsGateway = "https://ipfs.io", displayElementId = "nftDisplay", filterSelectors=[] }) {
        //globals
        
        //this.collectionAddress = ethers.utils.getAddress(collectionAddress)
        this.ipfsGateway = ipfsGateway
        this.provider = provider
        this.displayElementId = displayElementId
        this.filterSelectors = [...this.filterSelectors, ...filterSelectors] //used by addOptionToFilterSelectors removeOptionToFilterSelectors and updateOptionNameFromFilterSelectors
        this.setCollectionAddress(collectionAddress)

        

        //input handlers

        document.getElementById("inputTypeSelecterInput").addEventListener("change",(event)=>this.#setInputTypeHandler(event))
        document.getElementById(this.filterSelector).addEventListener("change",(event)=>this.#filterSelectorHandler(event))
        document.getElementById(this.deleteFilterId).addEventListener("click",(event)=>this.#deleteFilterHandler(event))
        document.getElementById("filterTypeSelectorInput").addEventListener("change",(event)=>this.#filterTypeHandler(event))
        document.getElementById(this.filterNameInput).addEventListener("change",(event)=>this.#filterNameHandler(event))
        document.getElementById("inclusionSelectionInput").addEventListener("change",(event)=>this.#inclusionSelectionHandler(event))
        document.getElementById("runFilterButton").addEventListener("click", ()=>this.runFilter())
        // document.getElementById("nftContractAddressInput").addEventListener("keypress", (event)=>this.setCollectionAddressHandler(event))
        // document.getElementById("submitNftContract").addEventListener(("click"), (event)=>this.setCollectionAddressHandler(event))
        this.#setEditInputItemsHandlers()
        
        //initialize ui
        //this.reinitializeUi()

    }

    //TODO
    //every filter add, remove, read
    //setting collectionAddress = add to this.filtersPerCollection

    reinitializeUi() {
        console.log("initializing")
        if (!(this.collectionAddress in this.filtersPerCollection)) {
            this.filtersPerCollection[this.collectionAddress] = []
        }

        this.#resetfilterSelectorInputsUi()



        //this.#setInputTypeHandler({"target":{"value":"attributes"}})

        if (this.getFiltersOfCollection().length === 0) {
            const newFilter = this.createNewFilter("AND")
            this.changeCurrentFilter(newFilter.index)
        } else {
            this.changeCurrentFilter(0)
        }
        // } else {
        //     this.changeCurrentFilter(0)
        // }




        //fix select filter
        //reset inputs ui
    }

    #deleteFilterHandler() {
        this.removeFilter(this.currentFilterIndex)
        const currentFiltersList = this.getFiltersOfCollection()
        console.log("len",currentFiltersList.length)

        if(currentFiltersList.length===0) {
            const type = document.getElementById("filterTypeSelectorInput").value
            const newFilter = this.createNewFilter(type)
            this.changeCurrentFilter(newFilter.index)
        } else {
            this.changeCurrentFilter(currentFiltersList.length-1)
        }
    }
    #resetfilterSelectorInputsUi() {
        for (const elementId of this.filterSelectors) {
           
            const filterSelector = document.getElementById(elementId)
            const children = [...filterSelector.children]
            children.forEach((x)=>{
                //skip add new filter
                if (x.value>-1){
                    x.outerHTML = ""
                }
            })
    
            this.#addAllFilterOptionsToSelector({selector:filterSelector})

            if (elementId == this.filterSelector) {
                filterSelector.value = 0
                const currentFilter =this.getCurrentFilter()
                if (currentFilter) {
                    document.getElementById(this.filterNameInput).value  = currentFilter.filterName
                }

            } else {
                filterSelector.value = -1
            }
        }
    }

    #setCollectionAddressHandler(event) {
        const value = document.getElementById("nftContractAddressInput").value
        if ((event.key!=="Enter" && event.key!==undefined && value!==undefined)) {
            return false
        }
        this.setCollectionAddress(value)
    }

    setCollectionAddress(addres) {
        if (!addres) {
            console.warn("collection address not set")
            return
        }
        //set defaults if not exist
        this.collectionAddress = ethers.utils.getAddress(addres)
        if ((this.collectionAddress in this.filtersPerCollection) === false) {
            this.filtersPerCollection[this.collectionAddress] = []
        }
        if(!(this.collectionAddress in this.filtersMadePerCollectionCount )) {
            this.filtersMadePerCollectionCount[this.collectionAddress] = 0
        }

        //clear nfts
        if (this.NftDisplay) {
            this.NftDisplay.clear()
        }

        //reinitialize metaData and display
        this.nftMetaData = new NftMetaDataCollector(this.collectionAddress, this.provider, this.ipfsGateway)
        this.NftDisplay = new NftDisplay({
            collectionAddress: this.collectionAddress,
            provider: this.provider,
            displayElementId: this.displayElementId,
            ipfsGateway: this.ipfsGateway,
            nftMetaData: this.nftMetaData
        })
        this.NftDisplay.displayNames({redirect:true})
        this.NftDisplay.showAttributes()

        this.reinitializeUi()
    }
    
    async #onFilterChange() {
        const ids = await this.runFilter()
        const currentFilter = this.getCurrentFilter()

        for (const func of this.onfilterChangeFunc) {
            func(currentFilter, ids)
        }
    }


    addOnFilterChangeFunc(func) {
        if(!typeof(func)) {
            throw new Error('not a function');
        }
        if (!func.name) {
            throw new Error('unnamed function cant be added.');
        }
        this.onfilterChangeFunc.push(func)
    }

    removeOnFilterChangeFunc(func) {
        if(!typeof(func)) {
            throw new Error('not a function');
        }
        if (!func.name) {
            throw new Error('unnamed function cant be removed like this. Use .removeOnFilterChangeFuncByIndex().');
        }
        this.onfilterChangeFunc = this.onfilterChangeFunc.filter((x)=>x.name===func.name)
    }

    removeOnFilterChangeFuncByIndex(index) {
        this.onfilterChangeFunc.splice(index,1);
    }

    async runFilter() {
        
        const oldImgElements = [...document.getElementsByClassName("nftImagesDiv")]
        oldImgElements.forEach((img)=> img.style.opacity = 0);
        this.NftDisplay.clear()

        const currentFilter = this.getCurrentFilter()
        const resultIdSet = await this.nftMetaData.processFilter(currentFilter)
        const ids  = [...resultIdSet]
        this.NftDisplay.ids = ids
        await this.NftDisplay.createDisplay()

        // imgeElements.forEach((img)=> img.style.opacity = 0)
        // setTimeout(() => {
        //    imgeElements.forEach((img)=> img.style.opacity = 1)
        //   }, 250);
        const imgElements = [...document.getElementsByClassName("nftImagesDiv")]
        imgElements.forEach((img)=> img.style.opacity = 0);
        setTimeout(() => {imgElements.forEach((img)=> img.style.opacity = 1)}, 50)
        return ids
        
   

    }

    #updateInputsDropdowns() {
        const inputTypes = ["inputs", "NOT"]
        const dataTypes = ["attributes", "idList", "conditions"]
        const currentFilter = this.getCurrentFilter()
        for (const inputType of inputTypes) {
            for (const dataType of dataTypes) {
                const items = currentFilter[inputType][dataType]

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
        const currentFilter = this.getCurrentFilter()
        currentFilter[inputType][dataType] = []
        this.#clearEditInputDropdown(inputType,dataType,filterIndex)
        this.#updateFilterTotalsUi(inputType,dataType);
        if (dataType==="attributes") {
            [...document.getElementsByClassName("attributeCheckbox")].forEach((x)=>x.checked=false)
            await this.#setCheckedStatusAttributes()
        }
        this.#onFilterChange()

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
                this.#removeFilterFromInputs(item, filterIndex, inputTarget)
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
        

        let isAdded
        switch (dataType) {
            case "attributes":
                isAdded = this.#addAttribute(item, filterIndex, inputTarget)
                break;

            case "conditions":
                isAdded = this.#addFilterToInputs(item, filterIndex, inputTarget)
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


    getFiltersOfCollection(collection=this.collectionAddress) {
        if(collection in this.filtersPerCollection) {
            return this.filtersPerCollection[collection]
        } else {
            this.filtersPerCollection[collection] = []
            return this.filtersPerCollection[collection] 
        }
        

    }
    //getters
    getCurrentFilter() {
        return this.getFiltersOfCollection()[this.currentFilterIndex]
    }

    getFilter(index) {
        return this.getFiltersOfCollection()[index]
    }

    #addFilterToCollection(filter, collection=this.collectionAddress) {
        const currentFilterArr = this.getFiltersOfCollection(collection)
        const index = currentFilterArr.length
        currentFilterArr.push(this.formatNewFilter(filter,index))

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

    formatNewFilter(filter={}, index=undefined) {
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
        if("index" in filter && index === undefined) {
            console.warn("filter already has a index and is not overwritten. This might create conflicts!")
        }

        filter.index = index
        if (!("filterName" in filter) || !filter.filterName) {
            let filterCount = this.filtersMadePerCollectionCount[this.collectionAddress] +=1
            filter.filterName = `NewFilter#${filterCount}`
        }
        return filter
    }



    //filter selector
    createNewFilter(type, name="") {
        //TODO filtername to just name
        //TODO set filter dropdown of criteria field
        const newFiltersIndex= this.getFiltersOfCollection().length
        // this.filtersPerCollection.push(this.formatNewFilter(
        //     {
        //         "type":type, 
        //         "filterName": name
        //     }
        //     ,filtersIndex
        // )) 

        this.#addFilterToCollection({"type":type, "filterName": name})
        const newFilter = this.getFiltersOfCollection()[newFiltersIndex]
        this.#addOptionToFilterSelectors(newFilter)

        return newFilter
    } 

    #createNewFilterOptionElement(newFilter) {
        const newFilterOption = document.createElement("option")
        newFilterOption.value = newFilter.index
        newFilterOption.innerText = newFilter.filterName 
        return newFilterOption
    }

    #addOptionToFilterSelectors(newFilter) {
        for (const selectorId of this.filterSelectors) {
            const newFilterOption = this.#createNewFilterOptionElement(newFilter)
            
            const filterSelector = document.getElementById(selectorId)
            const addNewOption = [...filterSelector.children].find((x)=>x.value==="-1")

            if (addNewOption) {
                filterSelector.insertBefore(newFilterOption, filterSelector.lastElementChild)
            } else {
                filterSelector.append(newFilterOption)
            }

            //TODO make "filterSelectorInput" a global or each selectorId have option like this
            if(selectorId === this.filterSelector) {
                filterSelector.value = newFilterOption.value
            }
            
        }
    }

    #updateOptionNameFromFilterSelectors(name, filterIndex) {
        for (const selectorId of this.filterSelectors) {
            const filterSelector = document.getElementById(selectorId)
            const optionElement = [...filterSelector.children].find((element)=>Number(element.value) === filterIndex)
            optionElement.innerText = name
        }
    }

    #removeOptionNameFromFilterSelectors(filterIndex) {
        for (const selectorId of this.filterSelectors) {
            const filterSelector = document.getElementById(selectorId)
            const optionElements = [...filterSelector.children]
            const optionElement = optionElements.find((element)=>Number(element.value) === filterIndex)
            optionElement.outerHTML = ""

            const optionsToBeShifted = optionElements.filter((x)=>x.value>filterIndex)
            optionsToBeShifted.forEach((x)=>x.value-=1)
        }
    }

    #setFilterIndexes(filters=this.getFiltersOfCollection()) {
        return filters.map((filter, realIndex)=>filter.index = realIndex)
    }

    addOptionElement(elementId) {
        this.filterSelectors.push(elementId)
    }

    removeOptionElement(elementId) {
        this.filterSelectors = this.filterSelectors.filter((x)=>x===elementId)
    }

    removeFilter(filterIndex) {
        let currentFilters = this.getFiltersOfCollection()
        currentFilters.splice(filterIndex,1)
        //const optionsToBeShifted = this.filtes.filter((x)=>x.index>=filterIndex)
        this.#removeOptionNameFromFilterSelectors(filterIndex)
        let filters = this.getFiltersOfCollection()
        filters = this.#setFilterIndexes(filters)
    }


    changeCurrentFilter(index) {
        console.log("changing to ", index)
        const currentFilter = this.getFiltersOfCollection()[index]
        document.getElementById("filterSelectorInput").value = index
        document.getElementById("filterNameInput").value = currentFilter.filterName
        document.getElementById("filterTypeSelectorInput").value = currentFilter.type
        this.currentFilterIndex = index

        this.#updateAllFilterTotalsUi()
        this.#updateInputsDropdowns()
        const selectedDataType = document.getElementById("inputTypeSelecterInput").value
        this.#setInputTypeHandler({"target":{"value":selectedDataType}})

        this.#onFilterChange()
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
       this.getFilter(index).type = type
        //TODO filter type formatting???
    }

    changeFilterName(name, index=this.currentFilterIndex) {
        if (name) {
           this.getFilter(index).filterName = name
           this.#updateOptionNameFromFilterSelectors(name, index)
        } else {
            //name cant be empty
            name = this.getFilter(index).filterName
            document.getElementById("filterNameInput").value =this.getFilter(index).filterName

        }
        
    }

    #filterTypeHandler(event) {
        const type =  event.target.value
        this.changeFilterType(type)
        this.#onFilterChange()
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

        const attributeIndex =this.getFilter(filterIndex)[inputType].attributes.findIndex((x)=>(x.trait_type === trait_type && x.value === value))
        if (attributeIndex===-1) {
           this.getFilter(filterIndex)[inputType].attributes.push(attribute)

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
       this.getFilter(filterIndex)[inputType].attributes =this.getFilter(filterIndex)[inputType].attributes.filter((x)=>!(x.trait_type === trait_type && x.value === value))

        const itemIdentifier = this.#getItemIdentifier(dataType,attribute)
        const attributeInputcheckBox = document.getElementById(`filterInput-checkbox-${itemIdentifier}`)
        attributeInputcheckBox.checked = false
    }

    #removeInterger(interger, filterIndex = this.currentFilterIndex, inputTarget=undefined) {
        if (!inputTarget) {
            inputTarget = this.#getCurrentInputTarget()
        } 
        const {inputType, dataType} = inputTarget 
       this.getFilter(filterIndex)[inputType][dataType] = this.getFilter(filterIndex)[inputType][dataType].filter((x)=>x===interger)

        // const itemIdentifier = this.#getItemIdentifier(dataType,interger)
        // const itemInputcheckBox = document.getElementById(`filterInput-checkbox-${itemIdentifier}`)
        // itemInputcheckBox.checked = false
    }

    #addInterger(interger, filterIndex = this.currentFilterIndex, inputTarget=undefined) {
        if (!inputTarget) {
            inputTarget = this.#getCurrentInputTarget()
        } 
        const {inputType, dataType} = inputTarget 

        if (this.getFilter(filterIndex)[inputType][dataType].indexOf(interger) === -1) {
            this.getFilter(filterIndex)[inputType][dataType].push(interger)
            return true
        } else {
            return false
        }
        
    }

    #addFilterToInputs(filter, filterIndex = this.currentFilterIndex, inputTarget=undefined) {
        if (!inputTarget) {
            inputTarget = this.#getCurrentInputTarget()
        } 
        const {inputType, dataType} = inputTarget 

        const indexOfFilter = this.getFilter(filterIndex)[inputType][dataType].findIndex((x)=>x.index === filter.index)
        if (indexOfFilter === -1) {
            this.getFilter(filterIndex)[inputType][dataType].push(filter)
            return true
        } else {
            return false
        }
    }

    #removeFilterFromInputs(filter, filterIndex = this.currentFilterIndex, inputTarget=undefined) {
        if (!inputTarget) {
            inputTarget = this.#getCurrentInputTarget()
        } 
        const {inputType, dataType} = inputTarget 

        this.getFilter(filterIndex)[inputType][dataType] = this.getFilter(filterIndex)[inputType][dataType].filter((x)=>x.index===filter.index)
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
        //dont trigger on anything other then enter or add button press
        if ((event.key!=="Enter" && event.key!==undefined)) {
            return false
        }
        const attributeCheckBox =  this.#createAttributeCheckBox(await this.getIdsPerAttribute(),traitType,attribute)
        const identifier = this.#getItemIdentifier("attributes", {"trait_type":traitType, "value":attribute})
        const wrapperId = `filterInput-wrapper-${identifier}`

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
        this.addItemToFilter( this.getFilter(selector.value), inputTarget, this.currentFilterIndex) //;(this.filters[selector.value], this.currentFilterIndex, {inputType, dataType} )
        //this.#updateFilterTotalsUi(inputType, dataType)
    }

    #addAllFilterOptionsToSelector({selector, skipSelf = false}) {
        const addNewOption = [...selector.children].find((x)=>x.value==="-1")
        this.getFiltersOfCollection().forEach((filter)=> {
            //prevent inputing a filter into it self
    
            if (!skipSelf || filter.index !== this.currentFilterIndex) {
                const option = document.createElement("option")
                option.value = filter.index
                option.innerText = filter.filterName
                if (addNewOption) {
                    selector.insertBefore(option, addNewOption)
                } else {
                    selector.append(option)
                }
               
            }

        })
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

        this.#addAllFilterOptionsToSelector({selector:selector, skipSelf:true})

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