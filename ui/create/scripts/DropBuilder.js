import { ethers } from "../../scripts/ethers-6.7.0.min.js"
import { NftDisplay } from "../../scripts/NftDisplay.js"
import { CriteriaBuilder } from "./CriteriaBuilder.js"
// import { NftMetaDataCollector } from "../../scripts/NftMetaDataCollector.js"
// import { FilterBuilder, filterTemplate } from "./FilterBuilder.js"
import { ERC20ABI } from "../../abi/ERC20ABI.js"
import { MerkleBuilder } from "../../scripts/MerkleBuilder.js"
import { allExtraMetaData } from "../../scripts/extraMetaData.js"
import { LoveDropFactoryAbi } from "../../abi/LoveDropFactoryAbi.js"
import { LoveDropAbi } from "../../abi/LoveDropAbi.js"




export class DropBuilder {
    criteriaBuilder
    erc20Units = 18 //TODO set this in u

    devsNftId = 6999
    devsNftContract = "0x5Af0D9827E0c53E4799BB226655A1de152A425a5" //milady maker :D wow cool!

    duplicatesNftDisplayId = "duplicatesNftDisplay"
    conflictResolutionSelector = document.getElementById("criteriaConflictsResolutionSelection")
    finalizeDropButton = document.getElementById("finalizeDropButton")


    backButtonEl = document.getElementById("backButtonDropBuilder")
    confirmConflictResolutionButtonEl = document.getElementById("confirmConflictResolutionButton")

    criteriaTableEl = document.getElementById("criteriaOverviewTable")
    //duplicatesManagerEl = document.getElementById("duplicatesManager")

    criteriaBuilderEl = document.getElementById("criteriaBuilder")
    dropBuilderEl = document.getElementById("dropBuilder")
    conflictsResolutionEl = document.getElementById("dropBuilderConflicts")
    distrobutionOverViewEl = document.getElementById("distrobutionOverView")
    deploymentEl = document.getElementById("deployment")
    giveDropToDevsEl = document.getElementById("giveDropToDevs")
    dropBuilderPages = [this.criteriaBuilderEl, this.conflictsResolutionEl, this.giveDropToDevsEl, this.distrobutionOverViewEl, this.deploymentEl]

    connectWallletBtn = document.getElementById("connectWalletBtn")

    giveDropToDevsNoBtn = document.getElementById("giveDropToDevsNo")
    giveDropToDevsYesBtn = document.getElementById("giveDropToDevsYes")
    devGiftMethodSelector = document.getElementById("devGiftAddingMethod")

    confirmDistrobutionBtn = document.getElementById("confirmDistrobutionBtn")
    airdropTokenContractAddressInput = document.getElementById("airdropTokenContractAddressInput")

    allCollectionsEl = document.getElementById("allCollections")
    allCriteriaNamesEl = document.getElementById("allCriteriaNames")


    confirmAndBuildDropBtn = document.getElementById("confirmAndBuildDrop")
    deployAirDropBtn = document.getElementById("deployAirDrop")
    fundAirdropBtn = document.getElementById("fundAirdrop")

    checkEnoughTokensBtn = document.getElementById("checkEnoughTokens")

    devGiftPercentInput = document.getElementById("devGiftPercentRange")
    devGiftAmountInput = document.getElementById("devGiftAmount")


    notEnoughTokensEl = document.getElementById("notEnoughTokens")
    dropBuilderMessageParent = document.getElementById("dropBuilderMessage")
    dropBuilderMessageContentEl = document.getElementById("dropBuilderMessageContent")
    
    collectionsSelectorEl = document.getElementById("preIndexedCollectionsSelector")
    criterionCollectionInput =  document.getElementById("nftContractAddressInput")

    amountOfDuplicates = 0

    //or do conflictResolutionSelectorHandler with a submit button but user might decide to go back anyway
    criteriaForConflictResolution = {}
    duplicatesNftDisplays = {}


    txs = []

    originalElementDisplayValues = this.getDisplayStylesFromElements(this.dropBuilderPages)

    // static mainChain = {
    //     chainId: "0x1",
    //     rpcUrls: ["https://eth.llamarpc.com"],
    //     chainName: "Ethereum Mainnet",
    //     nativeCurrency: {
    //         name: "Ethereum",
    //         symbol: "ETH",
    //         decimals: 18
    //     },
    //     //blockExplorerUrls: []
    // }

    static mainChain = {
        chainId: "0x7A69",
        rpcUrls: ["http://localhost:8555/"],
        chainName: "local fork Ethereum Mainnet",
        nativeCurrency: {
            name: "Ethereum",
            symbol: "ETH",
            decimals: 18
        },
        //blockExplorerUrls: []
    }



    constructor({ collectionAddress, provider, ipfsGateway, nftDisplayElementCriteriaBuilder, ipfsIndexer, loveDropFactoryAddress } = { collectionAddress: undefined, provider, ipfsGateway, nftDisplayElementCriteriaBuilder, loveDropFactoryAddress: "0xfCD69606969625390C79c574c314b938853e1061" }) {
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
        //this.dropBuilderEl.style.display = "none"
        this.selectDropBuilderPageIndex(0)
        //this.#setDisplayStyleOfElements(this.dropBuilderPages.slice(1), "none")

        //criteria overview buttpm
        this.finalizeDropButton.addEventListener("click", (event) => this.#selectDropBuilderPageEl(this.conflictsResolutionEl))//this.#showDropBuilderPageEl(this.dropBuilderConflictsEl))

        this.devGiftPercentInput.addEventListener("change", (event) => this.#giftDevPercentSliderHandler(event))
        this.devGiftAmountInput.addEventListener("change", (event) => this.#giftDevAmountHandler(event))
        this.giveDropToDevsNoBtn.addEventListener("click", (event) => this.#selectDropBuilderPageEl(this.distrobutionOverViewEl))
        this.giveDropToDevsYesBtn.addEventListener("click", async (event) => this.#giftDevYesButtonHandler())

        this.backButtonEl.addEventListener("click", async (event) => this.#dropBuilderBackBtnHandler())
        this.conflictResolutionSelector.addEventListener("change", (event) => this.#conflictResolutionSelectorHandler(event, this.criteriaPerIds))
        this.confirmConflictResolutionButtonEl.addEventListener("click", (event) => this.#confirmConflictResolutionHandler(event))



        this.confirmDistrobutionBtn.addEventListener("click", (event) => this.#selectDropBuilderPageEl(this.deploymentEl, event))

        this.airdropTokenContractAddressInput.addEventListener("keypress", (event) => this.#setTokenContractHandler(event))
        this.connectWallletBtn.addEventListener("click", () => this.connectSigner())

        this.confirmAndBuildDropBtn.addEventListener("click", () => this.#buildDropBtnHandler())
        this.deployAirDropBtn.addEventListener("click", () => this.#deployDropHandler())
        this.fundAirdropBtn.addEventListener("click", () => this.#fundAirdropBtnHandler())

        this.checkEnoughTokensBtn.addEventListener("click", () => this.#checkEnoughTokensHandler())


        this.collectionsSelectorEl.addEventListener("change", (event)=>{
            this.criterionCollectionInput.value = event.target.value
            const newEvent = new Event("keypress")
            newEvent.key = "Enter"
            this.criterionCollectionInput.dispatchEvent(newEvent)
        })

        this.#createNftSelectorOptions(allExtraMetaData)
        this.chainManagement()
    }

    #createNftSelectorOptions(metaData=allExtraMetaData) {
        for (const contractAddr in metaData) {
            const optionEl = document.createElement("option")
            optionEl.value = contractAddr
            optionEl.innerText = metaData[contractAddr].name
            this.collectionsSelectorEl.append(optionEl)
        }
        
    }

    async #criteriaBuilderPageFunc(currentPageIndex, selectedPageIndex) {

        const returnsToPage = currentPageIndex > selectedPageIndex
        if (returnsToPage) {
            //remove data created when users goes back and returns
            this.conflictResolutionSelector.value = "selectMethod"
            this.confirmConflictResolutionButtonEl.disabled = true
            await this.removeConflictResolutionCriteria()
        }


        //rerun filter
        if (this.criteriaBuilder.filterBuilder) {
            this.criteriaBuilder.filterBuilder.runFilter()
        }
    }

    async #conflictResolutionPageFunc(currentPageIndex, selectedPageIndex) {
        const returnsToPage = currentPageIndex > selectedPageIndex
        if (returnsToPage) {
            if (!this.amountOfDuplicates) {

                await this.#selectDropBuilderPageEl(this.criteriaBuilderEl)
            } else {
                if (this.conflictResolutionSelector.value === "selectMethod") {
                    this.confirmConflictResolutionButtonEl.disabled = true
                    await this.removeConflictResolutionCriteria()

                }
            }


        } else {
            this.criteriaBuilder.cleanupCriteria()

            //remove data created when users goes back and returns
            this.conflictResolutionSelector.value = "selectMethod"
            this.confirmConflictResolutionButtonEl.disabled = true
            await this.removeConflictResolutionCriteria()


            //process data
            const validCriteria = this.criteriaBuilder.criteria.filter((criterion) => this.#isValidCriterion(criterion))
            this.criteriaPerIds = this.getCriteriaPerId(validCriteria)

            //displayduplicates
            if (validCriteria.length) {
                var duplicates = this.getIdsWithDuplicateCriteria(this.criteriaPerIds)
                this.amountOfDuplicates = Object.keys(duplicates).reduce((total, collection) => total += Object.keys(duplicates[collection]).length, 0)
            }

            if (validCriteria.length && this.amountOfDuplicates > 0) {
                await this.displayDuplicates(duplicates)
            } else {
                //go to next step

                this.criteriaPerIdNoConflicts = this.criteriaPerIds

                await this.#confirmConflictResolutionHandler()
            }
        }
    }


    async #giveDropToDevsPageFunc(currentPageIndex, selectedPageIndex) {
        const returnsToPage = currentPageIndex > selectedPageIndex
        if (returnsToPage) {
            const devAllocCriterion = this.criteriaBuilder.criteria.find((criterion) => criterion.name === "dev_allocation_:D")

            //await this.removeConflictResolutionCriteria()
            if (devAllocCriterion) {
                await this.#removeDevAllocationCriterion()
            } else {
                const criterionWithDevsNft = this.criteriaBuilder.criteria.find((criterion) => criterion.collectionAddress === this.devsNftContract && criterion.ids.includes(this.devsNftId))
                if (criterionWithDevsNft) {
                    await this.selectDropBuilderPageIndex(selectedPageIndex - 1)
                }

            }
        } else {
            const criterionWithDevsNft = this.criteriaBuilder.criteria.find((criterion) => criterion.collectionAddress === this.devsNftContract && criterion.ids.includes(this.devsNftId))
            if (criterionWithDevsNft) {
                //go to next page since we already in the drop :)
                await this.selectDropBuilderPageIndex(selectedPageIndex + 1)
            } else {
                // add devs milady image to page if not there
                if (!document.getElementById("devsMilady")) {

                    const nftDisplayEl = await this.#createSingleNftDisplay(this.devsNftContract, this.devsNftId)
                    nftDisplayEl.className = "devsMilady"
                    nftDisplayEl.id = "devsMilady"
                    document.getElementById("giveDropToDevsNftDisplay").append(nftDisplayEl)
                }
                //updates amount according to current slider value and total airdrop amount
                this.#giftDevPercentSliderHandler({ "target": { "value": this.devGiftPercentInput.value } })
            }
        }
    }

    async #removeDevAllocationCriterion() {
        //TODO doesnt remove it somehow
        const criterion = this.criteriaBuilder.criteria.find((criterion) => criterion.name === "dev_allocation_:D")
        if (criterion) {
            await this.criteriaBuilder.filterBuilder.removeFilterByIndex(criterion.selectedFilter.index, criterion.collectionAddress)
            await this.criteriaBuilder.removeCriterionByIndex(criterion.index)
            //await this.criteriaBuilder.changeCurrentCriterion(0)
        }
    }

    async #distrobutionOverViewPageFunc() {
        //reset html table
        this.criteriaTableEl.querySelectorAll(".criteriaTableItem").forEach((el) => el.outerHTML = "")

        //this.#resetDisplayStyleOfElements([this.giveDropToDevsEl])
        //this.#setDisplayStyleOfElements([this.conflictsResolutionEl], "none")
        let tableRows = []
        const totalAirdrop = this.getTotalAirdrop()
        for (const criterion of this.criteriaBuilder.criteria) {
            const row = this.#createCriterionOverviewTableItems(criterion, totalAirdrop)
            Promise.resolve(row).then((result) => this.criteriaTableEl.append(...result))
            tableRows.push(row)
        }

        tableRows = await Promise.all(tableRows)
    }

    async #deploymentPageFunc() {
        //TODO if the contract is already deployed and not funded, the user wont be able to fund it and needs to deploy it again
        //TODO make a fix for this. example check if the claimdata hash is the same for the deployed contract
        //but you have to make sure the criteria the user saw on the last page matches the criteria in the contract they are funding
        //maybe handle case if criteria are different but contract is already deployed
        //or just make a wrapper contract that deploys and send token in 1 tx
        this.notEnoughTokensEl.hidden = true
        this.dropBuilderMessageContentEl.innerText = ""
        this.dropBuilderMessageParent.style.display = "none"

        this.merkleBuilder = undefined
        this.claimDataIpfs = undefined
        await this.setTotalsOverViewInfo()

    }

    async selectDropBuilderPageIndex(selectedPageIndex) {
        //cant go anywhere till user switches to the right network
        if (await DropBuilder.switchNetwork()) {



            //back: 
            // at criteriaBuilder: remove conflict res criteria (user shouldnt mess with that since it can get removed)
            //forward
            // criteria conflict: remove conflict res criteria, check if conflicts, no conflicts skip to next
            // criteria overview: reset html
            // 

            if (selectedPageIndex < 0) {
                selectedPageIndex = 0
            } else if (selectedPageIndex >= this.dropBuilderPages.length) {
                selectedPageIndex = this.dropBuilderPages.length - 1
            }

            //TODO cleanup
            if (selectedPageIndex > 0) { this.backButtonEl.hidden = false }
            else { this.backButtonEl.hidden = true }


            const currentPageIndex = this.dropBuilderPages.findIndex((el) => el.style.display !== "none")
            const selectedPage = this.dropBuilderPages[selectedPageIndex]

            const funcAtPage = {
                [this.criteriaBuilderEl.id]: async () => this.#criteriaBuilderPageFunc(currentPageIndex, selectedPageIndex),
                [this.conflictsResolutionEl.id]: async () => this.#conflictResolutionPageFunc(currentPageIndex, selectedPageIndex),
                [this.giveDropToDevsEl.id]: async () => this.#giveDropToDevsPageFunc(currentPageIndex, selectedPageIndex),
                [this.distrobutionOverViewEl.id]: async () => this.#distrobutionOverViewPageFunc(),
                [this.deploymentEl.id]: async () => this.#deploymentPageFunc(),
            }
            //just so every page has a function
            this.dropBuilderPages.forEach((page) => { if (!(page.id in funcAtPage)) { funcAtPage[page.id] = () => { }; } })



            const otherPages = this.dropBuilderPages.toSpliced(selectedPageIndex, 1)
            this.#setDisplayStyleOfElements(otherPages, "none")
            this.#resetDisplayStyleOfElements([selectedPage])

            await funcAtPage[selectedPage.id](currentPageIndex, selectedPageIndex)
        }



    }

    async #selectDropBuilderPageEl(element) {
        const pageIndex = this.dropBuilderPages.findIndex((el) => el.id === element.id)
        if (pageIndex === -1) {
            throw Error(`element id ${element.id} is not in dropBuilderPages array: ${this.dropBuilderPages.map((x) => x.id)}`)
        }
        await this.selectDropBuilderPageIndex(pageIndex)
    }

    async #dropBuilderBackBtnHandler() {
        const currentPage = this.dropBuilderPages.findIndex((el) => el.style.display !== "none")
        await this.selectDropBuilderPageIndex(currentPage - 1)
        return

        if (this.dropBuilderPages[currentPage - 1] === this.conflictsResolutionEl) {
            const duplicates = this.getIdsWithDuplicateCriteria(this.criteriaPerIds)
            const amountOfDuplicates = Object.keys(duplicates).reduce((total, collection) => total += Object.keys(duplicates[collection]).length, 0)
            if (amountOfDuplicates === 0) {
                await this.selectDropBuilderPageIndex(currentPage - 2)
            } else {
                await this.selectDropBuilderPageIndex(currentPage - 1)
            }

        } else if (this.dropBuilderPages[currentPage] === this.conflictsResolutionEl) {
            await this.removeConflictResolutionCriteria()

        }
        if (this.dropBuilderPages[currentPage] === this.deploymentEl) {
            //TODO if the contract is already deployed and not funded, the user wont be able to fund it and needs to deploy it again
            //TODO make a fix for this. example check if the claimdata hash is the same for the deployed contract
            //but you have to make sure the criteria the user saw on the last page matches the criteria in the contract they are funding
            //maybe handle case if criteria are different but contract is already deployed
            //or just make a wrapper contract that deploys and send token in 1 tx
            this.fundAirdropBtn.disabled = true
            this.deployAirDropBtn.disabled = true
            await this.selectDropBuilderPageIndex(currentPage - 1)
        } else if (currentPage !== -1) {
            await this.selectDropBuilderPageIndex(currentPage - 1)
        }

    }

    //TODO clean this mess up
    async toggleFinalizeDropView(forceConflictResPage = false) {
        if (this.dropBuilderEl.style.display === "none" || forceConflictResPage === true) {
            //toggle display
            await this.#selectDropBuilderPageEl(this.conflictsResolutionEl)

            //remove data created when users goes back and returns
            this.conflictResolutionSelector.value = "selectMethod"
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
            await this.#selectDropBuilderPageEl(this.criteriaBuilderEl)

            // this.#setDisplayStyleOfElements([this.dropBuilderEl, this.distrobutionOverViewEl, this.dropBuilderConflictsEl], "none")
            // this.#resetDisplayStyleOfElements([this.criteriaBuilderEl])

            //rerun filter
            if (this.criteriaBuilder.filterBuilder) {
                this.criteriaBuilder.filterBuilder.runFilter()
            }
        }
    }


    async chainManagement() {

        //TODO this will only trigger after the ether.provider is used to interact with the chain
        //which means that the first interaction is with the wrong chain
        //await this.provider["provider"].on("chainChanged",async (networkId) => {
        //new ethers.BrowserProvider(window.ethereum).provider["provider"].on('chainChanged', async (networkId) => {
        if (window.ethereum) {
            window.ethereum.on('chainChanged', async (networkId) => {
                if (networkId !== DropBuilder.mainChain.chainId) {
                    await DropBuilder.switchNetwork(DropBuilder.mainChain)
                    console.warn("network changed TODO handle this")
                }
            })
        } else {
            console.warn("window.ethereum not found. cant prevent network switching. this may cause error")
        }



        await DropBuilder.switchNetwork(DropBuilder.mainChain)


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
        await DropBuilder.switchNetwork()
        const value = this.#isValidSubmitEvent(event, this.airdropTokenContractAddressInput)
        if (value) {
            if (ethers.isAddress(value)) {
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
        await DropBuilder.switchNetwork(DropBuilder.mainChain)
        await this.provider.send("eth_requestAccounts", []);
        this.signer = await window.provider.getSigner();
        await this.#runOnConnectWallet()
    }

    static async switchNetwork(network = DropBuilder.mainChain) {
        let result
        try {
            result = await window.provider.send("wallet_switchEthereumChain", [{ chainId: network.chainId }]);

        } catch (switchError) {
            if (switchError.code === 'ACTION_REJECTED') {
                console.warn("user rejected switching network")
                return false
            }
            window.switchError = switchError
            // This error code indicates that the chain has not been added to MetaMask.
            if ("error" in switchError) {
                if (switchError.error.code === -32002) {
                    console.warn("user is already switching chains")
                    return false
                }


                if (switchError.error.code === 4902) {
                    try {
                        result = await window.provider.send("wallet_addEthereumChain", [network]);

                    } catch (addError) {
                        //TODO assumes error is the same as switch network (prob not metamask is inconsistent :( ))
                        if (switchError.code === 'ACTION_REJECTED') {
                            console.warn("user rejected adding network")
                            return false
                        }

                        // handle "add" error
                    }
                }
            }
            // handle other "switch" errors
        }
        return true

    }

    async #runOnConnectWallet() {
        await Promise.all([this.#setUserAddress(), this.#setUserBalance()])
    }

    async #setUserBalance() {
        if (this.airdropTokenContractObj) {
            const userAddress = await this.signer.getAddress()
            const userBalance = this.airdropTokenContractObj.balanceOf(userAddress)
            userBalance.then((balance) => {
                const formattedBalance = this.formatNumber(balance)
                document.querySelectorAll(".erc20UserBalance").forEach((x) => x.innerText = formattedBalance)
            })
            return await userBalance
        }

    }

    async #setUserAddress() {
        const userAddress = this.signer.getAddress()
        userAddress.then((address) => {
            document.querySelectorAll(".userAddress").forEach((x) => x.innerText = address)
        })
        return await userAddress
    }

    async #createCollectionHrefs() {
        const allCollectionsAddresses = [...new Set(this.criteriaBuilder.criteria.map((x) => x.collectionAddress))]
        const names = allCollectionsAddresses.map(async (address) => await (await this.criteriaBuilder.filterBuilder.getNftMetaData(address)).getContractName())
        const nameElements = (await Promise.all(names)).map((name, index) => {
            const address = allCollectionsAddresses[index]
            const nameElement = document.createElement("a")
            nameElement.innerText = name
            nameElement.href = `https://etherscan.io/address/${address}`
            nameElement.target = "_blank"
            return nameElement
        })



        return nameElements

    }

    /**
     * 
     * @returns {bigint}
     */
    getTotalAirdrop(criteria = this.criteriaBuilder.criteria) {
        const totalBigNum = criteria.reduce((total, criterion) => {
            const amountPerItem = ethers.parseUnits(criterion.amountPerItem, this.erc20Units)
            const totatAmountCriterion = amountPerItem * BigInt(criterion.ids.length - criterion.excludedIds.length)
            return totatAmountCriterion + total
        }, 0n)

        return totalBigNum
    }

    async setTotalsOverViewInfo() {

        if (this.airdropTokenContractObj) {
            let allResults = []

            //set info
            document.querySelectorAll(".tokenContractHref").forEach((x) => {
                x.innerText = this.airdropTokenContractObj.target;
                x.href = `https://etherscan.io/token/${this.airdropTokenContractObj.target}`;
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
                const formattedSupply = this.formatNumber(supply)
                document.querySelectorAll(".totalsupply").forEach((x) => x.innerText = formattedSupply)
            });


            const collectionNames = this.#createCollectionHrefs()
            collectionNames.then((names) => {
                const namesWithSpacing = names.map((x) => [x, ", "]).flat().toSpliced(-1, 1)
                this.allCollectionsEl.innerHTML = ""
                this.allCollectionsEl.append(...namesWithSpacing)
            });

            const totalAirdrop = this.formatNumber(this.getTotalAirdrop())
            document.querySelectorAll(".totalAirdrop").forEach((x) => x.innerText = totalAirdrop)

            this.allCriteriaNamesEl.innerText = this.criteriaBuilder.criteria.map((x) => x.name).toString()


            await this.connectSigner()
            if (this.signer) {
                await this.#setUserBalance()
            }

            allResults = [...allResults, contractName, contractTicker, totalSupply, collectionNames]
            return await Promise.all(allResults)
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
        //await this.#selectDropBuilderPageEl(this.conflictsResolutionEl)

        //display
        for (const rawCollectionAddress in duplicates) {
            const collectionAddress = ethers.getAddress(rawCollectionAddress)
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
        const nftMetaData = await this.criteriaBuilder.filterBuilder.getNftMetaData(collectionAddress)
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
        await nftDisplay.initialize()
        await  nftDisplay.createDisplay()

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
                        const amountPerItem = ethers.parseUnits(criterion.amountPerItem, this.erc20Units)
                        return amountPerItem + partialSum

                    }, 0n //1n
                )
                return [parseInt(id), ethers.formatUnits(total, this.erc20Units)]
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
                //TODO do this without updating DOM?
                //await this.criteriaBuilder.changeCurrentCriterion(currentCriterion.index)
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
                        const name = `overlappingCriteria-${allCriterionNames}`
                        await this.criteriaBuilder.updateCriterionName(newCriterion.index, name)
                        this.criteriaBuilder.filterBuilder.changeFilterName(name, newCriterion.selectedFilter.index)

                        //set amount
                        const amountBigNumber = criteriaIndexesOfId.reduce(
                            (partialSum, index) => {
                                const amountPerItem = ethers.parseUnits(this.criteriaBuilder.criteria[index].amountPerItem, this.erc20Units)
                                return amountPerItem + partialSum
                            }, 0n
                        )
                        newCriterion.amountPerItem = ethers.formatUnits(amountBigNumber, this.erc20Units)

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
        const contractName = await (await this.criteriaBuilder.filterBuilder.getNftMetaData(criterion.collectionAddress)).getContractName()

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
    formatNumber(number) {
        return new Intl.NumberFormat('en-EN').format(ethers.formatUnits(number, this.erc20Units))
    }

    // /**
    //  * uses ethers parseUnits get a bigInt based on the current this.erc20Units 
    //  * @param {Number|String|BigInt} number 
    //  * @returns {String} number
    //  */
    // pareseNumber(number) {
    //         return new Intl.NumberFormat('en-EN').parse(ethers.formatUnits(number,this.erc20Units))
    //     }

    #createAmountElement(criterion, totalAirdrop) {
        const contentElement = document.createElement("div")
        //we doing big numbers B)
        const amountPerItem = ethers.parseUnits(criterion.amountPerItem, this.erc20Units)
        const totalAmount = amountPerItem * BigInt((criterion.ids.length - criterion.excludedIds.length))
        const percentTotal = 100 * (parseFloat(totalAmount) / parseFloat(totalAirdrop))
        const percentPerItem = 100 * (parseFloat(amountPerItem) / parseFloat(totalAirdrop))
        let precentPerItem
        if (totalAmount) {
            precentPerItem = 100 * (parseFloat(amountPerItem) / parseFloat(totalAirdrop))

        } else {
            precentPerItem = 0
        }

        const totalPercentElement = document.createElement("span")
        totalPercentElement.contentEditable = "true"
        totalPercentElement.innerText = `${Math.round(percentTotal * 1000) / 1000}`
        totalPercentElement.className = "amountTotallPercentage"

        const perItemPercentElement = document.createElement("span")
        //perItemPercentElement.contentEditable = "true"
        perItemPercentElement.innerText = `${Math.round(percentPerItem * 1000) / 1000}`
        perItemPercentElement.className = "amountPerItemPercentage"

        const totalElement = document.createElement("span")
        totalElement.contentEditable = "true"
        totalElement.innerText = `${this.formatNumber(totalAmount)}`
        totalElement.className = "amountTotall"

        const perItemElement = document.createElement("span")
        perItemElement.contentEditable = "true"
        perItemElement.innerText = `${this.formatNumber(amountPerItem)}`
        perItemElement.className = "amountPerItem"
        perItemElement.id = "testTODO"


        contentElement.append(
            `total: `, totalElement, ` (`, totalPercentElement, `%)`,
            document.createElement("br"),
            `per NFT: `, perItemElement, ` (`, perItemPercentElement, `%)`
        )
        contentElement.className = `amountsCriterion ${criterion.index}`
        const amountElement = document.createElement("div")
        amountElement.append(contentElement)


        perItemElement.addEventListener("input", (event) => this.#updateCriterionAmountPerItemElement(event, criterion, perItemElement))
        totalElement.addEventListener("input", (event) => this.#updateCriterionTotalAmount(event, criterion, totalElement))
        totalPercentElement.addEventListener("input", (event) => this.#updateCriterionTotalAmountPercentHandler(event, criterion, totalPercentElement))
        return amountElement
    }

    #resetInputValue(element, prevValue, units = this.erc20Units) {
        const prevCursorPos = window.getSelection().getRangeAt(0).startOffset - 1
        element.innerText = prevValue
        //focus is lost once innerText is set
        //const textLen = element.innerText.length
        const range = document.createRange();
        const sel = window.getSelection();

        const textLen = element.innerText.length
        if (prevCursorPos > textLen || prevCursorPos < 0) {
            range.setStart(element.childNodes[0], textLen);
        } else {
            range.setStart(element.childNodes[0], prevCursorPos);
        }

        sel.removeAllRanges();
        sel.addRange(range);
        element.focus();
    }

    #cleanNumberInputEditableElement(element, prevValue = 0n, units = this.erc20Units) {
        const noWhiteSpaces = element.innerText.replace(/\s/g, '')
        if (noWhiteSpaces !== element.innerText) {
            element.innerText = noWhiteSpaces
        }

        //wrong value? => reset to prev value
        if (isNaN(element.innerText)) {
            //const formattedPrevValue = (this.#roundNumber(ethers.formatUnits(prevValue, units), 4))
            this.#resetInputValue(element, prevValue, units)
            return prevValue
        }

        //no value?
        if (element.innerText) {
            //use value and parse it
            return element.innerHTML
        } else {
            //set to 0
            element.innerText = "0"
            return element.innerText
        }

    }

    /**
     * 
     * @param {CriteriaBuilder.criterion} criterion 
     * @param {BigInt} newAmount 
     * @param {Element} contentElement 
     */
    #updateCriterionAmountPerItemElement(event, criterion, perItemElement, contentElement) {
        const prevAmount = ethers.parseUnits(criterion.amountPerItem, this.erc20Units)
        const formattedPrevAmount = this.#roundNumber(ethers.formatUnits(prevAmount, this.erc20Units), 4)
        const newAmount = ethers.parseUnits(this.#cleanNumberInputEditableElement(perItemElement, formattedPrevAmount.toString()), this.erc20Units)

        criterion.amountPerItem = ethers.formatUnits(newAmount, this.erc20Units)

        const otherCriteria = this.criteriaBuilder.criteria.filter((otherCriterion) => otherCriterion !== criterion)
        this.#updateCriteriaAmountsTable({ criteria: otherCriteria })
        this.#updateCriteriaAmountsTable({ criteria: [criterion], skipClasses: ["amountPerItem"] })
    }




    #updateCriterionTotalAmount(event, criterion, totalAmountElement) {
        const amountOfItems = BigInt((criterion.ids.length - criterion.excludedIds.length))
        const prevTotalAmount = amountOfItems * ethers.parseUnits(criterion.amountPerItem, this.erc20Units)
        const formattedPrevAmount = this.#roundNumber(ethers.formatUnits(prevTotalAmount, this.erc20Units), 4)
        const newTotalAmount = ethers.parseUnits(this.#cleanNumberInputEditableElement(totalAmountElement, formattedPrevAmount.toString()), this.erc20Units)
        //TODO check edge cases on rounding errors (dividing to bigInts)
        criterion.amountPerItem = ethers.formatUnits(newTotalAmount / amountOfItems, this.erc20Units)

        const otherCriteria = this.criteriaBuilder.criteria.filter((otherCriterion) => otherCriterion !== criterion)
        this.#updateCriteriaAmountsTable({ criteria: otherCriteria })
        this.#updateCriteriaAmountsTable({ criteria: [criterion], skipClasses: ["amountTotall"] })
    }


    /**
     * 
     * @param {Event} event 
     * @param {CriteriaBuilder.criterionFormat} criterion TODO criteriontype
     * @param {HTMLElement} totalAmountPercentElement 
     */
    #updateCriterionTotalAmountPercentHandler(event, criterion, totalAmountPercentElement, units = this.erc20Units) {
        //get prevPercentage
        //TODO this is calculated twice (also inside updateCriterionTotalAmountByPercent())
        //but not that its not that intense (accept for the getTotalAirdrop() call)
        const amountOfItems = BigInt((criterion.ids.length - criterion.excludedIds.length))
        const prevTotalAmount = amountOfItems * ethers.parseUnits(criterion.amountPerItem, this.erc20Units)
        const prevTotalDrop = this.getTotalAirdrop()
        const prevPercentage = this.#roundNumber((parseFloat(prevTotalAmount) / parseFloat(prevTotalDrop)) * 100, 4)

        //get newPercentage
        let newTotalAmountPercent = this.#cleanNumberInputEditableElement(totalAmountPercentElement, prevPercentage.toString(), units)

        //handle <0% and >100% inputs
        if (newTotalAmountPercent < 0) {
            this.#resetInputValue(totalAmountPercentElement, "0", units)
            newTotalAmountPercent = 0
            //100% causes some criteria to go negative due to rounding error
        } else if (newTotalAmountPercent > 99.999) {
            this.#resetInputValue(totalAmountPercentElement, "99.99", units)
            newTotalAmountPercent = 99.99
        }

        this.updateCriterionTotalAmountByPercent(newTotalAmountPercent, criterion)


    }

    updateCriterionTotalAmountByPercent(newTotalAmountPercent, criterion) {
        const amountOfItems = BigInt((criterion.ids.length - criterion.excludedIds.length))
        const prevTotalAmount = amountOfItems * ethers.parseUnits(criterion.amountPerItem, this.erc20Units)
        const prevTotalDrop = this.getTotalAirdrop()
        const prevPercentage = this.#roundNumber((parseFloat(prevTotalAmount) / parseFloat(prevTotalDrop)) * 100, 4)

        //calculate new criterion.amountPerItem 
        const newTotalAmount = BigInt(parseFloat(prevTotalDrop) * (newTotalAmountPercent / 100))
        const totalAmountDifference = (prevTotalAmount - newTotalAmount)
        console.log("prevTotalAmount", prevTotalAmount)
        console.log("newTotalAmount ", newTotalAmount)

        const otherCriteria = this.criteriaBuilder.criteria.filter((otherCriterion) => otherCriterion !== criterion)
        //make sure it's a new value 
        //(sometimes can still be different because of rounding error totalAmountDifference)
        if (newTotalAmountPercent !== prevPercentage.toString()) {
            //set selected criterion
            criterion.amountPerItem = ethers.formatUnits(newTotalAmount / amountOfItems, this.erc20Units)
            //set other criteria
            this.#splitAmountOverCriteria({ criteria: otherCriteria, amount: totalAmountDifference })
        }

        //update ui
        this.#updateCriteriaAmountsTable({ criteria: otherCriteria })
        this.#updateCriteriaAmountsTable({ criteria: [criterion], skipClasses: ["amountTotallPercentage"] })

        //***************debug********** */

        //TODO the total changes slightly because of rounding error with bigInt
        //when the user increases the percentage, it creates a slightly higher total
        //this creates the most annoying ux since the user might not have enought tokens for the drop
        //distributing the difference accross all ids is still not a options since that still creates additional errors
        //this is issue probably cant be solved since you cant perfectly divide intergers 
        //
        //best way to deal with it is to only distribute the difference (maybe 2x it) if its negative (newTotal>oldTotal) 
        //so the new total is never bigger then the old. But errors can then still build up
        const newTotalAirdrop = this.getTotalAirdrop()
        const totalAmountItems = this.criteriaBuilder.criteria.reduce((total, criterion) => {
            const amountItems = (criterion.ids.length - criterion.excludedIds.length)
            return total + amountItems
        }, 0)

        const difference = prevTotalDrop - newTotalAirdrop
        console.log("prev totaldrop= ", ethers.formatUnits(prevTotalDrop, this.erc20Units))
        console.log("new totaldrop= ", ethers.formatUnits(newTotalAirdrop, this.erc20Units))
        console.log("difference: ", prevTotalDrop - newTotalAirdrop)
        console.log("difference per item: ", BigInt(Math.round(parseFloat(difference) / totalAmountItems)))
        console.log("total amount items in drop: ", totalAmountItems)
    }

    #giftDevPercentSliderHandler(event) {
        const percentage = parseFloat(event.target.value)
        const totalDrop = ethers.formatUnits(this.getTotalAirdrop(), this.erc20Units)
        this.devGiftAmountInput.value = totalDrop * percentage / 100
    }

    #giftDevAmountHandler(event) {
        const amount = parseFloat(event.target.value)
        const totalDrop = ethers.formatUnits(this.getTotalAirdrop(), this.erc20Units)
        const percent = amount / totalDrop * 100
        if (percent < 2) {
            this.devGiftPercentInput.value = percent

        } else {
            this.devGiftAmountInput.value = totalDrop * 2 / 100
            this.devGiftPercentInput.value = "2"
        }
        document.getElementById("devGiftPercentRangeDisplay").innerText = this.devGiftPercentInput.value
        //this.devGiftAmountInput.dispatchEvent(new Event("change"))
    }

    async #giftDevYesButtonHandler() {
        //TODO make handler for no so it removes the critierion
        const amount = this.devGiftAmountInput.value
        const criterionName = "dev_allocation_:D"
        let otherCriteria = []
        const existingCriterionIndex = this.criteriaBuilder.criteria.findIndex((criterion) => criterion.name === criterionName)
        const oldTotal = this.getTotalAirdrop()

        if (existingCriterionIndex !== -1) {
            otherCriteria = this.criteriaBuilder.criteria.toSpliced(existingCriterionIndex, 1)
            const existingCriterion = this.criteriaBuilder.criteria[existingCriterionIndex]
            existingCriterion.amountPerItem = amount
        } else {
            const newCriterion = await this.createCriterionWithIds(this.devsNftContract, [this.devsNftId], criterionName)
            newCriterion.amountPerItem = amount
            otherCriteria = this.criteriaBuilder.criteria.toSpliced(newCriterion.index, 1)
        }

        if (this.devGiftMethodSelector.value === "take") {
            const amountOther = oldTotal - ethers.parseUnits(amount, this.erc20Units)
            this.#splitAmountOverCriteria({ criteria: otherCriteria, amount: amountOther })
        }


        await this.#selectDropBuilderPageEl(this.distrobutionOverViewEl)
    }

    #splitAmountOverCriteria({ criteria = this.criteriaBuilder.criteria, amount, units = this.erc20Units }) {
        //TODO rounding error might be significant
        const totalAllCriteria = this.getTotalAirdrop(criteria)
        for (const criterion of criteria) {
            const amountOfItems = BigInt((criterion.ids.length - criterion.excludedIds.length))
            //no items nothing to distribute (prevents 0 division error)
            if (amountOfItems) {
                //what if some criterion have 0 per item but some dont?
                if (ethers.parseUnits(criterion.amountPerItem, units) !== 0n) {
                    const totalAmountCriterion = amountOfItems * ethers.parseUnits(criterion.amountPerItem, units)
                    const amountAddedCriterion = parseFloat(amount) * (parseFloat(totalAmountCriterion) / parseFloat(totalAllCriteria))
                    const newAmountPerItem = ethers.parseUnits(criterion.amountPerItem, units) + (BigInt(amountAddedCriterion) / amountOfItems)
                    criterion.amountPerItem = ethers.formatUnits(newAmountPerItem, units)

                }
            }
        }
    }

    #updateCriteriaAmountsTable({ criteria = this.criteriaBuilder.criteria, skipClasses = [] }) {
        for (const criterion of criteria) {
            const totalAirdrop = this.getTotalAirdrop()

            //get amounts
            const amountPerItem = ethers.parseUnits(criterion.amountPerItem, this.erc20Units)
            const totalAmount = amountPerItem * BigInt((criterion.ids.length - criterion.excludedIds.length))

            let percentTotal
            let percentPerItem
            if (totalAmount) {
                percentTotal = 100 * (parseFloat(totalAmount) / parseFloat(totalAirdrop))
                percentPerItem = 100 * (parseFloat(amountPerItem) / parseFloat(totalAirdrop))
            } else {
                percentTotal = 0
                percentPerItem = 0
            }
            //TODO use this.formatnumber and fix that function to round 4 decimals
            const formattedValuesPerClass = {
                "amountPerItem": this.#roundNumber(ethers.formatUnits(amountPerItem, this.erc20Units), 4),
                "amountTotall": this.#roundNumber(ethers.formatUnits(totalAmount, this.erc20Units), 4),
                "amountTotallPercentage": this.#roundNumber(percentTotal, 4),
                "amountPerItemPercentage": this.#roundNumber(percentPerItem, 4)
            }

            //update ui
            //TODO totall is mispelled as total (amountTotal, amountTotallPercentage)
            const classNames = ["amountPerItem", "amountTotall", "amountTotallPercentage", "amountPerItemPercentage"]
            const amountsElement = document.getElementsByClassName(`amountsCriterion ${criterion.index}`)[0]
            if (amountsElement) {
                for (const className of classNames) {
                    if (!skipClasses.includes(className)) {
                        amountsElement.getElementsByClassName(className)[0].innerText = formattedValuesPerClass[className]
                    }

                }

            } else {
                console.info(`"amountsCriterion ${criterion.index}" element wasn't found`)
            }

        }
    }

    #roundNumber(number, decimals) {
        return Math.round(number * 10 ** decimals) / 10 ** decimals

    }


    async #createNftsElement(criterion) {
        const ids = criterion.ids.filter((id) => criterion.excludedIds.indexOf(id) === -1)
        const collectionAddress = ethers.getAddress(criterion.collectionAddress)
        const contentElement = document.createElement("div")
        const nftMetaData = await this.criteriaBuilder.filterBuilder.getNftMetaData(collectionAddress)
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
            collectionInfoFlag: false
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
    async #createCriterionOverviewTableItems(criterion, totalAirdrop) {
        const criteriaEl = this.#createCriteriaElement(criterion)
        const amountEl = this.#createAmountElement(criterion, totalAirdrop)
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
            this.#selectDropBuilderPageEl(this.giveDropToDevsEl)

            //this.criteriaTableEl.append(...tableRows.flat())
        } else {
            throw new Error(`whoops tried to go to the next step but this.criteriaPerIdNoConflicts was set to: ${this.criteriaPerIdNoConflicts}`)
        }
    }

    convertCriteriaToBalances(criteria = this.criteriaBuilder.criteria) {
        const balancesPerCriteria = criteria.map((criterion) => {
            const amountBigNum = ethers.parseUnits(criterion.amountPerItem, this.erc20Units)
            const collectionAddress = criterion.collectionAddress
            const ids = criterion.ids.filter((id) => !criterion.excludedIds.includes(id))
            return ids.map((id) => [collectionAddress, id.toString(), amountBigNum.toString()])
        })
        return balancesPerCriteria.flat()
    }

    async runFuncInTimout(func, timeOutTime, funcVars = []) {
        return await new Promise((resolve) => {
            setTimeout(async () => {
                resolve(await func(...funcVars));
            }, timeOutTime);
        });

    }

    async buildTreeAndProofsIpfs() {
        this.dropBuilderMessageContentEl.innerText = `Building merkle tree`
        //TODO update the ui hash that is hardcoded in IpfsIndexer (and also dont harcode those things)
        const balances = this.convertCriteriaToBalances(this.criteriaBuilder.criteria)

        //to make sure the message `Building merkle tree` is rendered since initializing MerkleBuilder can take a long time
        const merkleBuilder = await this.runFuncInTimout(() => new MerkleBuilder(balances, this.provider, this.dropBuilderMessageContentEl), 100)

        this.dropBuilderMessageContentEl.innerText = `generating proofs`

        //setTimeout(function(){(document.getElementById("progressProofGen").innerText = (`done building tree, calculating all ${balances.length} proofs`))},100)
        await this.runFuncInTimout(async () => await merkleBuilder.getAllProofsInChunks(), 100)
        //document.getElementById("progressProofGen").innerText = "done calculating proofs adding to ipfs"

        //add to ipfs
        const csvString = await merkleBuilder.exportBalancesCsv("", true)

        const idsPerCollection = merkleBuilder.getIdsPerCollection()
        // const idsPerCollectionAmountAsString = Object.fromEntries(
        //     Object.keys(idsPerCollection).map((collection) => {
        //         const amountPerIdEntries = Object.keys(idsPerCollection[collection]).map((id) => [id, idsPerCollection[collection][id].toString()])
        //         return [collection, amountPerIdEntries]
        //     })
        // )
        const idsPerCollectionString = JSON.stringify(idsPerCollection)
        const totalDropBigNumber = this.getTotalAirdrop()
        const dropMetaData = { "totalDrop": this.formatNumber(totalDropBigNumber), "totalDropBigNumber": this.getTotalAirdrop().toString() }

        //TODO create ipfsIndex
        //this.ipfsIndex = new IpfsIndexer()

        //TODO!! do with named args like {}
        const claimDataHash = await this.ipfsIndexer.createMiladyDropClaimData(merkleBuilder.tree.dump(), merkleBuilder.allProofs, csvString, idsPerCollectionString, dropMetaData, 500)
        //document.getElementById("progressProofGen").innerText = `added claim to ipfs at: ${hash}`
        // const amounts = this.merkleBuilder.balances.map((x)=>ethers.formatEther( x[2]).toString())
        // const totalTokens = amounts.map((x)=>parseFloat(x)).reduce((sum, number) => sum + number)
        //document.getElementById("totalAmountDrop").innerText = `total amount of tokens is: ${totalTokens} TODO do this with bigNumber math`
        return { claimDataHash: claimDataHash, merkleBuilder: merkleBuilder }
    }

    isWalletConnected(messageEl = this.dropBuilderMessageContentEl) {
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
            this.loveDropFactoryContract = new ethers.Contract(this.loveDropFactoryAddress, LoveDropFactoryAbi, this.provider);
        }

        if (this.signer) {
            this.loveDropFactoryContract = await this.loveDropFactoryContract.connect(this.signer);
            return this.loveDropFactoryContract
        } else {
            throw Error(`this.signer undefined please connect wallet`)
        }

    }



    async #buildDropBtnHandler() {
        this.dropBuilderMessageParent.style.display = "block"
        await DropBuilder.switchNetwork()
        const { claimDataHash: claimDataHash, merkleBuilder: merkleBuilder } = await this.buildTreeAndProofsIpfs()


        this.claimDataIpfs = claimDataHash
        this.merkleBuilder = merkleBuilder

        this.dropBuilderMessageContentEl.innerText = `
        Succefully data uploaded at: ipfs://${claimDataHash}\n
        You can now deploy the contract! :)
        `

        await this.connectSigner()
        const totalAirdrop = this.getTotalAirdrop()
        const userAddress = await this.signer.getAddress()
        const userBalance = await this.airdropTokenContractObj.balanceOf(userAddress)

        if (totalAirdrop > userBalance) {
            //update values in ui just in case
            document.querySelectorAll(".totalAirdrop").forEach((x) => x.innerText = this.formatNumber(totalAirdrop))
            document.querySelectorAll(".erc20UserBalance").forEach((x) => x.innerText = this.formatNumber(userBalance))

            //show message user doesnt have enough
            this.notEnoughTokensEl.hidden = false
            this.notEnoughTokensEl.style.opacity = 1
        } else {
            //enable deploy button when user has enough
            this.deployAirDropBtn.disabled = false
        }
    }



    async #deployDropHandler() {
        this.dropBuilderMessageParent.style.display = "block"
        await DropBuilder.switchNetwork()
        if (await this.checkEnoughTokens()) {
            const merkleRoot = this.merkleBuilder.merkleRoot//ipfsIndex.metaData.merkleRoot;
            const claimDataIpfs = this.claimDataIpfs//ipfsIndex.dropsRootHash;
            const loveDropFactory = await this.getLoveDropContractWithSigner()


            if (this.isWalletConnected()) {
                console.log("creating new drop with params:",this.airdropTokenContractObj.target, merkleRoot, claimDataIpfs)
                var tx = loveDropFactory.createNewDrop(this.airdropTokenContractObj.target, merkleRoot, claimDataIpfs);
                this.txs.push(tx)

            }
            // message(`submitted transaction at: ${(await tx).hash}`);
            const confirmedTX = (await (await (await tx).wait(1)).hash);
            const reciept = (await this.provider.getTransactionReceipt(confirmedTX));
            console.log(reciept.logs)
            //reciept.logs[0] = version number
            const deployedDropAddress = await ethers.AbiCoder.defaultAbiCoder().decode(["address"], reciept.logs[1].data)[0];

            this.deployedLoveDrop = new ethers.Contract(deployedDropAddress, LoveDropAbi, this.provider);

            this.dropBuilderMessageContentEl.innerText = `
            Contract deployed at: ${deployedDropAddress}. At tx: ${confirmedTX} \n
            Please send the tokens to the contract (click the button below)
            `
            this.deployedDropAddress = deployedDropAddress
            // message(`confirmed transaction at: ${(await tx).hash}, deployed at: ${window.deployedDropAddress}`);
            this.fundAirdropBtn.disabled = false
            this.airdropTokenContractAddressInput.disabled = true
        }
    }

    async checkEnoughTokens() {
        await this.connectSigner()
        const totalAirdrop = this.getTotalAirdrop()
        const userAddress = await this.signer.getAddress()
        const userBalance = await this.airdropTokenContractObj.balanceOf(userAddress)

        if (totalAirdrop > userBalance) {
            //update values in ui just in case
            document.querySelectorAll(".totalAirdrop").forEach((x) => x.innerText = this.formatNumber(totalAirdrop))
            document.querySelectorAll(".erc20UserBalance").forEach((x) => x.innerText = this.formatNumber(userBalance))

            //fade message back in with some delay so user sees its updated
            setTimeout(() => this.notEnoughTokensEl.style.opacity = 1, 500)

            //show message user doesnt have enough
            this.notEnoughTokensEl.hidden = false

            //disable buttons again
            this.deployAirDropBtn.disabled = true
            this.fundAirdropBtn.disabled = true
            return false
        } else {
            //enable deploy button when user has enough
            this.deployAirDropBtn.disabled = false
            this.notEnoughTokensEl.hidden = true
            return true
        }

    }

    async #checkEnoughTokensHandler() {
        //fade message out while function is waiting on rpc
        this.notEnoughTokensEl.style.opacity = 0
        //get user balance
        return await this.checkEnoughTokens()
    }

    /**
 * 
 * @returns {BigNumber}
 */
    async getTotalAirdropFromDeployedDrop(deployedLoveDrop = this.deployedLoveDrop) {
        const claimDataIpfsHash = await deployedLoveDrop.claimDataIpfs()
        const dropMetaData = await this.ipfsIndexer.getIpfs(`${claimDataIpfsHash}/dropMetaData.json`)
        return dropMetaData.totalDropBigNumber
    }


    async #fundAirdropBtnHandler() {
        this.dropBuilderMessageParent.style.display = "block"
        await DropBuilder.switchNetwork()
        if (await this.checkEnoughTokens()) {
            const tokenAddressFromDrop = await this.deployedLoveDrop.airdropTokenAddress()
            this.dropBuilderMessageContentEl.innerText = `checking uploaded ipfs data from contract ${this.deployedLoveDrop.target}`
            const amountInDrop = BigInt(await this.getTotalAirdropFromDeployedDrop(this.deployedLoveDrop)) //ethers.BigNumber.from(await this.getTotalAirdropFromDeployedDrop(this.deployedLoveDrop))

            await this.connectSigner()
            const airdropTokenWithSigner = this.airdropTokenContractObj.connect(this.signer)
            //sanity check amount and airdrop token contract address
            //TODO check merkle root but maybe that over doing it
            if (airdropTokenWithSigner.target === tokenAddressFromDrop) {
                if (amountInDrop === this.getTotalAirdrop()) {
                    this.dropBuilderMessageContentEl.innerText = "checking uploaded ipfs data"
                    const tx = await airdropTokenWithSigner.transfer(this.deployedDropAddress, amountInDrop)
                    //TODO figure out how make sure user doesnt fun it twice
                    //this.fundAirdropBtn.disabled
                    this.txs.push(tx)
                    const confirmedTX = (await (await (await tx).wait(1)).hash);

                    //TODO reset inner html in other functions and maybe make a function
                    this.dropBuilderMessageContentEl.innerHTML = ""
                    this.dropBuilderMessageContentEl.innerText = `
                    funded contract: ${this.deployedDropAddress}. At tx: ${confirmedTX}\n
                    The airdrop is now ready! Wow cool! :D \n
                    View this drop at: 
                    `
                    const dropUrl = DropBuilder.getUrlToPath(new URL(window.location.href),"drop",{"lovedrop":this.deployedDropAddress})
                    const urlNoSearch = new URL(window.location.href)
                    urlNoSearch.search = ""
                    const cleanDropUrl =  DropBuilder.getUrlToPath(urlNoSearch,"drop",{"lovedrop":this.deployedDropAddress})

                    const paramsToRemove = ["ipfsApi", "infuraProjectId", "infuraProjectSecret"]
                    DropBuilder.removeParamsFromUrl(dropUrl, paramsToRemove)



                    const dropLink = document.createElement("a")
                    dropLink.href = decodeURIComponent(dropUrl.toString())
                    dropLink.innerText = decodeURIComponent(cleanDropUrl.toString())

                    this.dropBuilderMessageContentEl.append(dropLink)

                    this.fundAirdropBtn.disabled = true
                    this.deployAirDropBtn.disabled = true
                } else {
                    const errorMsg = `
                    Total airdrop amount from the contract: ${this.deployedLoveDrop.target} is NOT the same as the amount calculated locally.
                    `
                    messageEl.innerText = errorMsg

                    throw Error(errorMsg)

                }


            } else {
                const errorMsg = `
                tokens that were requested to send are not the same address as the address that the drop contract is specifying\n
                loveDropContract: ${this.deployedDropAddress}\n
                loveDropContractTokenAddress: ${tokenAddressFromDrop}\n
                specifiedAddress: ${this.airdropTokenContractObj.target}\n
                `
                messageEl.innerText = errorMsg

                throw Error(errorMsg)
            }


        }

    }

    async #createSingleNftDisplay(collectionAddress, id) {
        collectionAddress = ethers.getAddress(collectionAddress)
        const contentElement = document.createElement("div")
        const nftMetaData = await this.criteriaBuilder.filterBuilder.getNftMetaData(collectionAddress)
        contentElement.id = `singleNftDisplay-${collectionAddress}-${id}`

        const landscapeOrientation = { "rowSize": 1, "amountRows": 1 }
        const portraitOrientation = { "rowSize": 1, "amountRows": 1 }
        const nftDisplay = new NftDisplay({
            ids: [id],
            collectionAddress: collectionAddress,
            displayElement: contentElement,

            nftMetaData: nftMetaData,
            provider: this.provider,
            ipfsGateway: this.ipfsGateway,

            landscapeOrientation: landscapeOrientation,
            portraitOrientation: portraitOrientation,

            collectionInfoFlag: false,
            pageSelectorFlag: false
        })

        nftDisplay.displayNames({ redirect: true })
        //await nftDisplay.showAttributes()
        //await nftDisplay.addImageDivsFunction((id, nftDisplay) => this.#showCriteriaNftDisplay(id, nftDisplay), false)
        await nftDisplay.createDisplay()

        // const nftsEl = document.createElement("div")
        // nftsEl.append(contentElement)
        //contentElement.className = "singleNftDisplay"
        return contentElement

    }

    static getUrlToPath(url,pathName, addParams={}) {

        url.pathname = pathName

        const searchParamsObj = Object.fromEntries(url.searchParams)
        if (Object.keys(addParams).length) {
            for (const paramName in addParams) {
                //prevent duplicates and overwrites existing
                if (paramName in searchParamsObj) {
                    url.searchParams.delete(paramName)
                }
                url.searchParams.set(paramName, addParams[paramName])
            }
        }
        return url
    }

    static removeParamsFromUrl(url, paramNames=[]) {
        [...url.searchParams].forEach((param)=>{
            if (paramNames.includes(param[0])) {
                url.searchParams.delete(param[0], param[1])
            }
            
        })
        return url
    }
}
