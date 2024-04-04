import { ERC721ABI } from "../../abi/ERC721ABI.js"
import { ethers } from "../../scripts/ethers-6.7.0.min.js"
import { FilterBuilder } from "./FilterBuilder.js"
import { DropBuilder } from "./DropBuilder.js"
const ERC721InterFaceId = "0x01ffc9a7"

export const criterionFormat = {"name":"", "amountPerItem":"", "ids":[],"excludedIds":[], "selectedFilter":{}, "collectionAddress":undefined}       

export class CriteriaBuilder {
    ipfsGateway
    provider
    nftDisplayElement
    filterBuilder

    criteria = []
    criterionFormat = {"name":"", "amountPerItem":"", "ids":[],"excludedIds":[], "selectedFilter":{}, "collectionAddress":undefined}       
    currentCriterionIndex = 0

    contractInput = "nftContractAddressInput"
    submitContractId = "submitNftContract"

    amountInputId = "amountPerNftInput"
    submitAmountId = "submitAmountPerNft"

    criteriaNameInputId = "criteriaNameInput"
    //submitCriterionNameId = "submitCriterionName"

    criteriaSelectorId = "criteriaSelectorInput"
    deleteCriterionId = "deleteCriterion"

    filterSelectorId = "criteriaFilterSelectorInput"

    nextButton = document.getElementById("finalizeDropButton")


    criteriaMade = 0

    constructor({ipfsGateway, provider, nftDisplayElement, collectionAddress=undefined}) {
        this.ipfsGateway = ipfsGateway
        this.provider = provider
        this.nftDisplayElement = nftDisplayElement


        document.getElementById(this.contractInput).addEventListener("keypress", (event)=>this.#setCollectionAddressHandler(event ,this.contractInput))
        document.getElementById(this.submitContractId).addEventListener(("click"), (event)=>this.#setCollectionAddressHandler(event, this.contractInput))

        //TODO set this to set on everychange instead of only on enter press
        document.getElementById(this.amountInputId).addEventListener("change", (event)=>this.#setAmountPerItemHandler(event, this.amountInputId))
        document.getElementById(this.submitAmountId).addEventListener(("click"), (event)=>this.#setAmountPerItemHandler(event, this.amountInputId))

        document.getElementById(this.criteriaNameInputId).addEventListener("keypress", (event)=>this.#setCriterionNameHandler(event, this.criteriaNameInputId))
        //document.getElementById(this.submitCriterionNameId).addEventListener(("click"), (event)=>this.#setCriterionNameHandler(event, this.criteriaNameInputId))

        document.getElementById(this.criteriaSelectorId).addEventListener("change", (event)=>this.#criteriaSelectorHandler(event))
        document.getElementById(this.filterSelectorId).addEventListener("change", (event)=>this.#filterSelectorHandler(event))

        document.getElementById(this.deleteCriterionId).addEventListener("click",  (event)=>this.#deleteCriterionHandler(event))

        this.initializeUi(collectionAddress)

    
    }


    async initializeUi(collectionAddress=this.collectionAddress) {
        this.filterBuilder = await this.#createNewFilterBuilder(collectionAddress)
        await this.createCriterion(collectionAddress)
    }

    #onFilterChange(filter, ids) {
        for (const criterion of this.criteria) {
            if ("index" in criterion) {
                if (criterion.selectedFilter === filter) {
                    criterion.ids = ids
                    criterion.selectedFilter.index
                } else {
                    const allFilters = this.filterBuilder.filtersPerCollection[criterion.collectionAddress]
                    if (allFilters.indexOf(criterion.selectedFilter)===-1) {
                        //if the filter isnt in there then we know it's removed
                        criterion.selectedFilter = {}
                        if(this.currentCriterionIndex === criterion.index) {
                            document.getElementById(this.filterSelectorId).value = "-1"
                        }
                        
                    }
    
                }
            }    
        }
    }

    async #deleteCriterionHandler(event) {

        const indexToRemove = this.currentCriterionIndex

        //collection address is inside the criterion that is being deleted
        const currentCollection = this.getCurrentCollectionAddress()
        await this.removeCriterionByIndex(indexToRemove)
    

    
    }

    async #filterSelectorHandler(event) {
        const value = Number(event.target.value)
        const currentCriterion = this.getCurrentCriterion()
        await this.selectFilterForCriterion(value, this.getCurrentCriterion())
        
        //run filter
        const resultIdSet = await (await this.filterBuilder.getNftMetaData(currentCriterion.collectionAddress)).processFilter(currentCriterion.selectedFilter)
        const ids  = [...resultIdSet]

        await this.#onFilterChange(currentCriterion.selectedFilter, ids)
        
    }

    async selectFilterForCriterion(filterIndex, criterion = this.getCurrentCriterion(), updateUi=true) {
        if(filterIndex>=0) {
            const filter = this.filterBuilder.getFiltersOfCollection()[filterIndex]
            criterion.selectedFilter = filter
            document.getElementById(this.filterSelectorId).value = filterIndex
            await this.filterBuilder.changeCurrentFilter(filterIndex, updateUi)
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
        if ((event.key!=="Enter" && event.key!==undefined || value===undefined)) {
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
        const value =  document.getElementById(inputId).value//this.#isValidSubmitEvent(event, inputId)
        const criterion = this.getCurrentCriterion()
        if (value==="0") {
            document.getElementById(this.amountInputId).value = criterion.amountPerItem
            return false
        }
        if (value) {

        
            criterion.amountPerItem = value



        } else {
            //document.getElementById(this.amountInputId).value = criterion.amountPerItem
            return false

        }
    }

    async isContract(address) {
        return "0x" !== (await this.provider.getCode(address))

    }

    async isAddress(address) {

    }


    async isERC721(address) {
        //TODO move this to NftMetadataCollector)

        if(ethers.isAddress(address) && await this.isContract(address)) {
            const contract = new ethers.Contract(address, ERC721ABI, this.provider)
            try {
                return await contract.supportsInterface(ERC721InterFaceId)

            } catch (error) {
                console.log(`couldnt get contract ${address} from chain`)
                console.warn(error)
                return false
            }

        } else {
            return false
        }
        

        
        }

    


    async #setCollectionAddressHandler(event, inputId) {
        await DropBuilder.switchNetwork()
        const value = this.#isValidSubmitEvent(event, inputId)
        //TODO check if nft contract
        if(value){
            if (await this.isERC721(value)) {
                await this.setCollectionAddress(value)
            } else {
                console.log("TODO inform user its not a erc721 contract")
                document.getElementById(inputId).value = ""
            }
           
        } 

    }

    

    async setCollectionAddress(collectionAddress,criterionIndex=this.currentCriterionIndex, updateUi=true){
        collectionAddress = this.#handleAddressUserInput(collectionAddress)
        const criterion = this.criteria[criterionIndex]
        const oldCollectionAddress = criterion.collectionAddress

        //check if filterbuilder needs to be updated
        if (collectionAddress !== this.filterBuilder.currentCollection) {
            await this.#setCollectionFilterBuilder(collectionAddress, updateUi)  //calls nftMetadat

        } else {
            console.info("filterBuilder was set to the same collection address")
        }

        //check if collection is being set to none / input wrong
        if (collectionAddress) {
            criterion.collectionAddress = collectionAddress
            document.getElementById(this.contractInput).value = collectionAddress

        } else {
            criterion.collectionAddress = undefined
            document.getElementById(this.contractInput).value = ""
        }

        //check if a new filter need to be created
        if (collectionAddress !== oldCollectionAddress || (!("index" in criterion.selectedFilter)) ) {
            const newFilter = this.filterBuilder.createNewFilter("AND")
            await this.selectFilterForCriterion(newFilter.index, criterion, updateUi) //creates display //calls nftMetadat
        }

        await this.updateCriterionName(criterionIndex) //calls nftMetadat
        this.#toggleNextButton()
        
    }

    #toggleNextButton() {
        const allCriterionAreValid = !Boolean(this.criteria.find((criterion)=>!this.isERC721(criterion.collectionAddress) || !criterion.collectionAddress ) )
        if (allCriterionAreValid) {
            this.nextButton.disabled = false
            this.nextButton.title = "Go to overview of all criteria (you can go back and make changes)"
        } else {
            this.nextButton.disabled = true
        }

    }

    getCurrentCollectionAddress() {
        return this.getCurrentCriterion().collectionAddress
        
    }

    async #setCollectionFilterBuilder(address, updateUi=true) {
        
        if (this.filterBuilder) {
            if (this.filterBuilder.collectionAddress !== address) {
                await this.filterBuilder.setCollectionAddress(address, updateUi)
            }
           
        } else {
            this.filterBuilder = await this.#createNewFilterBuilder(address, updateUi)
        }

    }

    async #createNewFilterBuilder(collectionAddress, updateUi=true) {
        const filterBuilder = new FilterBuilder({
            collectionAddress: collectionAddress,
            provider: this.provider,
            ipfsGateway: this.ipfsGateway,
            displayElement: this.nftDisplayElement,
            filterSelectors: [this.filterSelectorId]
        })
        await filterBuilder.getAllExtraMetaData()
        const updateCriteriaIds = (filter, ids)=>this.#onFilterChange(filter, ids)
        filterBuilder.addOnFilterChangeFunc(updateCriteriaIds)
        return filterBuilder

    }


    #handleAddressUserInput(address) {
        if(address){
            if(ethers.isAddress(address)) {
                return ethers.getAddress(address) 
            } else {
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
                const filterBuilder = await this.filterBuilder.getNftMetaData(criterion.collectionAddress)
                collectionName = await filterBuilder.getContractName()
                
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
        
        newCriterion.name =  `Criterion#${this.criteriaMade}`
        //newCriterion.amountPerItem = "0"
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

        await this.setCollectionAddress(collectionAddress,newCriterionIndex, true) //creates dispay
        await this.changeCurrentCriterion(newCriterionIndex) //creates display
        

        

        return newCriterion
    }

    async changeCurrentCriterion(index) {
        let oldCollectionAddress
        if (this.criteria[this.currentCriterionIndex]) {
            oldCollectionAddress =  this.criteria[this.currentCriterionIndex].collectionAddress

        } else {
            oldCollectionAddress = ""
        }
        
        const newCollectionAddress = this.criteria[index].collectionAddress
        const currentCriterion = this.criteria[index]
        this.currentCriterionIndex = index

   

        if (oldCollectionAddress !== newCollectionAddress) {
            document.getElementById(this.contractInput).value = newCollectionAddress
            document.getElementById(this.criteriaSelectorId).value = index
            await this.setCollectionAddress(newCollectionAddress) ///////////////////////////////////
        }



        const criteriaNameInput = document.getElementById(this.criteriaNameInputId)
        criteriaNameInput.value = currentCriterion.name
        const criteriaSelector = document.getElementById(this.criteriaSelectorId)
        criteriaSelector.value = index
        const amountInput = document.getElementById(this.amountInputId)
        amountInput.value = currentCriterion.amountPerItem

        const filterSelector = document.getElementById(this.filterSelectorId)
        if ("index" in currentCriterion.selectedFilter) {
            await this.filterBuilder.changeCurrentFilter(currentCriterion.selectedFilter.index) //create display
            filterSelector.value = currentCriterion.selectedFilter.index

        } else {
            await this.filterBuilder.changeCurrentFilter(0)
            filterSelector.value = "-1"

        }   
    }

    #setCriteriaIndexes(criteria) {
        return criteria.map((criterion, realIndex)=>criterion.index = realIndex)
    }

    async removeCriterionByIndex(criterionIndex=this.currentCriterionIndex ,collectionAddress=this.getCurrentCollectionAddress()) {
        const currentCollectionAddress = this.getCurrentCollectionAddress()
        //prevent no criterion being left / selected
        if(this.criteria.length===1) {
            const newCriterion = await this.createCriterion(collectionAddress)
        }

        this.criteria.splice(criterionIndex, 1)
        this.#setCriteriaIndexes(this.criteria)
        this.#removeOptionCriteriaSelector(criterionIndex) 
        // //only update ui if collection address is selected
        // if (collectionAddress===currentCollectionAddress) {
        //     this.#removeOptionCriteriaSelector(criterionIndex) 
        
           
        // }

        const newIndex = this.criteria.length-1
        await this.changeCurrentCriterion(newIndex)



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

    async cleanupCriteria() {

        //this.criteriaBuilder.criteria.filter((criterion)=>ethers.getAddress(criterion.collectionAddress))
        
        //set all criterion with no amountPerItem to 0
        for (const criterion of this.criteria) {
            if (!this.isERC721(criterion.collectionAddress) || !criterion.collectionAddress) {
                await this.removeCriterionByIndex(criterion.index)
            } else if (isNaN(criterion.amountPerItem) || criterion.amountPerItem === "") {
                criterion.amountPerItem = "0"
            }
        }
    }

}