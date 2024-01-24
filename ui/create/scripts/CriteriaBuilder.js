import { ethers } from "../../scripts/ethers-5.2.esm.min.js"
import { FilterBuilder } from "./FilterBuilder.js"

export const criterionFormat = {"name":"", "amountPerItem":"", "ids":[],"excludedIds":[], "selectedFilter":{}, "collectionAddress":"0x0"}       

export class CriteriaBuilder {
    ipfsGateway
    provider
    nftDisplayElementId
    filterBuilder

    criteria = []
    criterionFormat = {"name":"", "amountPerItem":"", "ids":[],"excludedIds":[], "selectedFilter":{}, "collectionAddress":"0x0"}       
    currentCriterionIndex = 0

    contractInput = "nftContractAddressInput"
    submitContractId = "submitNftContract"

    amountInputId = "amountPerNftInput"
    submitAmountId = "submitAmountPerNft"

    criteriaNameInputId = "criteriaNameInput"
    submitCriterionNameId = "submitCriterionName"

    criteriaSelectorId = "criteriaSelectorInput"
    deleteCriterionId = "deleteCriterion"

    filterSelectorId = "criteriaFilterSelectorInput"


    criteriaMade = 0

    constructor({ipfsGateway, provider, nftDisplayElementId, collectionAddress=undefined}) {
        this.ipfsGateway = ipfsGateway
        this.provider = provider
        this.nftDisplayElementId = nftDisplayElementId


        document.getElementById(this.contractInput).addEventListener("keypress", (event)=>this.#setCollectionAddressHandler(event ,this.contractInput))
        document.getElementById(this.submitContractId).addEventListener(("click"), (event)=>this.#setCollectionAddressHandler(event, this.contractInput))

        document.getElementById(this.amountInputId).addEventListener("keypress", (event)=>this.#setAmountPerItemHandler(event, this.amountInputId))
        document.getElementById(this.submitAmountId).addEventListener(("click"), (event)=>this.#setAmountPerItemHandler(event, this.amountInputId))

        document.getElementById(this.criteriaNameInputId).addEventListener("keypress", (event)=>this.#setCriterionNameHandler(event, this.criteriaNameInputId))
        document.getElementById(this.submitCriterionNameId).addEventListener(("click"), (event)=>this.#setCriterionNameHandler(event, this.criteriaNameInputId))

        document.getElementById(this.criteriaSelectorId).addEventListener("change", (event)=>this.#criteriaSelectorHandler(event))
        document.getElementById(this.filterSelectorId).addEventListener("change", (event)=>this.#filterSelectorHandler(event))

        document.getElementById(this.deleteCriterionId).addEventListener("click",  (event)=>this.#deleteCriterionHandler(event))

        this.initializeUi(collectionAddress)

    
    }


    async initializeUi(collectionAddress=this.collectionAddress) {
        await this.createCriterion(collectionAddress)
    }

    #onFilterChange(filter, ids) {
        console.log(filter)
        for (const criterion of this.criteria) {
            console.log(criterion)
            if (criterion.selectedFilter === filter) {
                console.log(ids)
                criterion.ids = ids
            }
        }
    }

    #deleteCriterionHandler(event) {
        const indexToRemove = this.currentCriterionIndex

        //collection address is inside the criterion that is being deleted
        const currentCollection = this.getCurrentCollectionAddress()
        this.removeCriterionByIndex(indexToRemove)
        
        //prevent no criterion being left / selected
        if(this.criteria.length===0) {
            this.createCriterion(currentCollection)
            this.currentCriterionIndex = this.criteria.length
        } else {
            this.changeCurrentCriterion(this.criteria.length-1)
        }
    
    }

    async #filterSelectorHandler(event) {
        const value = Number(event.target.value)
        console.log(value)
        const currentCriterion = this.getCurrentCriterion()
        this.selectFilterForCriterion(value, this.getCurrentCriterion())
        
        //run filter
        const resultIdSet = await this.filterBuilder.nftMetaData.processFilter(currentCriterion.selectedFilter)
        const ids  = [...resultIdSet]

        this.#onFilterChange(currentCriterion.selectedFilter, ids)
    }

    selectFilterForCriterion(filterIndex, criterion = this.getCurrentCriterion()) {
        if(filterIndex>=0) {
            const filter = this.filterBuilder.getFiltersOfCollection()[filterIndex]
            criterion.selectedFilter = filter
            document.getElementById(this.filterSelectorId).value = filterIndex
            console.log(criterion)
            console.log(filter)
        } else {
            criterion.selectedFilter = {}
        }

    }

    #criteriaSelectorHandler(event) {
        const value = Number(event.target.value)
        if (value === -1) {
            const currentCollection = this.getCurrentCollectionAddress()
            
            this.createCriterion(currentCollection)
        } else {
            this.changeCurrentCriterion(value)
        }

    }

    #isValidSubmitEvent(event, inputId) {
        const value = document.getElementById(inputId).value
        console.log(value)
        if ((event.key!=="Enter" && event.key!==undefined && value!==undefined)) {
            return false
        }else {
            return value
        }
    }

    #setCriterionNameHandler(event, inputId) {
        const value =  this.#isValidSubmitEvent(event, inputId)
        if (value) {
            this.updateCriterionName(this.currentCriterionIndex, value)
        } else {
            return false
        }
    }

    #setAmountPerItemHandler(event ,inputId) {
        const value =  this.#isValidSubmitEvent(event, inputId)
        if (value) {
            const criterion = this.getCurrentCriterion()
            // value stays as string for accuracy
            criterion.amountPerItem = value


        } else {
            return false

        }
    }

    #setCollectionAddressHandler(event, inputId) {
        console.log(event)
        const value = this.#isValidSubmitEvent(event, inputId)
        console.log(value)
        this.setCollectionAddress(value)
    }

    setCollectionAddress(collectionAddress){
        collectionAddress = this.#handleAddressUserInput(collectionAddress)
        const criterion = this.getCurrentCriterion()
        if (collectionAddress) {
            this.#setCollectionFilterBuilder(collectionAddress) 
            criterion.collectionAddress = collectionAddress
        } else {
            criterion.collectionAddress = ""
        }
        console.log(collectionAddress)
    
        criterion.collectionAddress = collectionAddress
        this.updateCriterionName()
        document.getElementById(this.contractInput).value = collectionAddress
        const filterSelector = document.getElementById(this.filterSelectorId)
        filterSelector.value = "-1"
    }

    getCurrentCollectionAddress() {
        return this.getCurrentCriterion().collectionAddress
        
    }

    #setCollectionFilterBuilder(address) {
        
        if (this.filterBuilder) {
            if (this.filterBuilder.collectionAddress !== address) {
                this.filterBuilder.setCollectionAddress(address)

            }
           
        } else {
            this.filterBuilder = this.#createNewFilterBuilder(address)
        }

    }

    #createNewFilterBuilder(collectionAddress) {
        const filterBuilder = new FilterBuilder({
            collectionAddress: collectionAddress,
            provider: this.provider,
            ipfsGateway: this.ipfsGateway,
            displayElementId: this.nftDisplayElementId,
            filterSelectors: [this.filterSelectorId]
        })
        const updateCriteriaIds = (filter, ids)=>this.#onFilterChange(filter, ids)
        filterBuilder.addOnFilterChangeFunc(updateCriteriaIds)
        return filterBuilder

    }


    #handleAddressUserInput(address) {
        
        if(address) {
            try {
                return ethers.utils.getAddress(address) 
            } catch (error) {
                console.warn(`${address} is not an address TODO warn user"`)
                console.warn(error)
                return false    
            }
        } else {
            console.warn("no collection address provided")
            return ""
        }


    }


    getCurrentCriterion() {
        return this.criteria[this.currentCriterionIndex]
    }

    setAmountPerItem(amount, criterionIndex=this.getCurrentCriterion()) {
        const criterion = this.criteria[criterionIndex]
        criterion.amountPerItem = amount
        document.getElementById(this.amountInputId).value = amount
    }


    async #getCriterionOptionName(criterion) {
        let collectionName
        if (criterion.collectionAddress) {
            try {
                collectionName = await this.filterBuilder.nftMetaData.getContractName()
                
            } catch (error) {
                collectionName = "ErrNoCollectionName"
                console.warn(`couldn't get collection name of: ${criterion.collectionAddress}`)
            }
            
        } else {
            collectionName = "NoCollectionSet"
        }
    
        return  `${criterion.name}-${collectionName}` 
    }

    async updateCriterionName(criterionIndex=this.currentCriterionIndex, newName=undefined) {
        const criterion = this.criteria[criterionIndex]
        
        if (newName) {
            criterion.name = `${newName}`
        }
        const criteriaSelector = document.getElementById(this.criteriaSelectorId)
        const criterionOptionElement = [...criteriaSelector.children].find((x)=>x.value===criterionIndex.toString())
        criterionOptionElement.innerText = await    this.#getCriterionOptionName(criterion)
        const criteriaNameInput = document.getElementById(this.criteriaNameInputId)
        criteriaNameInput.value = criterion.name
        

        
    }

    async createCriterion(collectionAddress) {
        //create new criterion
        const newCriterion = structuredClone(this.criterionFormat)
        const newCriterionIndex = this.criteria.length
        newCriterion.index = newCriterionIndex
        this.currentCriterionIndex = newCriterionIndex
        this.criteriaMade += 1
        
        newCriterion.name =  `NewCriterion#${this.criteriaMade}`
        //newCriterion.collectionAddress = collectionAddress
        newCriterion.selectedFilter = {}
        this.criteria.push(newCriterion)

        
        //add option to selector
        const criteriaSelector = document.getElementById(this.criteriaSelectorId)
        const addNewOption = [...criteriaSelector.children].find((x)=>x.value==="-1")
        const newCriterionOption = document.createElement("option")
        newCriterionOption.innerText = await this.#getCriterionOptionName(newCriterion)
        newCriterionOption.value = newCriterionIndex
        criteriaSelector.insertBefore(newCriterionOption, addNewOption)

        this.changeCurrentCriterion(newCriterionIndex)

        this.setCollectionAddress(collectionAddress)

        return newCriterion
    }

    changeCurrentCriterion(index) {
        this.currentCriterionIndex = index
        const currentCollection = this.getCurrentCollectionAddress()
        console.log(this.criteria, index)
        const currentCriterion = this.criteria[index]
        if (currentCollection) {
            document.getElementById(this.contractInput).value = currentCollection
            document.getElementById(this.criteriaSelectorId).value = index
            this.setCollectionAddress(currentCollection)
        }


        const criteriaNameInput = document.getElementById(this.criteriaNameInputId)
        console.log(currentCriterion.name)
        criteriaNameInput.value = currentCriterion.name
        const criteriaSelector = document.getElementById(this.criteriaSelectorId)
        criteriaSelector.value = index
        console.log(currentCriterion)
        const amountInput = document.getElementById(this.amountInputId)
        amountInput.value = currentCriterion.amountPerItem
        console.log("aaaaaaddddddddddd", currentCriterion.amountPerItem)

        const filterSelector = document.getElementById(this.filterSelectorId)
        console.log(currentCriterion)
        if ("index" in currentCriterion.selectedFilter) {
            filterSelector.value = currentCriterion.selectedFilter.index

        } else {
            filterSelector.value = "-1"
        }

        
    }

    #setCriteriaIndexes(criteria) {
        console.log(criteria)
        console.log(criteria.map((criterion, realIndex)=>criterion.index = realIndex))
        return criteria.map((criterion, realIndex)=>criterion.index = realIndex)
    }

    removeCriterionByIndex(criterionIndex=this.currentCriterionIndex) {
        this.criteria.splice(criterionIndex, 1)
        this.#removeOptionCriteriaSelector(criterionIndex) 
        if (criterionIndex === this.currentCriterionIndex){
            this.currentCriterionIndex = -1
        } 

        this.#setCriteriaIndexes(this.criteria)
    }

    #removeOptionCriteriaSelector(criterionIndex) {

        const selectorId = this.criteriaSelectorId
        const criterionSelector = document.getElementById(selectorId)
        const optionElements = [...criterionSelector.children]
        const optionElement = optionElements.find((element)=>Number(element.value) === criterionIndex)
        optionElement.outerHTML = ""

        const optionsToBeShifted = optionElements.filter((x)=>x.value>criterionIndex)
        optionsToBeShifted.forEach((x)=>x.value-=1)
    }

}