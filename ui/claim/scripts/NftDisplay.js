import {NftMetaDataCollector} from "../../scripts/NftMetaDataCollector.js";


export class NftDisplay {
    collectionAddress;
    nftMetaData;
    targetDivId;
    ids;

    currentPage=1
    rowSize=7 
    amountRows=3
    borderWidth="5px";
    borderColor = "black";

    imgOnclickFunction;
    divFunctions=[function id(id){let d = document.createElement("div"); d.style = "position: absolute; float: top-right; top: 0px; right: 0px; color: white"; d.innerText = id; return d }];

    selection = []
    /**
     * initializes with the nft collection and ids if given
     * @param {string} collectionAddress 
     * @param {ethers.providers} provider 
     * @param {string} targetDivId 
     * @param {number[]} ids 
     */
    constructor(collectionAddress,provider, targetDivId="", ids=[]) {
        this.collectionAddress = collectionAddress
        this.nftMetaData = new NftMetaDataCollector(collectionAddress,provider)
        this.ids = ids
        this.targetDivId = targetDivId
    }

    /**
     * sets current ids used in display by default
     * @param {Number[]} ids 
     */
    setId(ids) {
        this.ids = ids
    }

    /**
     * sets the ids to all ids that the owner of the ethereum address owns
     * @param {string} ownerAddress 
     */
    async setIdsFromOwner(ownerAddress) {
        this.ids = (await this.nftMetaData.getIdsOfowner(ownerAddress)).map((x)=>Number(x))//bignumber fix
    }

    /**
     * set onclick function to all images 
     *  the first function parameters are: this, event, nftId
     * @param {function} imgOnclickFunction 
     */
    setImgOnclickFunction(imgOnclickFunction=this.imgOnclickFunction) {
        this.imgOnclickFunction = imgOnclickFunction
        this.#addOnclickFunctionToCurrentImages(this.imgOnclickFunction)
    }

    #addOnclickFunctionToCurrentImages(onclickFunction = this.imgOnclickFunction, ids=this.ids, currentPage = this.currentPage, rowSize=this.rowSize, amountRows=this.amountRows) {
        const maxPerPage = rowSize*amountRows
        const idsCurrentPage = ids.slice((currentPage-1)*maxPerPage, currentPage*maxPerPage)
        for (const [index, id] of idsCurrentPage.entries()) {
            let imageDiv = document.getElementById(`imageDiv-${id}-${this.collectionAddress}`)
            imageDiv.onclick  = (e)=>{onclickFunction(e, id)}
            imageDiv.style.cursor = "pointer"
        }

    }

    /**
     * divFunctions should be a Array of functions that return DOM elements . 
     * input first input params of all funvtions are: nftId
     * @param {function[]} divFunctions
     */
    setImageDivsFunctions(divFunctions=this.divFunctions) {
        this.divFunctions = divFunctions
        this.#applyDivFuntionsOnCurrentIds(this.divFunctions)
    }

    /**
     * adds divFunction to the list
     * and updates the display
     * 
     * the divFunction should return a DOM element.
     * input first input params of all funvtions are: nftId 
     *
     * @param {function} func
     */
    addImageDivsFunction(func) {
        this.divFunctions.push(func)
        //TODO remove only the div created by that function that needs to be removed
        this.#removeAllDivImageDiv();
        this.#applyDivFuntionsOnCurrentIds(this.divFunctions)
    }

    /**
     * remove divFunction from the list by name
     * and updates the display
     * @param {string} functionName
     */
    removeImageDivsFunction(functionName) {
        this.divFunctions = this.divFunctions.filter((x)=>x.name!==functionName)
        //TODO remove only the div created by that function that needs to be removed
        this.#removeAllDivImageDiv();
        this.#applyDivFuntionsOnCurrentIds(this.divFunctions)
    }

    #removeAllDivImageDiv(ids=this.ids, currentPage = this.currentPage, rowSize=this.rowSize, amountRows=this.amountRows) {
        const maxPerPage = rowSize*amountRows
        const idsCurrentPage = ids.slice((currentPage-1)*maxPerPage, currentPage*maxPerPage)
        for (const [index, id] of idsCurrentPage.entries()) {
            let imageDiv = document.getElementById(`imageDiv-${id}-${this.collectionAddress}`)
            const removeableNodes = [...imageDiv.childNodes].slice(1)
            removeableNodes.map((x)=>imageDiv.removeChild(x))
        }

    }



    /**
     * 
     * @param {Element[]} divs
     */
    #applyDivFuntionsOnCurrentIds(divFunctions=this.divFunctions, ids=this.ids, currentPage = this.currentPage, rowSize=this.rowSize, amountRows=this.amountRows) {
        const maxPerPage = rowSize*amountRows
        const idsCurrentPage = ids.slice((currentPage-1)*maxPerPage, currentPage*maxPerPage)
        for (const [index, id] of idsCurrentPage.entries()) {
            let imageDiv = document.getElementById(`imageDiv-${id}-${this.collectionAddress}`)
            const results = divFunctions.map((x)=>x(id))
            imageDiv.append(...results)
        }

    }

    /**
     * Creates a border div to wrap images to create a raster with even thickness.
     * Doesn't cover the left of the raster to make sizing math easier. 
     * @param {number} id 
     * @param {number} index 
     * @param {string} borderWidth 
     * @param {string} borderColor 
     * @param {string} collectionAddress 
     * @returns 
     */
    #createBorderDiv(id, index,borderWidth, borderColor, rowSize, collectionAddress=this.collectionAddress) {
        let imgBorderDiv = document.createElement("div")
        imgBorderDiv.style = `border-bottom: solid; border-right: solid;`
        imgBorderDiv.id = `borderDiv-${id}-${collectionAddress}`

        if (index < rowSize) {
            imgBorderDiv.style.borderTop = "solid"
        } 
        imgBorderDiv.style.borderWidth = borderWidth
        imgBorderDiv.style.borderColor = borderColor
        return imgBorderDiv
    }
    
    /**
     * fetches contract name and address 
     * @param {string} collectionAddress 
     * @param {NftMetaDataCollector} nftMetaData 
     * @param {number} amountItems
     */
    async #createInfoDiv(collectionAddress=this.collectionAddress, nftMetaData=this.nftMetaData, amountItems) {
        let infoDiv = document.createElement("div")
        infoDiv.id = `info-${collectionAddress}`
        infoDiv.innerHTML = `
            <span style="font-weight: bold;">${await nftMetaData.contractObj.name()}</span> <span style="font-size:0.8em">${amountItems} items</span></br>
            <span style="font-size:0.8em">${collectionAddress}</span>
            `
        return infoDiv
    }

    createPageSelector(currentPage=this.currentPage, rowSize=this.rowSize, amountRows=this.amountRows, ids=this.ids) {
        const maxPerPage = rowSize*amountRows
        const lastPage = Math.ceil(ids.length/maxPerPage)
        //{["targetElementId"]:targetElementId, ["rowSize"]:rowSize, ["amountRows"]:amountRows, ["currentPage"]:currentPage, ["ids"]:ids, ["borderWidth"]:borderWidth, ["borderColor"]:borderColor}

        const prevPageFunc  =  (e) => {this.selectPage(Math.max(currentPage-1, 1))} //, targetElementId, rowSize, amountRows, ids, borderWidth, borderColor)}
        const nextPageFunc  =  (e) => {this.selectPage(Math.min(currentPage+1,lastPage))} //, targetElementId, rowSize, amountRows, ids, borderWidth, borderColor)}
        const firstPageFunc =  (e) => {this.selectPage(1)} //, targetElementId, rowSize, amountRows, ids, borderWidth, borderColor)};
        const lastPageFunc  =  (e) => {this.selectPage(lastPage)} //, targetElementId, rowSize, amountRows, ids, borderWidth, borderColor)};

        let prevPageButton = document.createElement("button")
        Object.assign(prevPageButton, {["onclick"]: prevPageFunc,   ["innerText"]: "prev"})

        let nextPageButton = document.createElement("button")
        Object.assign(nextPageButton, {["onclick"]: nextPageFunc,   ["innerText"]: "next"})
        
        let firstPageButton = document.createElement("button")
        Object.assign(firstPageButton, {["onclick"]: firstPageFunc, ["innerText"]: "first"})
        
        let lastPageButton = document.createElement("button")
        Object.assign(lastPageButton, {["onclick"]: lastPageFunc,   ["innerText"]: "last"})

        let selectorDiv = document.createElement("div")

        selectorDiv.append(prevPageButton,nextPageButton,firstPageButton,lastPageButton,` page ${currentPage} of ${lastPage} pages`)
        return selectorDiv
    }

    /**
     * set all currently displayed img.src tags to ""
     * @param {number} currentPage 
     * @param {null} rowSize 
     * @param {number} amountRows 
     * @param {number[]} ids 
     */
    #cancelLoadingImages(currentPage = this.currentPage, rowSize=this.rowSize,amountRows=this.amountRows, ids=this.ids) {
        const maxPerPage = rowSize*amountRows
        const idsCurrentPage = ids.slice((currentPage-1)*maxPerPage, currentPage*maxPerPage)
        for (const [index, id] of idsCurrentPage.entries()) {
            let imgElement = document.getElementById(`img-${id}-${this.collectionAddress}`) 
            imgElement.src = ""
        }

    }


    /**
     * redraws the page with new page selector and images
     * @param {number} page 
     * @param {string} targetElementId 
     */
    async selectPage(page, targetElementId=this.targetDivId) {
        let targetDiv = document.getElementById(targetElementId)

        document.getElementById(`pageSelector-${this.collectionAddress}`).outerHTML = ""
        let newPageSelectorDiv = this.createPageSelector(page)
        newPageSelectorDiv.id = `pageSelector-${this.collectionAddress}`
        targetDiv.append(newPageSelectorDiv)

        this.#cancelLoadingImages(this.currentPage);
        this.currentPage = page;
        document.getElementById(`imagesRaster-${this.collectionAddress}`).outerHTML = ""

        let newRasterDiv = await this.createImagesRaster(page) //await new Promise((resolve, reject) => {
        newRasterDiv.id = `imagesRaster-${this.collectionAddress}`
        targetDiv.append(newRasterDiv)

        this.#applyDivFuntionsOnCurrentIds()

    }

    /**
     * 
     * @param {number} currentPage 
     * @param {number} rowSize 
     * @param {number} amountRows 
     * @param {number[]} ids 
     * @param {string} borderWidth 
     * @param {string} borderColor 
     * @returns 
     */
    async createImagesRaster(currentPage=this.currentPage, rowSize=this.rowSize, amountRows=this.amountRows, ids=this.ids, borderWidth=this.borderWidth, borderColor = this.borderColor) {
        const maxPerPage = rowSize*amountRows
        const idsCurrentPage = ids.slice((currentPage-1)*maxPerPage, currentPage*maxPerPage)
        const imageWidth = Math.floor(100/(rowSize))
        
        let allImagesDiv = document.createElement("div")
        allImagesDiv.style=`width: 100%; border-left: solid; border-width: ${borderWidth}; border-color: ${borderColor}`

        for (const [index, id] of idsCurrentPage.entries()) {
            let img = document.createElement("img")
            img.id = `img-${id}-${this.collectionAddress}`
            img.src = await this.nftMetaData.getImage(id)
            img.style = `max-width: 100%; vertical-align: top;`
            
            let imgRootDiv =  document.createElement("div")
            imgRootDiv.id = `rootDiv-${id}-${this.collectionAddress}`
            imgRootDiv.style = `width: ${imageWidth}%; position: relative; display: inline-block;`

            let imageDiv = document.createElement("div")
            imageDiv.id = `imageDiv-${id}-${this.collectionAddress}`
            imageDiv.style.position = "relative"

            const imgBorderDiv = this.#createBorderDiv(id,index,borderWidth,borderColor,rowSize,this.collectionAddress)
            
            imageDiv.append(img)
            imgBorderDiv.append(imageDiv)
            imgRootDiv.append(imgBorderDiv)
            allImagesDiv.append(imgRootDiv)
        }
        return allImagesDiv
    }

    /**
     * creates a display of nft images at the specified elementId
     * @param {number} currentPage 
     * @param {string} targetElementId 
     * @param {number} rowSize 
     * @param {number} amountRows 
     * @param {number[]} ids
     * @param {string} borderWidth 
     * @param {string} borderColor 
     */
    async createDisplay(currentPage=this.currentPage, targetElementId=this.targetDivId, rowSize=this.rowSize, amountRows=this.amountRows, ids=this.ids, borderWidth=this.borderWidth, borderColor = this.borderColor) {
        this.currentPage = currentPage

        const infoDiv =  this.#createInfoDiv(this.collectionAddress,this.nftMetaData, ids.length)

        let imagesRasterDiv = await this.createImagesRaster(currentPage, rowSize, amountRows, ids, borderWidth, borderColor)
        imagesRasterDiv.id = `imagesRaster-${this.collectionAddress}`

        let pageSelectorDiv = this.createPageSelector(currentPage, rowSize, amountRows, ids)
        pageSelectorDiv.id = `pageSelector-${this.collectionAddress}`

        let targetDiv = document.getElementById(targetElementId)
        targetDiv.append(await infoDiv,pageSelectorDiv, imagesRasterDiv)

        this.#applyDivFuntionsOnCurrentIds()
    }

    #toggleSelect(e, id) {
        const idIndex = this.selection.indexOf(id)
        let selectionStatusDiv = document.getElementById(`selectedStatus-${id}-${this.collectionAddress}`)
        if (idIndex===-1) {
            this.selection.push(id)
            selectionStatusDiv.innerText = "selected"
        } else {
            selectionStatusDiv.innerText = "click to select"
            this.selection.splice(idIndex,1)
        }

    }

    #selectedStatus(id, status="click to select") {
        let div = document.createElement("div") 
        div.innerText = status
        div.id = `selectedStatus-${id}-${this.collectionAddress}`
        return div

    }

    //assumes this.selected is empty
    makeSelectable() {
        const toggleSelect = (e, id) => this.#toggleSelect(e, id)
        this.setImgOnclickFunction(toggleSelect)

        const selectionStatus = (id)=>this.#selectedStatus(id)
        this.addImageDivsFunction(selectionStatus)
    }

}