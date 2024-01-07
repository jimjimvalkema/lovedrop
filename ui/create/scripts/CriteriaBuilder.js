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
            displayElementId: this.nftDisplayElementId
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
    }



    getCurrentCriterion() {
        return this.criteria[this.currentCriterionIndex]
    }

    setAmountPerItem(amount, criterionIndex) {
        const criterion = this.criteria[criterionIndex]
        criterion.amountPerItem = amount
    }
}