import { ethers } from "../../scripts/ethers-5.2.esm.min.js"
import { FilterBuilder } from "./FilterBuilder.js"

export class CriteriaBuilder {
    ipfsGateway
    provider
    nftDisplayElementId
    filterBuilder

    criteria = []
    criterionFormat = {"name":"", "amountPerItem":0, "ids":[], "selectedFilter":{}, "collectionAddress":"0x0"}       
    currentCriterionIndex = 0
    filterSelectorId = "criteriaFilterSelectorInput"

    constructor({ipfsGateway, provider, nftDisplayElementId, collectionAddress=undefined}) {
        this.ipfsGateway = ipfsGateway
        this.provider = provider
        this.nftDisplayElementId = nftDisplayElementId
        this.setCollectionAddress(collectionAddress)


        document.getElementById("nftContractAddressInput").addEventListener("keypress", (event)=>this.#setCollectionAddressHandler(event))
        document.getElementById("submitNftContract").addEventListener(("click"), (event)=>this.#setCollectionAddressHandler(event))
    }

    #setCollectionAddressHandler(event) {
        if (this.filterBuilder) {
            this.filterBuilder.setCollectionAddressHandler(event)
        } else {
            const value = document.getElementById("nftContractAddressInput").value
            if ((event.key!=="Enter" && event.key!==undefined && value!==undefined)) {
                return false
            }
            this.collectionAddress = ethers.utils.getAddress(value)
            this.filterBuilder = this.#createNewFilterBuilder(this.collectionAddress)
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

    setCollectionAddress(collectionAddress){
        //TODO cleanup
        if(collectionAddress) {
            try {
                this.collectionAddress = ethers.utils.getAddress(collectionAddress) 
            } catch (error) {
                console.warn("not an address TODO warn user")
                return false    
            }
        } else {
            console.warn("no collection address provided")
            return false
        }

        if (this.filterBuilder) {
            this.filterBuilder.setCollectionAddress(this.collectionAddress)
        } else {
            this.filterBuilder = this.#createNewFilterBuilder(this.collectionAddress)
        }

        this.#updateCriterionName()
    }

    getCurrentCriterion() {
        return this.criteria[this.currentCriterionIndex]
    }

    setAmountPerItem(amount, criterionIndex) {
        const criterion = this.criteria[criterionIndex]
        criterion.amountPerItem = amount
    }

    async #updateCriterionName(criterionIndex=this.currentCriterionIndex, newName=undefined) {
        const criterion = this.criteria[criterionIndex]
        const collectionName = await this.filterBuilder.nftMetaData.getContractName()
        if (newName) {
            criterion.name = `${newName}-${collectionName}`

        } else {
            const oldName = criterion.name.split("-")[0]
            criterion.name = `${oldName}-${collectionName}`
        }
        //TODO update criteriaselectorInput
    }

    async createCriterion(collectionAddress) {
        this.setCollectionAddress(collectionAddress)
        const newCriterion = structuredClone(this.criterionFormat)
        const collectionName = await this.filterBuilder.nftMetaData.getContractName()
        newCriterion.name =  `NewCriterion#${this.criteria.length}-${collectionName}`
        newCriterion.collectionAddress = collectionAddress

        //add option ui
        //set option.title to filtername
        //set option.name to newCriterion.name
    }
}