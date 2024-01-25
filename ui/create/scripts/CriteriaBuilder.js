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
        this.filterBuilder = this.#createNewFilterBuilder(collectionAddress)
        await this.createCriterion(collectionAddress)
    }

    #onFilterChange(filter, ids) {
        for (const criterion of this.criteria) {
            if ("index" in criterion) {
                if (criterion.selectedFilter === filter) {
                    criterion.ids = ids
                    criterion.selectedFilter.index
                } else {
                    const allFilters = this.filterBuilder.getFiltersOfCollection()
                    if (allFilters.indexOf(criterion.selectedFilter)===-1) {
                        //if the filter isnt in there then we know it's removed
                        criterion.selectedFilter = {}
                        document.getElementById(this.filterSelectorId).value = "-1"
                    }
    
                }
            }    
        }
    }

    async #deleteCriterionHandler(event) {

        const indexToRemove = this.currentCriterionIndex

        //collection address is inside the criterion that is being deleted
        const currentCollection = this.getCurrentCollectionAddress()
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
        await this.removeCriterionByIndex(indexToRemove)
    

    
    }

    async #filterSelectorHandler(event) {
        const value = Number(event.target.value)
        const currentCriterion = this.getCurrentCriterion()
        await this.selectFilterForCriterion(value, this.getCurrentCriterion())
        
        //run filter
        const resultIdSet = await this.filterBuilder.nftMetaData.processFilter(currentCriterion.selectedFilter)
        const ids  = [...resultIdSet]

        this.#onFilterChange(currentCriterion.selectedFilter, ids)
        
    }

    async selectFilterForCriterion(filterIndex, criterion = this.getCurrentCriterion()) {
        if(filterIndex>=0) {
            const filter = this.filterBuilder.getFiltersOfCollection()[filterIndex]
            criterion.selectedFilter = filter
            document.getElementById(this.filterSelectorId).value = filterIndex
            await this.filterBuilder.changeCurrentFilter(filterIndex)
        } else {
            criterion.selectedFilter = {}
        }

    }

    async #criteriaSelectorHandler(event) {
        const value = Number(event.target.value)
        if (value === -1) {
            const currentCollection = this.getCurrentCollectionAddress()
            
            await this.createCriterion(currentCollection)
        } else {
            await this.changeCurrentCriterion(value)
        }

    }

    #isValidSubmitEvent(event, inputId) {
        const value = document.getElementById(inputId).value
        //if ((event.key!=="Enter" && event.key!==undefined && value!==undefined)) {
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
        const criterion = this.getCurrentCriterion()
        if (value==="0") {
            document.getElementById(this.amountInputId).value = criterion.amountPerItem
            return false
        }
        if (value) {
            // value stays as string for accuracy
            criterion.amountPerItem = value

        } else {
            //document.getElementById(this.amountInputId).value = criterion.amountPerItem
            return false

        }
    }

    async #setCollectionAddressHandler(event, inputId) {
        const value = this.#isValidSubmitEvent(event, inputId)
        await this.setCollectionAddress(value)
    }

    async setCollectionAddress(collectionAddress){
        collectionAddress = this.#handleAddressUserInput(collectionAddress)
        const criterion = this.getCurrentCriterion()
        const oldCollectionAddress = criterion.collectionAddress
        if (collectionAddress === oldCollectionAddress) {
            console.info("criterion was set to the same collection address")
            return false
        } 


        if (collectionAddress) {
            await this.#setCollectionFilterBuilder(collectionAddress) 
            criterion.collectionAddress = collectionAddress
            document.getElementById(this.contractInput).value = collectionAddress

        } else {
            criterion.collectionAddress = ""
            document.getElementById(this.contractInput).value = ""
        }

        if (collectionAddress !== oldCollectionAddress || (!("index" in criterion.selectedFilter)) ) {
            const newFilter = this.filterBuilder.createNewFilter("AND")
            await this.selectFilterForCriterion(newFilter.index, criterion)
        }

        this.updateCriterionName()
        
    }

    getCurrentCollectionAddress() {
        return this.getCurrentCriterion().collectionAddress
        
    }

    async #setCollectionFilterBuilder(address) {
        
        if (this.filterBuilder) {
            if (this.filterBuilder.collectionAddress !== address) {
                await this.filterBuilder.setCollectionAddress(address)

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
        //TODO nftdisplay is recreated 3 times here at: selectFilterForCriterion, changeCurrentCriterion, setCollectionAddress
        //this somehow needs to be reduced to 1 times
        //maybe update display at their respective handlers but that might not be optimal

        //create new criterion
        const newCriterion = structuredClone(this.criterionFormat)
        const newCriterionIndex = this.criteria.length
        newCriterion.index = newCriterionIndex
        this.currentCriterionIndex = newCriterionIndex
        this.criteriaMade += 1
        
        newCriterion.name =  `NewCriterion#${this.criteriaMade}`
        //newCriterion.collectionAddress = collectionAddress
        this.criteria.push(newCriterion)

        //add Filter
        // const newFilter = this.filterBuilder.createNewFilter("AND")
        // await this.selectFilterForCriterion(newFilter.index, newCriterion)


        
        //add option to selector
        const criteriaSelector = document.getElementById(this.criteriaSelectorId)
        const addNewOption = [...criteriaSelector.children].find((x)=>x.value==="-1")
        const newCriterionOption = document.createElement("option")
        newCriterionOption.innerText = await this.#getCriterionOptionName(newCriterion)
        newCriterionOption.value = newCriterionIndex
        criteriaSelector.insertBefore(newCriterionOption, addNewOption)

        await this.setCollectionAddress(collectionAddress)
        await this.changeCurrentCriterion(newCriterionIndex)

        

        return newCriterion
    }

    async changeCurrentCriterion(index) {
        const oldCollectionAddress =  this.criteria[index].collectionAddress
        const currentCriterion = this.criteria[index]
        this.currentCriterionIndex = index
        const newCollectionAddress = currentCriterion.collectionAddress

        if (oldCollectionAddress !== newCollectionAddress) {
            document.getElementById(this.contractInput).value = newCollectionAddress
            document.getElementById(this.criteriaSelectorId).value = index
            await this.setCollectionAddress(newCollectionAddress)
        }


        const criteriaNameInput = document.getElementById(this.criteriaNameInputId)
        criteriaNameInput.value = currentCriterion.name
        const criteriaSelector = document.getElementById(this.criteriaSelectorId)
        criteriaSelector.value = index
        const amountInput = document.getElementById(this.amountInputId)
        amountInput.value = currentCriterion.amountPerItem

        const filterSelector = document.getElementById(this.filterSelectorId)
        if ("index" in currentCriterion.selectedFilter) {
            filterSelector.value = currentCriterion.selectedFilter.index
            await this.filterBuilder.changeCurrentFilter(currentCriterion.selectedFilter.index)

        } else {
            filterSelector.value = "-1"
            await this.filterBuilder.changeCurrentFilter(0)

        }

        
    }

    #setCriteriaIndexes(criteria) {
        return criteria.map((criterion, realIndex)=>criterion.index = realIndex)
    }

    async removeCriterionByIndex(criterionIndex=this.currentCriterionIndex) {
        //prevent no criterion being left / selected
        if(this.criteria.length===1) {
            console.log("kaner",this.currentCriterionIndex)
            const currentCollection = this.getCurrentCollectionAddress()
            const newCriterion = await this.createCriterion(currentCollection)
        }

        this.criteria.splice(criterionIndex, 1)
        this.#removeOptionCriteriaSelector(criterionIndex) 
        this.#setCriteriaIndexes(this.criteria)
        await this.changeCurrentCriterion(this.criteria.length-1)
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