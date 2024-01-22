import { ethers } from "../../scripts/ethers-5.2.esm.min.js"
import { NftDisplay } from "../../scripts/NftDisplay.js"
import { CriteriaBuilder } from "./CriteriaBuilder.js"
import { NftMetaDataCollector } from "../../scripts/NftMetaDataCollector.js"

export class DropBuilder {
    criteriaBuilder

    duplicatesNftDisplayId = "duplicatesNftDisplay"
    conflictResolutionMethodSelector = document.getElementById("criteriaConflictsResolutionSelection")
    finalizeDropButton = document.getElementById("finalizeDropButton")
    dropBuilderElement = document.getElementById("dropBuilder")
    criteriaBuilderElement = document.getElementById("criteriaBuilder")
    dropBuilderConflictsElement = document.getElementById("dropBuilderConflicts")

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

        this.criteriaPerIds = this.getCriteriaPerId()
        this.duplicates = this.getIdsWithDuplicateCriteria(this.criteriaPerIds)
        this.displayDuplicates()

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
        //display
        for (const collection in this.duplicates) {
            const collectionAddress =ethers.utils.getAddress(collection)
            const ids = Object.keys(this.duplicates[collection])

            //const duplicatesDisplayElement = document.getElementById(this.duplicatesNftDisplayId)
            this.dropBuilderConflictsElement.hidden= false

            //nftDisplay setup
            this.nftMetaData = new NftMetaDataCollector(collectionAddress, this.provider, this.ipfsGateway)
            this.NftDisplay = new NftDisplay({
                ids: ids,
                collectionAddress: collectionAddress,
                provider: this.provider,
                displayElementId: this.duplicatesNftDisplayId,
                ipfsGateway: this.ipfsGateway,
                nftMetaData: this.nftMetaData,
                landscapeOrientation: {["rowSize"]:7,["amountRows"]:1}

            })
            await this.NftDisplay.createDisplay()
            this.NftDisplay.displayNames({ redirect: true })
            this.NftDisplay.addImageDivsFunction((id, nftDisplay)=>this.#showCriteriaNftDisplay(id, nftDisplay))
            //this.NftDisplay.showAttributes()
        }

    }

    getTicker() {
        return "TODO"
    }

    #getLargestAmountCriterionIndex(criteria) {
        const largestCriterionIndex = criteria.reduce(
            (selectedIndex, currentCriterion, index) => {
                if(Number(criteria[selectedIndex].amountPerItem) > Number(currentCriterion.amountPerItem) ) {
                    return selectedIndex
                }  else {
                    return index
                }
            }, 0
        );
        return largestCriterionIndex
    }


    #showCriteriaNftDisplay(id, nftDisplay) {
        const rootElement = document.createElement("div")
        const contentElement = document.createElement("div")

        const criteria = this.criteriaPerIds[nftDisplay.collectionAddress][id]
        
        criteria.forEach((criterion)=>{
            const criterionElement = document.createElement("div")

            //TODO better class names
            const criterionNameEl = document.createElement("div")
            criterionNameEl.innerHTML = `<span class="attributeType">criterion:</span> <span class="attributeValue">${criterion.name}</span>`
            const criterionAmountEl = document.createElement("div")
            criterionAmountEl.innerHTML = `<span class="attributeType">amount:</span> <span class="attributeValue">${criterion.amountPerItem}</span>`
            
            const lineBreak = document.createElement("br")
            criterionElement.append(criterionNameEl,criterionAmountEl,lineBreak)
            
            criterionElement.className = "attributesNftDisplayItems"
            contentElement.append(criterionElement)

        })


        //TODO make toggle to always show
        rootElement.className = "attributesNftDisplayContainer"
        rootElement.id = `attributes-${id}-${this.collectionAddress}`
        rootElement.addEventListener("mouseover", () => {rootElement.style.opacity=1});
        rootElement.addEventListener("mouseout", () => {rootElement.style.opacity=0});
        contentElement.className = "attributesNftDisplayContent"
        rootElement.append(contentElement)

        return rootElement
    }


    #getSmallestAmountCriterionIndex(criteria) {
        const smallestCriterionIndex = criteria.reduce(
            (selectedIndex, currentCriterion, index) => {
                if(Number(criteria[selectedIndex].amountPerItem) < Number(currentCriterion.amountPerItem) ) {
                    return selectedIndex
                }  else {
                    return index
                }
            }, 0
        );
        return smallestCriterionIndex
    }

    /**
     * 
     * @param {String} mode "smallest", "largest", "last", "first" or "remove"
     * @param {Object} criteriaPerIds  {"0x5Af0D9827E0c53E4799BB226655A1de152A425a5": {1: [criterionObj, criterionObj], 2: [criterionObj]}}
     * @returns 
     */
    removeConflictingCriteria(mode="largest", criteriaPerIds=this.criteriaPerIds) {
        const validModes = ["smallest", "largest", "last", "first", "remove"]
        if (validModes.indexOf(mode)===-1) {
            throw Error(`type: ${mode} unkown. try "smallest", "largest", "last", "first" or "remove"`)
        }

        let filteredCriteria = structuredClone(criteriaPerIds)
        for (const collection in criteriaPerIds) {
            for (const id in criteriaPerIds[collection]) {
                const criteriaArr = criteriaPerIds[collection][id]
                if(criteriaArr.length === 1) {
                    filteredCriteria[collection][id] = criteriaArr[0]
                } else {
                    if (mode === "remove") {
                        delete filteredCriteria[collection][id]

                        //track ids who are removed
                        criteriaArr.forEach(criterion => {
                            criterion.excludedIds.push(id)
                        });
                    } else {
                        //set selected criterion
                        const index = this.#selectCriterion(criteriaArr, mode)
                        filteredCriteria[collection][id] = criteriaArr[index]

                        //track ids who are removed
                        const removedCriteria = criteriaArr.toSpliced(index,1)
                        removedCriteria.forEach(criterion => {
                            criterion.excludedIds.push(id)
                        });
                    }
                }
            }
        }
        return filteredCriteria
    }

    #selectCriterion(criterionArr, selectionType) {
        switch (selectionType) {
            case "largest":
                return this.#getLargestAmountCriterionIndex(criterionArr)

            case "smallest":
                return this.#getSmallestAmountCriterionIndex(criterionArr)
            
            case "last":    
                return criterionArr.length-1

            case "first":
                return 0

            default:
                throw Error(`type: ${type} unkown. try "smallest", "largest", "last" or "first"`)
        }

    }
}
