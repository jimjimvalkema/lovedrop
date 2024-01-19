import { ethers } from "../../scripts/ethers-5.2.esm.min.js"
import { NftDisplay } from "../../scripts/NftDisplay.js"
import { CriteriaBuilder } from "./CriteriaBuilder.js"
import { NftMetaDataCollector } from "../../scripts/NftMetaDataCollector.js"

export class DropBuilder {
    criteriaBuilder

    duplicatesNftDisplayId = "duplicatesNftDisplay"
    finalizeDropButton = document.getElementById("finalizeDropButton")
    dropBuilderElement = document.getElementById("dropBuilder")
    criteriaBuilderElement = document.getElementById("criteriaBuilder")
    originalElementDisplayStyle = {
        [this.criteriaBuilderElement.id]: getComputedStyle(this.criteriaBuilderElement).display,
        [this.dropBuilderElement.id]: getComputedStyle(this.dropBuilderElement).display
    }



    constructor({ collectionAddress, provider, ipfsGateway, nftDisplayElementId } = { collectionAddress: undefined, provider, ipfsGateway, nftDisplayElementId }) {
        this.criteriaBuilder = new CriteriaBuilder({
            collectionAddress: collectionAddress,
            provider: provider,
            ipfsGateway: ipfsGateway,
            nftDisplayElementId: nftDisplayElementId
        });

        this.collectionAddress = collectionAddress
        this.provider = provider
        this.ipfsGateway = ipfsGateway
        this.nftDisplayElementId = nftDisplayElementId

        console.log(this.ipfsGateway)

        //initialize
        this.dropBuilderElement.style.display = "none"

        finalizeDropButton.addEventListener("click", (event) => this.toggleFinalizeDropView(event))

    }

    toggleFinalizeDropView() {
        if (this.dropBuilderElement.style.display === "none") {
            const originalDisplayStyle = this.originalElementDisplayStyle[this.dropBuilderElement.id]
            this.dropBuilderElement.style.display = originalDisplayStyle
            this.criteriaBuilderElement.style.display = "none"

        } else {
            const originalDisplayStyle = this.originalElementDisplayStyle[this.criteriaBuilderElement.id]
            this.criteriaBuilderElement.style.display = originalDisplayStyle
            this.dropBuilderElement.style.display = "none"
        }

    }


    /**
     * returns the criteria that includes a specific id by collection
     * gathered from all criteria from the criteria builder
     * ex: {"0x5Af0D9827E0c53E4799BB226655A1de152A425a5": {1: [criterionObj, criterionObj], 2: [criterionObj]}}
     * @returns {number[]} allocations
     */
    getCriteriaPerId() {
        let criteriaPerIds = {}
        for (const criterion of this.criteriaBuilder.criteria) {
            const collectionAddress = criterion.collectionAddress
            //const amount = criterion.amountPerItem
            if (!(collectionAddress in criteriaPerIds)) {
                criteriaPerIds[collectionAddress] = {}
            }

            for (const id of criterion.ids) {
                if (!(id in criteriaPerIds[collectionAddress])) {
                    criteriaPerIds[collectionAddress][id] = []
                }
                criteriaPerIds[collectionAddress][id].push(criterion)
            }
        }
        return criteriaPerIds
    }

    getIdsWithDuplicateCriteria(criteriaPerIds) {
        let duplicates = {}
        for (const collection in criteriaPerIds) {
            const duplicatesAsEntries = Object.entries(criteriaPerIds[collection]).filter((id) => id[1].length > 1)
            duplicates[collection] = Object.fromEntries(duplicatesAsEntries)
        }
        return duplicates

    }

    async displayDuplicates() {
        const criteriaPerIds = this.getCriteriaPerId()
        const duplicates = this.getIdsWithDuplicateCriteria(criteriaPerIds)
        for (const collection in duplicates) {
            const collectionAddress =ethers.utils.getAddress(collection)
            console.log("aaaaaaaaaaaaaaa",collectionAddress)
            const ids = Object.keys(duplicates[collection])
            console.log(ids)
            console.log(this.duplicatesNftDisplayId)

            this.nftMetaData = new NftMetaDataCollector(collectionAddress, this.provider, this.ipfsGateway)
            this.NftDisplay = new NftDisplay({
                ids: ids,
                collectionAddress: collectionAddress,
                provider: this.provider,
                displayElementId: this.duplicatesNftDisplayId,
                ipfsGateway: this.ipfsGateway,
                nftMetaData: this.nftMetaData

            })
            this.NftDisplay.ids = ids
            await this.NftDisplay.createDisplay()
            this.NftDisplay.displayNames({ redirect: true })
            this.NftDisplay.showAttributes()

        }

    }

}