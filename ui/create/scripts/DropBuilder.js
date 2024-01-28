import { ethers } from "../../scripts/ethers-5.2.esm.min.js"
import { NftDisplay } from "../../scripts/NftDisplay.js"
import { CriteriaBuilder, criterionFormat } from "./CriteriaBuilder.js"
import { NftMetaDataCollector } from "../../scripts/NftMetaDataCollector.js"
import { FilterBuilder, filterTemplate } from "./FilterBuilder.js"

export class DropBuilder {
    criteriaBuilder

    duplicatesNftDisplayId = "duplicatesNftDisplay"
    conflictResolutionSelector = document.getElementById("criteriaConflictsResolutionSelection")
    finalizeDropButton = document.getElementById("finalizeDropButton")
    dropBuilderElement = document.getElementById("dropBuilder")
    criteriaBuilderElement = document.getElementById("criteriaBuilder")
    dropBuilderConflictsElement = document.getElementById("dropBuilderConflicts")
    backButtonElement = document.getElementById("backButtonDropBuilder")

    //or do conflictResolutionSelectorHandler with a submit button but user might decide to go back anyway
    criteriaForConflictResolution = {} 
    duplicatesNftDisplays = {}


    originalElementDisplayStyle = {
        [this.criteriaBuilderElement.id]: getComputedStyle(this.criteriaBuilderElement).display,
        [this.dropBuilderElement.id]: getComputedStyle(this.dropBuilderElement).display
    }



    constructor({ collectionAddress, provider, ipfsGateway, nftDisplayElementIdCriteriaBuilder: nftDisplayElementIdCriteriaBuilder } = { collectionAddress: undefined, provider, ipfsGateway, nftDisplayElementIdCriteriaBuilder: nftDisplayElementIdCriteriaBuilder }) {
        this.criteriaBuilder = new CriteriaBuilder({
            collectionAddress: collectionAddress,
            provider: provider,
            ipfsGateway: ipfsGateway,
            nftDisplayElementId: nftDisplayElementIdCriteriaBuilder
        });

        this.collectionAddress = collectionAddress
        this.provider = provider
        this.ipfsGateway = ipfsGateway
        this.nftDisplayElementIdCriteriaBuilder = nftDisplayElementIdCriteriaBuilder

        //initialize
        this.dropBuilderElement.style.display = "none"

        this.finalizeDropButton.addEventListener("click", (event) => this.toggleFinalizeDropView(event))
        this.backButtonElement.addEventListener("click", (event) => this.toggleFinalizeDropView(event))
        this.conflictResolutionSelector.addEventListener("change", (event) => this.#conflictResolutionSelectorHandler(event, this.criteriaPerIds))

    }

    #isValidCriterion(criterion) {
        return (criterion.ids.length && criterion.collectionAddress && criterion.amountPerItem)
    }

    toggleFinalizeDropView() {


        if (this.dropBuilderElement.style.display === "none") {
            this.removeConflictResolutionCriteria()

            const originalDisplayStyle = this.originalElementDisplayStyle[this.dropBuilderElement.id]
            this.dropBuilderElement.style.display = originalDisplayStyle
            this.criteriaBuilderElement.style.display = "none"
            if(this.criteriaBuilder.filterBuilder.NftDisplay) {
                this.criteriaBuilder.filterBuilder.NftDisplay.clear()
            }

            const validCriteria = this.criteriaBuilder.criteria.filter((criterion)=>this.#isValidCriterion(criterion))
            this.criteriaPerIds = this.getCriteriaPerId(validCriteria)

            //displayduplicates
            if (validCriteria.length) {
                const duplicates = this.getIdsWithDuplicateCriteria(this.criteriaPerIds)
                console.log(duplicates)
                const amountOfDuplicates =  Object.keys(duplicates).reduce((total, collection)=>total+=Object.keys(duplicates[collection]).length, 0)
                console.log(amountOfDuplicates)
                if(amountOfDuplicates > 0 ) {

                    this.displayDuplicates(duplicates)
                   
                }
                
            }
        

        } else {
            //TODO still a issue with attribute selector bugging out when switching back
            const originalDisplayStyle = this.originalElementDisplayStyle[this.criteriaBuilderElement.id]
            this.criteriaBuilderElement.style.display = originalDisplayStyle
            this.dropBuilderElement.style.display = "none"
            if(this.NftDisplay) {
                this.NftDisplay.clear()
            }
            if(this.criteriaBuilder.filterBuilder) {
                this.criteriaBuilder.filterBuilder.runFilter()   
            }
        
     
        }


    }


    /**
     * returns the criteria that includes a specific id by collection
     * gathered from all criteria from the criteria builder
     * ex: {"0x5Af0D9827E0c53E4799BB226655A1de152A425a5": {1: [criterionObj, criterionObj], 2: [criterionObj]}}
     * @returns {number[]} allocations
     */
    getCriteriaPerId(criteria=this.criteriaBuilder.criteria) {
        let criteriaPerIds = {}
        for (const criterion of criteria) {
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

    async displayDuplicates(duplicates) {
        this.dropBuilderConflictsElement.hidden = false



        //display
        for (const rawCollectionAddress in duplicates) {
            const collectionAddress = ethers.utils.getAddress(rawCollectionAddress)
            const ids = Object.keys(duplicates[collectionAddress])

            //nftDisplay setup
            console.log(this.duplicatesNftDisplays)
            if (rawCollectionAddress in this.duplicatesNftDisplays) {
                await this.duplicatesNftDisplays[collectionAddress].clear()
                this.duplicatesNftDisplays[collectionAddress].setId(ids) 
                await this.duplicatesNftDisplays[collectionAddress].createDisplay()
            } else {

                //element id setup
                const elementId = `duplicateDisplay-${collectionAddress}`
                const element = document.createElement("div")
                element.id = elementId
                element.className = "duplicateDisplay"
    
                document.getElementById(this.duplicatesNftDisplayId).append(element)

                //create display
                this.duplicatesNftDisplays[collectionAddress] = await this.createNftDisplay(collectionAddress, ids, elementId)

            }

        }

    }

    async createNftDisplay(collectionAddress, ids, elementId) {
        this.nftMetaData = new NftMetaDataCollector(collectionAddress, this.provider, this.ipfsGateway)
        let nftDisplay = new NftDisplay({
            ids: ids,
            collectionAddress: collectionAddress,
            provider: this.provider,
            displayElementId: elementId,
            ipfsGateway: this.ipfsGateway,
            nftMetaData: this.nftMetaData,
            landscapeOrientation: { ["rowSize"]: 7, ["amountRows"]: 1 }

        })
        //TODO am setting collection addres twice becuase initializing is async
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaa")
        await nftDisplay.createDisplay() //TODO fix this lol
        await nftDisplay.setCollectionAddress(collectionAddress)
        await nftDisplay.displayNames({ redirect: true })
        await nftDisplay.addImageDivsFunction((id, nftDisplay) => this.#showCriteriaNftDisplay(id, nftDisplay))
        await nftDisplay.createDisplay()

        return nftDisplay

    }

    getTicker() {
        return "TODO"
    }

    #getLargestAmountCriterionIndex(criteria) {
        const largestCriterionIndex = criteria.reduce(
            (selectedIndex, currentCriterion, index) => {
                if (Number(criteria[selectedIndex].amountPerItem) > Number(currentCriterion.amountPerItem)) {
                    return selectedIndex
                } else {
                    return index
                }
            }, 0
        );
        return largestCriterionIndex
    }


    #showCriteriaNftDisplay(id, nftDisplay) {
        console.log(nftDisplay)
        const rootElement = document.createElement("div")
        const contentElement = document.createElement("div")

        console.log(nftDisplay.collectionAddress)
        const criteria = this.criteriaPerIds[nftDisplay.collectionAddress][id]

        criteria.forEach((criterion) => {
            const criterionElement = document.createElement("div")

            //TODO better class names
            const criterionNameEl = document.createElement("div")
            criterionNameEl.innerHTML = `<span class="attributeType">criterion:</span> <span class="attributeValue">${criterion.name}</span>`
            const criterionAmountEl = document.createElement("div")
            criterionAmountEl.innerHTML = `<span class="attributeType">amount:</span> <span class="attributeValue">${criterion.amountPerItem}</span>`

            const lineBreak = document.createElement("br")
            criterionElement.append(criterionNameEl, criterionAmountEl, lineBreak)

            criterionElement.className = "attributesNftDisplayItems"
            contentElement.append(criterionElement)

        })


        //TODO make toggle to always show
        rootElement.className = "attributesNftDisplayContainer"
        rootElement.id = `attributes-${id}-${this.collectionAddress}`
        rootElement.addEventListener("mouseover", () => { rootElement.style.opacity = 1 });
        rootElement.addEventListener("mouseout", () => { rootElement.style.opacity = 0 });
        contentElement.className = "attributesNftDisplayContent"
        rootElement.append(contentElement)

        return rootElement
    }


    #getSmallestAmountCriterionIndex(criteria) {
        const smallestCriterionIndex = criteria.reduce(
            (selectedIndex, currentCriterion, index) => {
                if (Number(criteria[selectedIndex].amountPerItem) < Number(currentCriterion.amountPerItem)) {
                    return selectedIndex
                } else {
                    return index
                }
            }, 0
        );
        return smallestCriterionIndex
    }

    async createCriterionWithIds(collectionAddress, ids, name) {
        const newCriterion = await this.criteriaBuilder.createCriterion(collectionAddress)
        await this.criteriaBuilder.updateCriterionName(newCriterion.index, name)
        //this.criteriaBuilder.changeCurrentCriterion(newCriterion.index)
        
        this.criteriaBuilder.filterBuilder.changeFilterName(name, newCriterion.selectedFilter.index)
        //this.criteriaBuilder.filterBuilder.changeCurrentFilter(newCriterion.selectedFilter.index)



        newCriterion.ids = ids
        newCriterion.selectedFilter.inputs.idList = ids
        return newCriterion
    }

    getTotalsOfIds(criteriaPerIds) {
        const ids = Object.keys(criteriaPerIds)
        const totalsPerIdEntries = ids.map(
            (id) => {
                const total = criteriaPerIds[id].reduce(
                    //TODO!!!! do this with bigInt because this is dangerous!!!
                    (partialSum, criteria) => partialSum + Number(criteria.amountPerItem), 0
                )
                return [id, total]
            }
        )
        const totalsPerId = Object.fromEntries(totalsPerIdEntries)
        return totalsPerId
    }

    trackIdsPerAmount(idsWithAmount) {
        //mabye more efficient to initialize arrays in one loop with if statement
        const amountPerId = Object.fromEntries(Object.keys(idsWithAmount).map((id)=>[idsWithAmount[id],[]]))
        for (const id in idsWithAmount) {
            const amount = idsWithAmount[id]
            amountPerId[amount].push(id)
        }
        return amountPerId
    }

    addAmountsTogether(criteriaPerIdsPerCollection = this.criteriaPerIds) {
        const totalsIdsPerCollection = {}

        for (const collection in criteriaPerIdsPerCollection) {
            const criteriaPerIds = criteriaPerIdsPerCollection[collection]
            totalsIdsPerCollection[collection] = this.getTotalsOfIds(criteriaPerIds)
        }

        const amountsPerIdPerCollection = {}
        for (const collection in totalsIdsPerCollection) {
            const idsWithAmount = totalsIdsPerCollection[collection]
            amountsPerIdPerCollection[collection] = this.trackIdsPerAmount(idsWithAmount)
        }
        return amountsPerIdPerCollection

    }
    /**
     * undo effects from removeConflictingCriteria
     */
    async removeConflictResolutionCriteria() {
        for (const collection in this.criteriaForConflictResolution) {
            for(const currentCriterion of this.criteriaForConflictResolution[collection] ) {
                await this.criteriaBuilder.filterBuilder.removeFilterByIndex(currentCriterion.selectedFilter.index)
                this.criteriaBuilder.removeCriterionByIndex(currentCriterion.index)
            }
            this.criteriaForConflictResolution[collection] = []
        }

        for (const criterion of this.criteriaBuilder.criteria) {
            criterion.excludedIds = []
        }
    }

    /**
     * 
     * @param {String} mode "smallest", "largest", "last", "first" or "remove"
     * @param {Object} criteriaPerIds  {"0x5Af0D9827E0c53E4799BB226655A1de152A425a5": {1: [criterionObj, criterionObj], 2: [criterionObj]}}
     * @returns 
     */
    async removeConflictingCriteria(mode = "largest", criteriaPerIds) {
        await this.removeConflictResolutionCriteria() 
        let filteredCriteria = structuredClone(criteriaPerIds)
        const validModes = ["smallest", "largest", "last", "first", "remove", "add"]
        if (validModes.indexOf(mode) === -1) {
            throw Error(`type: ${mode} unkown. try "smallest", "largest", "last", "first", "add" or "remove"`)
        }

        //TODO make function
        if(mode==="add") {
            const criteriaPerIdsOnlyDuplicates = this.getIdsWithDuplicateCriteria(criteriaPerIds)
            const idsPerAmountsPerCollection = this.addAmountsTogether(criteriaPerIdsOnlyDuplicates)

            for (const collection in idsPerAmountsPerCollection) {
                for (const amount in idsPerAmountsPerCollection[collection]) {
                    const ids = idsPerAmountsPerCollection[collection][amount]
                    
                    //create criterion to track ids with new summed amount
                    const criterionName = `summedConflictingCriterion-${collection}-${amount}`
                    const newCriterion = await this.createCriterionWithIds(collection, ids, criterionName)
                    console.log(`creating criterion for ${amount} ${collection}`)
                    this.criteriaBuilder.setAmountPerItem(amount, newCriterion.index)

                    if (this.criteriaForConflictResolution[collection]) {
                        this.criteriaForConflictResolution[collection].push(newCriterion) 
                    } else {
                        this.criteriaForConflictResolution[collection] = [newCriterion]
                    }


                    //assing all ids this criterion
                    ids.forEach((id)=>filteredCriteria[collection][id]=newCriterion)
                }

                //converst ids with no criterion to a single criterion instead of an array
                for(const id  in criteriaPerIds[collection]) {
                    if(criteriaPerIds[collection][id].length === 1) {
                        filteredCriteria[collection][id] = criteriaPerIds[collection][id][0]
                    }
                }
            }
            return filteredCriteria

        } else {
            for (const collection in criteriaPerIds) {
                for (const id in criteriaPerIds[collection]) {
                    const criteriaArr = criteriaPerIds[collection][id]
                    if (criteriaArr.length === 1) {
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
                            const removedCriteria = criteriaArr.toSpliced(index, 1)
                            removedCriteria.forEach(criterion => {
                                criterion.excludedIds.push(id)
                            });
                        }
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
                return criterionArr.length - 1

            case "first":
                return 0

            default:
                throw Error(`type: ${type} unkown. try "smallest", "largest", "last" or "first"`)
        }

    }

    async #conflictResolutionSelectorHandler(event, criteriaPerIds=this.criteriaPerIds) {
        const criteriaPerId = await this.removeConflictingCriteria(event.target.value, criteriaPerIds)

        console.log(criteriaPerId)
    }
}
