import { ethers } from "../../scripts/ethers-5.2.esm.min.js"
import { NftDisplay } from "../../scripts/NftDisplay.js"
import { CriteriaBuilder, criterionFormat } from "./CriteriaBuilder.js"
import { NftMetaDataCollector } from "../../scripts/NftMetaDataCollector.js"
import { FilterBuilder, filterTemplate } from "./FilterBuilder.js"
import { ERC20ABI } from "../../abi/ERC20ABI.js"
import {MerkleBuilder} from "../../scripts/MerkleBuilder.js"
import {IpfsIndexer} from "../../scripts/IpfsIndexer.js"
import {LoveDropFactoryAbi} from "../../abi/LoveDropFactoryAbi.js"

export class DropBuilder {
    criteriaBuilder
    erc20Units = 18 //TODO set this in u

    duplicatesNftDisplayId = "duplicatesNftDisplay"
    conflictResolutionSelector = document.getElementById("criteriaConflictsResolutionSelection")
    finalizeDropButton = document.getElementById("finalizeDropButton")


    backButtonEl = document.getElementById("backButtonDropBuilder")
    confirmConflictResolutionButtonEl = document.getElementById("confirmConflictResolutionButton")

    criteriaTableEl = document.getElementById("criteriaOverviewTable")
    //duplicatesManagerEl = document.getElementById("duplicatesManager")

    criteriaBuilderEl = document.getElementById("criteriaBuilder")
    dropBuilderEl = document.getElementById("dropBuilder")
    dropBuilderConflictsEl = document.getElementById("dropBuilderConflicts")
    distrobutionOverViewEl = document.getElementById("distrobutionOverView")
    deploymentEl = document.getElementById("deployment")
    dropBuilderPages = [this.dropBuilderConflictsEl, this.distrobutionOverViewEl, this.deploymentEl]

    connectWallletBtn = document.getElementById("connectWalletBtn")


    confirmDistrobutionBtn = document.getElementById("confirmDistrobutionBtn")
    airdropTokenContractAddressInput = document.getElementById("airdropTokenContractAddressInput")

    allCollectionsEl =  document.getElementById("allCollections")
    allCriteriaNamesEl =  document.getElementById("allCriteriaNames")


    confirmAndBuildDropBtn = document.getElementById("confirmAndBuildDrop")
    deployAirDropBtn = document.getElementById("deployAirDrop")
    fundAirdropBtn = document.getElementById("fundAirdrop")

    progressProofGenEl = document.getElementById("progressProofGen")

    messageEl = document.getElementById("message2")

    //or do conflictResolutionSelectorHandler with a submit button but user might decide to go back anyway
    criteriaForConflictResolution = {}
    duplicatesNftDisplays = {}


    txs = []

    originalElementDisplayValues = this.getDisplayStylesFromElements([this.dropBuilderEl, this.dropBuilderConflictsEl, this.criteriaBuilderEl, this.distrobutionOverViewEl])



    constructor({ collectionAddress, provider, ipfsGateway, nftDisplayElementCriteriaBuilder, ipfsIndexer, loveDropFactoryAddress } = { collectionAddress: undefined, provider, ipfsGateway, nftDisplayElementCriteriaBuilder,loveDropFactoryAddress:"0xfCD69606969625390C79c574c314b938853e1061" }) {
        this.criteriaBuilder = new CriteriaBuilder({
            collectionAddress: collectionAddress,
            provider: provider,
            ipfsGateway: ipfsGateway,
            nftDisplayElement: nftDisplayElementCriteriaBuilder
        });

        this.collectionAddress = collectionAddress
        this.provider = provider
        this.ipfsGateway = ipfsGateway
        this.ipfsIndexer = ipfsIndexer
        this.nftDisplayElementCriteriaBuilder = nftDisplayElementCriteriaBuilder
        this.loveDropFactoryAddress = loveDropFactoryAddress

        //initialize
        this.dropBuilderEl.style.display = "none"

        this.finalizeDropButton.addEventListener("click", (event) => this.toggleFinalizeDropView(event))
        this.backButtonEl.addEventListener("click", (event) => this.#dropBuilderBackBtnHandler())
        this.conflictResolutionSelector.addEventListener("change", (event) => this.#conflictResolutionSelectorHandler(event, this.criteriaPerIds))
        this.confirmConflictResolutionButtonEl.addEventListener("click", (event) => this.#confirmConflictResolutionHandler(event))
        this.confirmDistrobutionBtn.addEventListener("click", (event) => this.#showDropBuilderPageEl(this.deploymentEl, event))
        this.airdropTokenContractAddressInput.addEventListener("keypress", (event) => this.#setTokenContractHandler(event))
        this.connectWallletBtn.addEventListener("click", ()=>this.connectSigner())

        this.confirmAndBuildDropBtn.addEventListener("click",()=>this.#buildDropBtnHandler())
        this.deployAirDropBtn.addEventListener("click", ()=>this.#deployDropHandler())
        this.fundAirdropBtn.addEventListener("click", ()=>this.#fundAirdropBtnHandler())
    }

    #isValidSubmitEvent(event, inputElement) {
        const value = inputElement.value
        //if ((event.key!=="Enter" && event.key!==undefined && value!==undefined)) {
        if ((event.key !== "Enter" && event.key !== undefined && value !== undefined)) {
            return false
        } else {
            return value
        }
    }

    async #setTokenContractHandler(event) {
        console.log(event.value)
        const value = this.#isValidSubmitEvent(event, this.airdropTokenContractAddressInput)
        if (value) {
            if (ethers.utils.isAddress(value)) {
                //TODO use signer instead of provider (for apporval)
                this.airdropTokenContractObj = new ethers.Contract(value, ERC20ABI, this.provider)
                //TOOD check if this is a problem if not set earlier
                this.erc20Units = await this.airdropTokenContractObj.decimals()
                document.getElementById("totalsOverview").hidden = false
                await this.setTotalsOverViewInfo()
 
                //this.airdropTokenContractObj = new ethers.Contract(value,ERC20ABI,this.provider)
            } else {
                this.airdropTokenContractAddressInput.value = ""

            }

        }

    }

    

    async connectSigner() {
        // MetaMask requires requesting permission to connect users accounts
        await this.provider.send("eth_requestAccounts", []);
        this.signer = await window.provider.getSigner();
        await this.#runOnConnectWallet()
    }
    
    async #runOnConnectWallet() {
        await Promise.all([this.#setUserAddress(),this.#setUserBalance()])
    }

    async #setUserBalance() {
        if (this.airdropTokenContractObj) {
            const userAddress = await this.signer.getAddress()
            const userBalance = this.airdropTokenContractObj.balanceOf(userAddress)
            userBalance.then((balance)=>{
                const formattedBalance = this.#formatNumber(balance)
                document.querySelectorAll(".erc20UserBalance").forEach((x) => x.innerText = formattedBalance)
            })
            return await userBalance
        }

    }

    async #setUserAddress() {
        const userAddress =  this.signer.getAddress()
        userAddress.then((address)=>{
            document.querySelectorAll(".userAddress").forEach((x)=>x.innerText=address)
        })
        return await userAddress
    }

    async #createCollectionHrefs() {
        const allCollectionsAddresses = [...new Set(this.criteriaBuilder.criteria.map((x)=>x.collectionAddress))]
        const names =  allCollectionsAddresses.map((address)=>this.criteriaBuilder.filterBuilder.getNftMetaData(address).getContractName())
        const nameElements = (await Promise.all(names)).map((name, index)=>{
            const address = allCollectionsAddresses[index]
            const nameElement = document.createElement("a")
            nameElement.innerText = name
            nameElement.href = `https://etherscan.io/address/${address}`
            nameElement.target="_blank"
            return nameElement
        })



        return nameElements

    }

    /**
     * 
     * @returns {BigNumber}
     */
    getTotalAirdrop() {
        const totalBigNum = this.criteriaBuilder.criteria.reduce((total,criterion)=>{
            const amountPerItem = ethers.utils.parseUnits(criterion.amountPerItem, this.erc20Units)
            const totatAmountCriterion = amountPerItem.mul((criterion.ids.length - criterion.excludedIds.length))
            return totatAmountCriterion.add(total)
        }, ethers.BigNumber.from(0))

        return totalBigNum
    }

    async setTotalsOverViewInfo() {

        if (this.airdropTokenContractObj) {
            let allResults=[]

            //set info
            document.querySelectorAll(".tokenContractHref").forEach((x) => {
                x.innerText = this.airdropTokenContractObj.address;
                x.href = `https://etherscan.io/token/${this.airdropTokenContractObj.address}`;
            })

            const contractName = this.airdropTokenContractObj.name()
            contractName.then((name) => {
                document.querySelectorAll(".tokenName").forEach((x) => x.innerText = name)
            });

            const contractTicker = this.airdropTokenContractObj.symbol()
            contractTicker.then((ticker) => {
                document.querySelectorAll(".ticker").forEach((x) => x.innerText = ticker)
            });

            const totalSupply = this.airdropTokenContractObj.totalSupply()
            totalSupply.then((supply) => {
                const formattedSupply = this.#formatNumber(supply)
                document.querySelectorAll(".totalsupply").forEach((x) => x.innerText = formattedSupply)
            });


            const collectionNames = this.#createCollectionHrefs()
            collectionNames.then((names) => {
                const namesWithSpacing = names.map((x)=>[x, ", "]).flat().toSpliced(-1,1)
                this.allCollectionsEl.innerHTML = ""
                this.allCollectionsEl.append(...namesWithSpacing)
            });

            const totalAirdrop = this.#formatNumber(this.getTotalAirdrop())
            document.querySelectorAll(".totalAirdrop").forEach((x) => x.innerText = totalAirdrop)

            this.allCriteriaNamesEl.innerText = this.criteriaBuilder.criteria.map((x)=>x.name).toString()


            await this.connectSigner()
            if (this.signer) {
                await this.#setUserBalance()
            }

            allResults = [...allResults, contractName, contractTicker, totalSupply, collectionNames]
            return await Promise.all(allResults)
        }
    }

    #dropBuilderBackBtnHandler() {
        const currentPage = this.dropBuilderPages.findIndex((el) => el.style.display !== "none")

        if (this.dropBuilderPages[currentPage - 1] === this.dropBuilderConflictsEl) {
            const duplicates = this.getIdsWithDuplicateCriteria(this.criteriaPerIds)
            const amountOfDuplicates = Object.keys(duplicates).reduce((total, collection) => total += Object.keys(duplicates[collection]).length, 0)
            if (amountOfDuplicates === 0) {
                this.#showDropBuilderPageIndex(currentPage - 2)
            } else {
                this.#showDropBuilderPageIndex(currentPage - 1)
            }

        } else if (currentPage !== -1) {
            this.#showDropBuilderPageIndex(currentPage - 1)
        }

    }



    /**
     * 
     * @param {HTMLElement[]} elements 
     */
    getDisplayStylesFromElements(elements) {
        let displayStyles = {}
        for (const element of elements) {
            displayStyles[element.id] = getComputedStyle(element).display
        }
        return displayStyles
    }

    #isValidCriterion(criterion) {
        return (criterion.ids.length && criterion.collectionAddress && criterion.amountPerItem)
    }

    /**
     * 
     * @param {HTMLElement[]} element 
     * @param {String} displayStyle 
     */
    #setDisplayStyleOfElements(elements, displayStyle) {
        elements.forEach((el) => {
            if (!(el.id in this.originalElementDisplayValues)) {
                this.originalElementDisplayValues[el.id] = getComputedStyle(el).display
            }
            el.style.display = displayStyle;
        })
    }

    /**
     * 
     * @param {HTMLElement[]} elements 
     */
    #resetDisplayStyleOfElements(elements) {
        elements.forEach((el) => el.style.display = this.originalElementDisplayValues[el.id])
    }

    async #showDropBuilderPageEl(element) {
        //TODO cleanup and do in showDropBuilderPageIndex
        if (this.criteriaBuilderEl.id === element.id) {
            this.#showDropBuilderPageIndex(-1)

        } else {
            const pageIndex = this.dropBuilderPages.findIndex((el) => el.id === element.id)
            if (pageIndex === -1) {
                throw Error(`element id ${element.id} is not in dropBuilderPages array: ${this.dropBuilderPages.map((x) => x.id)}`)
            }
            this.#showDropBuilderPageIndex(pageIndex)
        }

        if(this.deploymentEl.id === element.id) {
            this.setTotalsOverViewInfo()
        }
    }

    #showDropBuilderPageIndex(page) {
        if (page === -1) {
            this.#setDisplayStyleOfElements([this.dropBuilderEl, ...this.dropBuilderPages], "none")
            this.#resetDisplayStyleOfElements([this.criteriaBuilderEl])
        } else {
            const otherPages = this.dropBuilderPages.toSpliced(page, 1)
            this.#setDisplayStyleOfElements([this.criteriaBuilderEl, ...otherPages], "none")
            this.#resetDisplayStyleOfElements([this.dropBuilderEl, this.dropBuilderPages[page]])
        }
    }





    async toggleFinalizeDropView() {
        if (this.dropBuilderEl.style.display === "none") {
            //toggle display
            await this.#showDropBuilderPageEl(this.dropBuilderConflictsEl)

            //remove data created when users goes back and returns
            this.removeConflictResolutionCriteria()

            //process data
            const validCriteria = this.criteriaBuilder.criteria.filter((criterion) => this.#isValidCriterion(criterion))
            this.criteriaPerIds = this.getCriteriaPerId(validCriteria)

            //displayduplicates
            if (validCriteria.length) {
                var duplicates = this.getIdsWithDuplicateCriteria(this.criteriaPerIds)
                var amountOfDuplicates = Object.keys(duplicates).reduce((total, collection) => total += Object.keys(duplicates[collection]).length, 0)
            }

            if (validCriteria.length && amountOfDuplicates > 0) {
                await this.displayDuplicates(duplicates)
            } else {
                //go to next step
                this.criteriaPerIdNoConflicts = this.criteriaPerIds
                await this.#confirmConflictResolutionHandler()
            }

        } else {
            //toggle display
            await this.#showDropBuilderPageEl(this.criteriaBuilderEl)

            // this.#setDisplayStyleOfElements([this.dropBuilderEl, this.distrobutionOverViewEl, this.dropBuilderConflictsEl], "none")
            // this.#resetDisplayStyleOfElements([this.criteriaBuilderEl])

            //rerun filter
            if (this.criteriaBuilder.filterBuilder) {
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
    getCriteriaPerId(criteria = this.criteriaBuilder.criteria) {
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
        await this.#showDropBuilderPageEl(this.dropBuilderConflictsEl)

        //display
        for (const rawCollectionAddress in duplicates) {
            const collectionAddress = ethers.utils.getAddress(rawCollectionAddress)
            const ids = Object.keys(duplicates[collectionAddress])

            //nftDisplay setup
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
                this.duplicatesNftDisplays[collectionAddress] = await this.createNftDisplay(collectionAddress, ids, element)

            }

        }

    }

    async createNftDisplay(collectionAddress, ids, nftDisplayElement) {
        //this.nftMetaData = new NftMetaDataCollector(collectionAddress, this.provider, this.ipfsGateway)
        const nftMetaData = this.criteriaBuilder.filterBuilder.getNftMetaData(collectionAddress)
        let nftDisplay = new NftDisplay({
            ids: ids,
            collectionAddress: collectionAddress,
            provider: this.provider,
            displayElement: nftDisplayElement,
            ipfsGateway: this.ipfsGateway,
            nftMetaData: nftMetaData,
            landscapeOrientation: { ["rowSize"]: 7, ["amountRows"]: 1 }

        })
        //TODO am setting collection addres twice becuase initializing is async
        await nftDisplay.displayNames({ redirect: true })
        await nftDisplay.addImageDivsFunction((id, nftDisplay) => this.#showCriteriaNftDisplay(id, nftDisplay), false)
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
        const rootElement = document.createElement("div")
        const contentElement = document.createElement("div")

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
        //TODO somehow the name is right but the extra label in the selector isnt
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
                    (partialSum, criterion) => {
                        const amountPerItem = ethers.utils.parseUnits(criterion.amountPerItem, this.erc20Units)
                        return amountPerItem.add(partialSum)

                    }, ethers.BigNumber.from(0)
                )
                return [parseInt(id), ethers.utils.formatUnits(total, this.erc20Units)]
            }
        )
        const totalsPerId = Object.fromEntries(totalsPerIdEntries)
        return totalsPerId
    }

    trackIdsPerAmount(idsWithAmount) {
        //mabye more efficient to initialize arrays in one loop with if statement
        const amountPerId = Object.fromEntries(Object.keys(idsWithAmount).map((id) => [idsWithAmount[id], []]))
        for (const id in idsWithAmount) {
            const amount = idsWithAmount[id]
            amountPerId[amount].push(parseInt(id))
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
            for (const currentCriterion of this.criteriaForConflictResolution[collection]) {
                //await this.criteriaBuilder.setCollectionAddress(currentCriterion.collectionAddress, currentCriterion.index)
                await this.criteriaBuilder.filterBuilder.removeFilterByIndex(currentCriterion.selectedFilter.index, currentCriterion.collectionAddress)
                await this.criteriaBuilder.removeCriterionByIndex(currentCriterion.index, currentCriterion.collectionAddress)
            }
            this.criteriaForConflictResolution[collection] = []
        }

        for (const criterion of this.criteriaBuilder.criteria) {
            criterion.excludedIds = []
        }
    }

    /**
     * tests if arrays have the same content regardless of order of items
     * @param {Array} testArr 
     * @param {Array} searchArr 
     * @returns {boolean}
     */
    #arrayHasSameContents(testArr, searchArr) {
        const testSet = new Set(testArr)
        const searchSet = new Set(searchArr)
        if (testSet.size === searchSet.size) {
            return [...searchSet].every((item) => testSet.has(item))
        } else {
            return false
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
        //TODO this breaks on multi collections
        if (mode === "add") {
            const criteriaPerIdsOnlyDuplicates = this.getIdsWithDuplicateCriteria(criteriaPerIds)
            const criterionWithReferenceIndexes = []

            for (const collection of Object.keys(criteriaPerIdsOnlyDuplicates)) {
                this.criteriaForConflictResolution[collection] = []
                const ids = Object.keys(criteriaPerIdsOnlyDuplicates[collection]).map((id) => parseInt(id))
                console.log(ids)

                for (const id of ids) {
                    //track excluded ids and criteria indexes
                    const criteria = criteriaPerIdsOnlyDuplicates[collection][id]
                    let criteriaIndexesOfId = []
                    criteria.forEach((criterion) => {
                        criterion.excludedIds.push(id)
                        criteriaIndexesOfId.push(criterion.index)
                    })

                    //check if a criterion was alreade made for this combination of criteria
                    let index = criterionWithReferenceIndexes.findIndex((i) => this.#arrayHasSameContents(i.criteriaIndexes, criteriaIndexesOfId))

                    //create new criterion if it isnt in there
                    if (index === -1) {
                        ////create new criterion TODO function
                        const newCriterion = await this.criteriaBuilder.createCriterion(collection)
                        newCriterion.ids = []

                        //update name
                        const allCriterionNames = criteriaIndexesOfId.reduce((name, index) => {
                            return name += `${this.criteriaBuilder.criteria[index].name}-`
                        }, "").slice(0, -1)
                        console.log(allCriterionNames)
                        const name = `overlappingCriteria-${allCriterionNames}`
                        await this.criteriaBuilder.updateCriterionName(newCriterion.index, name)
                        this.criteriaBuilder.filterBuilder.changeFilterName(name, newCriterion.selectedFilter.index)

                        //set amount
                        const amountBigNumber = criteriaIndexesOfId.reduce(
                            (partialSum, index) => {
                                const amountPerItem = ethers.utils.parseUnits(this.criteriaBuilder.criteria[index].amountPerItem, this.erc20Units)
                                return amountPerItem.add(partialSum)
                            }, ethers.BigNumber.from(0)
                        )
                        newCriterion.amountPerItem = ethers.utils.formatUnits(amountBigNumber, this.erc20Units)

                        //add newCriterion
                        criterionWithReferenceIndexes.push(
                            {
                                "criteriaIndexes": criteriaIndexesOfId,
                                "criterion": newCriterion
                            }
                        )
                        index = criterionWithReferenceIndexes.length - 1

                        //add new criterion to confliction resultion criteria
                        this.criteriaForConflictResolution[collection].push(newCriterion)
                    }

                    //add id
                    criterionWithReferenceIndexes[index].criterion.ids.push(id)
                    criterionWithReferenceIndexes[index].criterion.selectedFilter.inputs.idList.push(id)
                    filteredCriteria[collection][id] = criterionWithReferenceIndexes[index].criterion
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
                                criterion.excludedIds.push(parseInt(id))
                            });
                        } else {
                            //set selected criterion
                            const index = this.#selectCriterion(criteriaArr, mode)
                            filteredCriteria[collection][id] = criteriaArr[index]

                            //track ids who are removed
                            const removedCriteria = criteriaArr.toSpliced(index, 1)
                            removedCriteria.forEach(criterion => {
                                criterion.excludedIds.push(parseInt(id))
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

    async #conflictResolutionSelectorHandler(event, criteriaPerIds = this.criteriaPerIds) {
        this.confirmConflictResolutionButtonEl.disabled = false
        const criteriaPerId = await this.removeConflictingCriteria(event.target.value, criteriaPerIds)
        this.criteriaPerIdNoConflicts = criteriaPerId
    }

    async #createCollectionElement(criterion) {
        //collectInfo
        //contract address
        const contractAddressLink = document.createElement("a")
        contractAddressLink.href = `https://etherscan.io/address/${criterion.collectionAddress}`
        contractAddressLink.className = "address"
        contractAddressLink.innerText = criterion.collectionAddress

        //contractName
        const contractName = await this.criteriaBuilder.filterBuilder.getNftMetaData(criterion.collectionAddress).getContractName()

        //add info to criteriaEl
        const wrapperDiv = document.createElement("div")
        wrapperDiv.append(
            `name: ${contractName}`,
            document.createElement("br"), `contract: `,
            contractAddressLink
        )
        const collectionEl = document.createElement("div")
        collectionEl.append(wrapperDiv)
        return collectionEl

    }

    #createCriteriaElement(criterion) {
        const contentDiv = document.createElement("div")
        contentDiv.append(`name: ${criterion.name}`, document.createElement("br"), document.createElement("br"), `filter: ${criterion.selectedFilter.filterName}`)
        contentDiv.className = "criterionNameTableItem"
        const criteriaElement = document.createElement("div")
        criteriaElement.append(contentDiv)
        return criteriaElement
    }

    /**
     * uses ethers formatEther to format a big int into a decimal 10^18 
     * and adds a thousands separator 
     * @param {Number|String|BigInt} number 
     * @returns {String} number
     */
    #formatNumber(number) {
        return new Intl.NumberFormat('en-EN').format(ethers.utils.formatEther((number)))
    }

    #createAmountElement(criterion) {
        const contentElement = document.createElement("div")
        //we doing big numbers B)
        const amountPerItem = ethers.utils.parseUnits(criterion.amountPerItem, this.erc20Units)
        const totatAmount = amountPerItem.mul((criterion.ids.length - criterion.excludedIds.length))

        contentElement.append(
            `total: ${this.#formatNumber(totatAmount)}`,
            document.createElement("br"),
            `per NFT: ${this.#formatNumber(amountPerItem)}`
        )
        const amountElement = document.createElement("div")
        amountElement.append(contentElement)
        return amountElement

    }

    async #createNftsElement(criterion) {
        const ids = criterion.ids.filter((id) => criterion.excludedIds.indexOf(id) === -1)
        const collectionAddress = ethers.utils.getAddress(criterion.collectionAddress)
        const contentElement = document.createElement("div")
        const nftMetaData = this.criteriaBuilder.filterBuilder.getNftMetaData(collectionAddress)
        contentElement.id = `${collectionAddress}-${criterion.name}-${criterion.index}`

        const landscapeOrientation = { "rowSize": 5, "amountRows": 1 }
        const portraitOrientation = { "rowSize": 3, "amountRows": 1 }
        const nftDisplay = new NftDisplay({
            ids: ids,
            collectionAddress: collectionAddress,
            displayElement: contentElement,

            nftMetaData: nftMetaData,
            provider: this.provider,
            ipfsGateway: this.ipfsGateway,

            landscapeOrientation: landscapeOrientation,
            portraitOrientation: portraitOrientation,
            displayCollectionInfo: false
        })

        nftDisplay.displayNames({ redirect: true })
        await nftDisplay.showAttributes()
        //await nftDisplay.addImageDivsFunction((id, nftDisplay) => this.#showCriteriaNftDisplay(id, nftDisplay), false)
        await nftDisplay.createDisplay()

        // const nftsEl = document.createElement("div")
        // nftsEl.append(contentElement)
        return contentElement

    }

    /**
     * 
     * @param {CriteriaBuilder.criterionFormat} criterion 
     * @returns {HTMLElement[]}
     */
    async #createCriterionOverviewTableItems(criterion) {
        const criteriaEl = this.#createCriteriaElement(criterion)
        const amountEl = this.#createAmountElement(criterion)
        const collectionEl = this.#createCollectionElement(criterion)
        const nftsEl = this.#createNftsElement(criterion)


        let itemElements = [criteriaEl, amountEl, collectionEl, nftsEl]
        itemElements = await Promise.all(itemElements)
        itemElements.forEach((item) => item.className += " criteriaTableItem")
        return itemElements
    }

    async #confirmConflictResolutionHandler() {
        if (this.criteriaPerIdNoConflicts) {
            //clear previous elements incase there are some
            this.criteriaTableEl.querySelectorAll(".criteriaTableItem").forEach((el) => el.outerHTML = "")
            this.#resetDisplayStyleOfElements([this.distrobutionOverViewEl])
            this.#setDisplayStyleOfElements([this.dropBuilderConflictsEl], "none")
            let tableRows = []
            for (const criterion of this.criteriaBuilder.criteria) {
                const row = this.#createCriterionOverviewTableItems(criterion)
                Promise.resolve(row).then((result) => this.criteriaTableEl.append(...result))
                tableRows.push(row)
            }

            tableRows = await Promise.all(tableRows)
            //this.criteriaTableEl.append(...tableRows.flat())
        } else {
            throw new Error(`whoops tried to go to the next step but this.criteriaPerIdNoConflicts was set to: ${this.criteriaPerIdNoConflicts}`)
        }
    }

    convertCriteriaToBalances(criteria=this.criteriaBuilder.criteria) {
        const balancesPerCriteria = criteria.map((criterion)=>{
            const amountBigNum = ethers.utils.parseUnits(criterion.amountPerItem, this.erc20Units) 
            const collectionAddress = criterion.collectionAddress
            const ids = criterion.ids.filter((id)=>!criterion.excludedIds.includes(id))
            return ids.map((id)=>[collectionAddress, id.toString(), amountBigNum])
        })
        return balancesPerCriteria.flat()
    }

    async buildTreeAndProofsIpfs() {
        //TODO update the ui hash that is hardcoded in IpfsIndexer (and also dont harcode those things)
        const balances = this.convertCriteriaToBalances(this.criteriaBuilder.criteria)
        console.log(balances)
        //TODO ipfs :p
        //setTimeout(function(){(document.getElementById("progressProofGen").innerText = (`building merkle tree on: ${balances.length} claims.`))},100)
        const merkleBuilder = new MerkleBuilder(balances,this.provider)
        //setTimeout(function(){(document.getElementById("progressProofGen").innerText = (`done building tree, calculating all ${balances.length} proofs`))},100)
        await merkleBuilder.getAllProofsInChunks()
        //document.getElementById("progressProofGen").innerText = "done calculating proofs adding to ipfs"
    
        //add to ipfs
        const csvString = await merkleBuilder.exportBalancesCsv("",true)
        const idsPerCollection = JSON.stringify(merkleBuilder.getIdsPerCollection())

        //TODO create ipfsIndex
        //this.ipfsIndex = new IpfsIndexer()
        const claimDataHash = await this.ipfsIndexer.createMiladyDropClaimData(merkleBuilder.tree.dump(),merkleBuilder.allProofs, csvString,idsPerCollection,500)
        //document.getElementById("progressProofGen").innerText = `added claim to ipfs at: ${hash}`
        // const amounts = this.merkleBuilder.balances.map((x)=>ethers.utils.formatEther( x[2]).toString())
        // const totalTokens = amounts.map((x)=>parseFloat(x)).reduce((sum, number) => sum + number)
        //document.getElementById("totalAmountDrop").innerText = `total amount of tokens is: ${totalTokens} TODO do this with bigNumber math`
        return {claimDataHash:claimDataHash, merkleBuilder: merkleBuilder}
    }

    isWalletConnected(messageEl=this.messageEl) {
        let message = "";
        if (!this.signer) {
            message = "wallet not connected";
            console.log(message);
            messageEl.innerHTML = message;
            return false
        } else {
            messageEl.innerHTML = message;
            return true;
        }
    }

    async getLoveDropContractWithSigner() {
        if (!this.loveDropFactoryContract) {
            this.loveDropFactoryContract = new ethers.Contract(this.loveDropFactoryAddress, LoveDropFactoryAbi ,this.provider);
        }
        
        if (this.signer) {
            this.loveDropFactoryContract = await this.loveDropFactoryContract.connect(this.signer);
            return this.loveDropFactoryContract
        } else {
            throw Error(`this.signer undefined please connect wallet`)
        }

    }



    async #buildDropBtnHandler() {
        const {claimDataHash:claimDataHash, merkleBuilder: merkleBuilder} = await this.buildTreeAndProofsIpfs()
        this.claimDataIpfs = claimDataHash
        this.merkleBuilder = merkleBuilder

        this.progressProofGenEl.innerText = `claim data at: ipfs://${claimDataHash}`
       
        this.deployAirDropBtn.disabled = false

    }

    async #deployDropHandler() {
        await this.connectSigner()
        const merkleRoot = this.merkleBuilder.merkleRoot//ipfsIndex.metaData.merkleRoot;
        const claimDataIpfs = this.claimDataIpfs//ipfsIndex.dropsRootHash;
        const loveDropFactory = await this.getLoveDropContractWithSigner()
    
    
        if (this.isWalletConnected()) {
            var tx = loveDropFactory.createNewDrop(this.airdropTokenContractObj.address, merkleRoot, claimDataIpfs);
            this.txs.push(tx)
        }
        // message(`submitted transaction at: ${(await tx).hash}`);
        const confirmedTX = (await (await (await tx).wait(1)).transactionHash);
        const reciept = (await this.provider.getTransactionReceipt(confirmedTX));
        console.log(reciept.logs)
        //reciept.logs[0] = version number
        const deployedDropAddress = await ethers.utils.defaultAbiCoder.decode(["address"], reciept.logs[1].data)[0];
        this.progressProofGenEl.innerText = `Contract deployed at: ${deployedDropAddress}. At tx: ${confirmedTX}`
        // message(`confirmed transaction at: ${(await tx).hash}, deployed at: ${window.deployedDropAddress}`);
    

    }

    async #fundAirdropBtnHandler() {

    }
}
