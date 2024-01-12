import { ethers } from "../../scripts/ethers-5.2.esm.min.js"
import { FilterBuilder } from "./FilterBuilder.js"

export class CriteriaBuilder {
    ipfsGateway
    provider
    nftDisplayElementId
    filterBuilder

    criteria = []
    criterionFormat = {"name":"", "amountPerItem":"", "ids":[], "selectedFilter":{}, "collectionAddress":"0x0"}       
    currentCriterionIndex = 0

    contractInput = "nftContractAddressInput"
    submitContractId = "submitNftContract"

    amountInputId = "amountPerNftInput"
    submitAmountId = "submitAmountPerNft"

    filterSelectorId = "criteriaFilterSelectorInput"
    criteriaSelectorId = "criteriaselectorInput"

    criteriaMade = 0

    constructor({ipfsGateway, provider, nftDisplayElementId, collectionAddress=undefined}) {
        this.ipfsGateway = ipfsGateway
        this.provider = provider
        this.nftDisplayElementId = nftDisplayElementId


        document.getElementById(this.contractInput).addEventListener("keypress", (event)=>this.#setCollectionAddressHandler(event))
        document.getElementById(this.submitContractId).addEventListener(("click"), (event)=>this.#setCollectionAddressHandler(event))

        document.getElementById(this.amountInputId).addEventListener("keypress", (event)=>this.#setAmountPerItemHandler(event))
        document.getElementById(this.submitAmountId).addEventListener(("click"), (event)=>this.#setAmountPerItemHandler(event))

        this.initializeUi(collectionAddress)

    
    }

    async initializeUi(collectionAddress=this.collectionAddress) {
        await this.createCriterion(collectionAddress)
        this.setCollectionAddress(collectionAddress)
    }

    #setCollectionAddressHandler(event) {
        const value = document.getElementById(this.contractInput).value
        if ((event.key!=="Enter" && event.key!==undefined && value!==undefined)) {
            return false
        }
        this.setCollectionAddress(value)
    }

    setCollectionAddress(collectionAddress){
        collectionAddress = this.#handleAddressUserInput(collectionAddress)
        if (collectionAddress) {
            this.#setCollectionFilterBuilder(collectionAddress)

            const criterion = this.getCurrentCriterion()
            criterion.collectionAddress = collectionAddress
            this.#updateCriterionName()
        }
    }

    getCurrentCollectionAddress() {
        return this.getCurrentCriterion().collectionAddress
        
    }

    #setCollectionFilterBuilder(address) {
        if (this.filterBuilder) {
            this.filterBuilder.setCollectionAddress(address)
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
            return false
        }


    }


    getCurrentCriterion() {
        return this.criteria[this.currentCriterionIndex]
    }

    setAmountPerItem(amount, criterionIndex=this.getCurrentCriterion()) {
        const criterion = this.criteria[criterionIndex]
        criterion.amountPerItem = amount
    }

    #setAmountPerItemHandler(event) {
        const value = document.getElementById(this.amountInputId).value
        if ((event.key!=="Enter" && event.key!==undefined && value!==undefined)) {
            return false
        } else {
            const criterion = this.getCurrentCriterion()
            // value stays as string for accuracy
            criterion.amountPerItem = value
            console.log(value)
        }
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

    async #updateCriterionName(criterionIndex=this.currentCriterionIndex, newName=undefined) {
        console.log("updating nameaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
        const criterion = this.criteria[criterionIndex]
        
        if (newName) {
            criterion.name = `${newName}`
        }
        const criteriaSelector = document.getElementById(this.criteriaSelectorId)
        const criterionOptionElement = [...criteriaSelector.children].find((x)=>x.value===criterionIndex.toString())
        criterionOptionElement.innerText = await    this.#getCriterionOptionName(criterion)

        
    }

    async createCriterion(collectionAddress) {
        this.setCollectionAddress(collectionAddress)
        const newCriterion = structuredClone(this.criterionFormat)
        const newCriterionIndex = this.criteria.length
        this.criteriaMade += 1
        
        newCriterion.name =  `NewCriterion#${this.criteriaMade}`
        newCriterion.collectionAddress = collectionAddress
        this.criteria.push(newCriterion)

        const criteriaSelector = document.getElementById(this.criteriaSelectorId)
        const addNewOption = [...criteriaSelector.children].find((x)=>x.value==="-1")

        const newCriterionOption = document.createElement("option")
        newCriterionOption.innerText = await this.#getCriterionOptionName(newCriterion)
        newCriterionOption.value = newCriterionIndex

        criteriaSelector.insertBefore(newCriterionOption, addNewOption)
        criteriaSelector.value = newCriterionIndex
    }
}