import { ethers } from "../../scripts/ethers-5.2.esm.min.js"
import { CriteriaBuilder } from "./CriteriaBuilder.js"

export class DropBuilder {
    criteriaBuilder

    constructor({ collectionAddress, provider, ipfsGateway, nftDisplayElementId } = { collectionAddress: undefined, provider, ipfsGateway, nftDisplayElementId }) {
        this.criteriaBuilder = new CriteriaBuilder({
            collectionAddress: collectionAddress,
            provider: provider,
            ipfsGateway: ipfsGateway,
            nftDisplayElementId: nftDisplayElementId
        });

    }
    /**
     * returns the criteria that includes a specific id by collection
     * gathered from all criteria from the criteria builder
     * ex: {"0x5Af0D9827E0c53E4799BB226655A1de152A425a5": {1: [criterionObj, criterionObj], 2: [criterionObj]}}
     * @returns {number[]} allocations
     */
    getCriteriaPerId() {
        let allocations = {}
        for (const criterion of this.criteriaBuilder.criteria) {
            const collectionAddress = criterion.collectionAddress
            //const amount = criterion.amountPerItem
            if (!(collectionAddress in allocations)) {
                allocations[collectionAddress] = {}
            }

            for (const id of criterion.ids) {
                if (!(id in allocations[collectionAddress])) {
                    allocations[collectionAddress][id] = []
                }
                allocations[collectionAddress][id].push(criterion)
            }
        }
        return allocations
    }

}
