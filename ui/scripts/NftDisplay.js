import {NftMetaDataCollector} from "./NftMetaDataCollector.js";
import { ethers } from "./ethers-6.7.0.min.js";
const delay = ms => new Promise(res => setTimeout(res, ms));


export class NftDisplay {
    collectionAddress;
    nftMetaData;
    displayElementId;
    ids;

    landscapeOrientation = {}
    portraitOrientation= {}
    currentPage=1
    rowSize=7
    amountRows=2
    borderWidth="5px";
    borderColor = "black";

    imgOnclickFunction;
    divFunctions=[];

    selection = []
    notSelectable = []

    ipfsGateway;

    imageRasterElement;

    pageSelectorFlag
    collectionInfoFlag


    collectionInfoCssClass = "nftdisplayInfo"
    //TODO maybe make a function that calculates a rowsize based on the widht of the images loaded to maximize screen realestate

    /**
     * initializes with the nft collection and ids if given
     * @param {string} collectionAddress 
     * @param {ethers.providers} provider 
     * @param {HTMLElement} displayElementId 
     * @param {number[]} ids 
     * @param {string} ipfsGateway
     * @param {NftMetaDataCollector} nftMetaData
     */
    constructor(
        {collectionAddress,provider, displayElement, ids=[], ipfsGateway = "https://ipfs.io", 
        landscapeOrientation = {["rowSize"]:5,["amountRows"]:2}, 
        portraitOrientation = {["rowSize"]:3,["amountRows"]:4},
        nftMetaData, initialize=true, pageSelectorFlag=true, collectionInfoFlag=true}
    ) {
        this.ipfsGateway = ipfsGateway
        this.provider =provider
        this.ids = ids
        //TODO change all this.displayElementId to use the whole element and pass whole element in constructor instead of id
        this.displayElement = displayElement

        this.pageSelectorFlag = pageSelectorFlag
        this.collectionInfoFlag = collectionInfoFlag

        this.landscapeOrientation = landscapeOrientation
        this.portraitOrientation = portraitOrientation

        if(initialize) {
            this.initialize(collectionAddress, nftMetaData)

        } else {
            this.collectionAddress = collectionAddress
        }
        

        
    }

    async initialize(collectionAddress=this.collectionAddress, nftMetaData=undefined) {
        if (!nftMetaData) {
            this.nftMetaData = new NftMetaDataCollector(collectionAddress,this.provider,this.ipfsGateway)
        } else {
            this.nftMetaData = nftMetaData
        }

        this.setImageRasterOrientation()
        this.changeOnRotate()
        await this.setCollectionAddress(collectionAddress)
    }

    async setCollectionAddress(collectionAddress) {
        collectionAddress = ethers.getAddress(collectionAddress)
       
        this.clear()
        if (!collectionAddress) {
            console.warn(`collection address is not set`)
            return
        } else {
            this.collectionAddress = ethers.getAddress(collectionAddress)
            //TODO recreating nftMetaData is inefecient if it used somewhere else
            if (this.nftMetaData.contractObj.target !== collectionAddress) {
                console.warn("collection address is set by creating a new NftMetaDataCollector object this can break things! ")
                this.nftMetaData = new NftMetaDataCollector(this.collectionAddress,this.provider,this.ipfsGateway)

            }
           
        }
        
    }

    async setNftMetaDataCollector(nftMetaData) {
        this.nftMetaData = nftMetaData
        await this.clear()
    }

    setImageRasterOrientation(landscape=this.landscapeOrientation ,portrait=this.portraitOrientation ) {
        this.landscapeOrientation = landscape
        this.portraitOrientation = portrait

        const orientation = screen.orientation.type.split("-")[0]
        switch (orientation) {
            case "portrait":
                this.rowSize = this.portraitOrientation.rowSize
                this.amountRows = this.portraitOrientation.amountRows
                break;

            case "landscape":
                this.rowSize = this.landscapeOrientation.rowSize
                this.amountRows = this.landscapeOrientation.amountRows
                break;
        
            default:
                break;
        }
    }

    resizeByOrientation() {
        this.setImageRasterOrientation()
        this.refreshImages()
    }

    changeOnRotate(landscape=this.landscapeOrientation, portrait=this.portraitOrientation ) {
        this.landscapeOrientation = landscape
        this.portraitOrientation = portrait

        screen.orientation.addEventListener("change", (event) => {
            this.resizeByOrientation()


          });

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
        this.ids = (await this.nftMetaData.getIdsOfowner(ownerAddress)).map((x)=>x.toString())//bignumber fix
        return this.ids
    }

    /**
     * sets this.ids to all existing ids
     */
    async setIdsToAll() {
        //TODO fix this for collection that break this assumption (ex ens ids are random)
        //fix needs to be in nftMetaDataCollector
        //tokenByIndex would be super usefull here but isnt standard
        //might be able to event scan for any transfers from 0x0 since those are mints however: the specs says: 
        // "Exception: during contract creation, any number of NFTs may be created and assigned without emitting Transfer."

        //detect if contract minted secret token by checking if it's deployment tx emitted transfer event while it initial supply > 0

        //1 try tokenByIndex
        //2 0/1 till mintedSupply (totall supply if mintedSupply is not available)
        //3 inspect ipfs DAG/https serve of baseUri (impossible for some like loomlock)
        //4 test to see if ex 10 ids dont exist outside total supply
        //5 event scan n blocks to futher test asssumtion

        //if that fails you need to event scan from block since deployment
        //test if contract minted secret ids at creation (requires archive node)
        //if not event scan from tx 0x0
        //if it is you have to scan all txs
        //write down ids mentioned in transfers
        //might not need to do that if #3 works
        const totalSupply = await this.nftMetaData.getLastId()
        const firstId = await this.nftMetaData.getFirstId()
        console.log(firstId,totalSupply)
        this.ids = Array.from(new Array(totalSupply+1-firstId), (x,i) => (i + firstId).toString());
        return this.ids
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
            if (this.notSelectable.indexOf(id)===-1) {
                let imageDiv = document.getElementById(`imageDiv-${id}-${this.collectionAddress}`)
                if(imageDiv) {
                    imageDiv.onclick  = () => onclickFunction(id, this)
                    imageDiv.style.cursor = "pointer"
                }
            }
        }

    }

    /**
     * divFunctions should be a Array of functions that return DOM elements . 
     * input first input params of all funvtions are: nftId, this
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
     * input first input params of all funvtions are: nftId, this 
     *
     * @param {function} func
     */
    async addImageDivsFunction(func, updateDisplay=true) {
        this.divFunctions.push(func)
        if (this.displayElement.innerHTML && updateDisplay) {
            //TODO remove only the div created by that function that needs to be removed
            this.#removeAllDivImageFromRootElement();
            await this.#applyDivFuntionsOnCurrentIds(this.divFunctions)

        }
    }

    /**
     * remove divFunction from the list by name
     * and updates the display
     * @param {string} functionName
     */
    removeImageDivsFunction(functionName) {
        this.divFunctions = this.divFunctions.filter((x)=>x.name!==functionName)
        //TODO remove only the div created by that function that needs to be removed
        this.#removeAllDivImageFromRootElement();
        this.#applyDivFuntionsOnCurrentIds(this.divFunctions)
    }

    #removeAllDivImageFromRootElement(ids=this.ids, currentPage = this.currentPage, rowSize=this.rowSize, amountRows=this.amountRows) {
        //TODO seems broken?
        const maxPerPage = rowSize*amountRows
        const idsCurrentPage = ids.slice((currentPage-1)*maxPerPage, currentPage*maxPerPage)

        const allImageDivs = [...this.displayElement.querySelectorAll(".nftImagesDiv")]
        //TODO doing this in one for each instead of filter is faster
        const allImgDivElements = allImageDivs.map((imgDiv)=>[...imgDiv.childNodes].filter((imgDivElement)=>!imgDivElement.className || !imgDivElement.className.includes("imageDiv") )).flat()
        allImgDivElements.forEach((element)=>{element.outerHTML = "";element=undefined})
        // for (const [index, id] of idsCurrentPage.entries()) {
        //     let imageDiv = document.getElementById(`imageDiv-${id}-${this.collectionAddress}`)
        //     //keep last item since its the image 
        //     if(imageDiv) {
        //         const childNodes = [...imageDiv.childNodes]
        //         const removeableNodes =childNodes.slice(null,childNodes.length-1) //.filter((x)=>x.id!=="selectionStatus") 
        //         removeableNodes.map((x)=>{
        //             imageDiv.removeChild(x);
        //             //x.outerHTML = ""
        //         })
        //     }
        
        // }

    }

    test() {
        this.#removeAllDivImageFromRootElement()
    }



    /**
     * 
     * @param {Element[]} divs
     */
    async #applyDivFuntionsOnCurrentIds(divFunctions=this.divFunctions, ids=this.ids, currentPage = this.currentPage, rowSize=this.rowSize, amountRows=this.amountRows) {
        this.#removeAllDivImageFromRootElement()
        const maxPerPage = rowSize*amountRows
        const idsCurrentPage = ids.slice((currentPage-1)*maxPerPage, currentPage*maxPerPage)
        let allResults = []
        for (const [index, id] of idsCurrentPage.entries()) {
            
            const imageDiv = this.imageRasterElement.querySelectorAll(`.rootDiv-${id}-${this.collectionAddress}`)[0]
            let results = divFunctions.map(async (x)=>x(id, this))
            for (const result of results) {
                allResults.push(result)
                Promise.resolve(result).then((r) => {
                    try {
                        imageDiv.prepend(r)
                    } catch (error) {
                        console.warn(`couldn't apply element to nftdisplay with function ${r.id} ${r.className} ${imageDiv} TODO fix this.`)
                    }
                    
        
                })

            }
        }
        //To make sure function resolves when all are applied
        allResults = await Promise.all(allResults)

        //TODO this breaks when nftName function name changes
        if(this.imageRasterElement) {
            if (-1 !== divFunctions.findIndex((f)=>f.name ==="nftNameWithOpenSeaProRedirect" ||f.name ==="nftName")) {
                this.#resizeImagesWidthNameHeight()
            }
        }

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
        infoDiv.className = this.collectionInfoCssClass
        infoDiv.innerHTML = `
            <span style="font-weight: bold;">${await nftMetaData.getContractName()}</span> <span style="font-size:0.8rem">${amountItems} items</span></br>
            <span style="font-size:0.8rem">${collectionAddress}</span>
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
        Object.assign(prevPageButton, {["onclick"]: prevPageFunc,   ["innerText"]: "prev", ["className"]:"prev"})

        let nextPageButton = document.createElement("button")
        Object.assign(nextPageButton, {["onclick"]: nextPageFunc,   ["innerText"]: "next", ["className"]:"next"})
        
        let firstPageButton = document.createElement("button")
        Object.assign(firstPageButton, {["onclick"]: firstPageFunc, ["innerText"]: "first", ["className"]:"first"})
        
        let lastPageButton = document.createElement("button")
        Object.assign(lastPageButton, {["onclick"]: lastPageFunc,   ["innerText"]: "last", ["className"]:"last"})

        let selectorDiv = document.createElement("div")

        selectorDiv.append(prevPageButton,nextPageButton,firstPageButton,lastPageButton,` page ${currentPage} of ${lastPage} pages`)
        selectorDiv.id =  `pageSelector-${currentPage}-${this.collectionAddress}`
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
        //const maxPerPage = rowSize*amountRows
        //const idsCurrentPage = ids.slice((currentPage-1)*maxPerPage, currentPage*maxPerPage)
        if (this.imageRasterElement) {
            const imgDivs = [...this.imageRasterElement.querySelectorAll(".nftDisplayImageElement")]
            imgDivs.map((imgElement)=>this.#cancelLoadingImage(imgElement))
            //await Promise.all(imgDivs.map((imgElement)=>this.#cancelLoadingImage(imgElement)))
        }

    }

    #cancelLoadingImage(imgElement) {
        //TODO maybe cancel nftMetaDataCollector.getImage() with signals?
        //getImage can be slow which means the img.src isnt set for a while
        //let imgElement = document.getElementById(elementId) 
        // for (let index = 0; index < 2000; index++) {
        if (imgElement && "src" in  imgElement) {
            imgElement.src = ""
            return 1
        }

        return 0
 

    }


    /**
     * redraws the page with new page selector and images
     * @param {number} page 
     * @param {string} targetElementId 
     */
    async selectPage(page, refresh=false) {
        const computedHeight = getComputedStyle(this.imageRasterElement).height
        //const initialHeight = this.imageRasterElement.style.height

        if (this.pageSelectorElement) {
            const newPageSelector = this.createPageSelector(page)
            this.pageSelectorElement.replaceWith(newPageSelector)
            this.pageSelectorElement = newPageSelector
        }
        

        
        //incase of refresh
        if (page !== this.currentPage) {
            this.#cancelLoadingImages(this.currentPage);
        } 
        this.currentPage = page;
        
        
        const newRasterElement = await this.createImagesRaster(page)
        if(this.imageRasterElement){
            this.imageRasterElement.replaceWith(newRasterElement)
            this.imageRasterElement = newRasterElement
        }

        if (!refresh) {
            //to prevent the height from jumping. but is set to the origanal value (fit-content) after 2 seconds when images are loaded
            this.imageRasterElement.style.height = computedHeight
            setTimeout(()=>{
                this.imageRasterElement.style.height='fit-content' //TODO set this as global somehow
            }, 2000 )

        }

        
        //const existingPageSelector = document.getElementById(`pageSelector-${this.collectionAddress}`) //TODO reference element not id!! silly!!!!!


       

        
        if(this.imgOnclickFunction){
            this.#addOnclickFunctionToCurrentImages()
        }

        if (this.divFunctions.length>0) {
            await this.#applyDivFuntionsOnCurrentIds(this.divFunctions,this.ids,this.currentPage)
        }
        


    
        
       

    }

    getIdsOfCurrentPage(currentPage=this.currentPage, rowSize=this.rowSize, maxAmountRows=this.amountRows, ids=this.ids) {
        const maxPerPage = rowSize*maxAmountRows
        const idsCurrentPage = ids.slice((currentPage-1)*maxPerPage, currentPage*maxPerPage)
        return idsCurrentPage
    }

    /**
     * 
     * @param {number} currentPage 
     * @param {number} rowSize 
     * @param {number} maxAmountRows 
     * @param {number[]} ids 
     * @param {string} borderWidth 
     * @param {string} borderColor 
     * @returns 
     */
    async createImagesRaster(currentPage=this.currentPage, rowSize=this.rowSize, maxAmountRows=this.amountRows, ids=this.ids, borderWidth=this.borderWidth, borderColor = this.borderColor) {
        //hacky way to preload the base uri
        //TOD
        await this.nftMetaData.getBaseURI()

        const idsCurrentPage = this.getIdsOfCurrentPage(currentPage, rowSize, maxAmountRows, ids)
        const realAmountRows = Math.ceil(idsCurrentPage.length/rowSize)
        const imageWidth = Math.floor(100/(rowSize))
        const minTotalWidth = `${9.4*rowSize}ch`
        const imagesBorderWidth = "max(2px, 0.35vi)"
        
        let newImageRaster = document.createElement("div")
        if (this.imageRasterElement) {
            this.imageRasterElement.replaceWith(newImageRaster)
            this.imageRasterElement = newImageRaster
        } else {
            this.imageRasterElement = newImageRaster
        }
        this.imageRasterElement.id = `imagesRaster-${this.collectionAddress}`
        this.imageRasterElement.style= `
        display: grid;
        margin: 0.2em;
    
        
        grid-template-columns: repeat(${rowSize},1fr);
        grid-template-rows: repeat(${realAmountRows}, 1fr);
        
        background-color: #101010;
        grid-gap: ${imagesBorderWidth};

        border: black;
        border-style: solid;
        border-width: ${imagesBorderWidth};
        
        min-width: ${minTotalWidth};

        min-height: 0;
        max-height: calc(100% - ${imagesBorderWidth} * 2 - 0.4em); 
        width: calc(100% - ${imagesBorderWidth} * 2 - 0.4em); 
        height: fit-content;
        min-width: fit-content;
        
       
        `//css seems to think a 100% max-height is larger then it actually is. i think it forgets to add the borders and margin but not sure 

  

        let imgElements = []
        for (const [index, id] of idsCurrentPage.entries()) {
            const img = document.createElement("img")
            img.id = `img-${id}-${this.collectionAddress}`
            img.style = `width: 100%; height: 100%; object-fit: scale-down; vertical-align: bottom;`
            img.className = "nftDisplayImageElement"
        

            imgElements.push(img)
            
            let imgRootDiv =  document.createElement("div")
            imgRootDiv.className = `nftImagesDiv rootDiv-${id}-${this.collectionAddress}`
            imgRootDiv.style = `background-color: canvas; overflow: hidden; height:100%; position: relative;`//`width: ${imageWidth}%; position: relative; display: inline-block;`

            let imageDiv = document.createElement("div")
            imageDiv.id = `imageDiv-${id}-${this.collectionAddress}`
            imageDiv.style = `overflow: hidden; height:100%; vertical-align: bottom;`
            imageDiv.className = "imageDiv"
            
            imageDiv.append(img)
            //imgBorderDiv.append(imageDiv)
            imgRootDiv.append(imageDiv)
            this.imageRasterElement.append(imgRootDiv)
        }


        const remainder = idsCurrentPage.length%rowSize
        let emptyItems = 0
        if (remainder) {
            emptyItems = rowSize - remainder
            
        } 
        if (emptyItems) {
            for (let index = 0; index < emptyItems; index++) {
                const emptyDiv = document.createElement("div")
                emptyDiv.style = `
                position: relative; 
                width: calc(100% + ${imagesBorderWidth}); 
                height: calc(100% + ${imagesBorderWidth} * 1);
                background-color: canvas; 
                z-index:2;
                `
                if (realAmountRows===1) {
                    emptyDiv.style.marginTop = `calc(${imagesBorderWidth} * -1)`
                    emptyDiv.style.height = `calc(100% + ${imagesBorderWidth}*2)`
                }
                this.imageRasterElement.append(emptyDiv)
            }
            

        }


        Promise.all(idsCurrentPage.map((id)=>this.nftMetaData.getImage(id))).then((imageUrls)=>{
            imgElements.forEach((img,index) => {
                img.src= imageUrls[index]
                if(imageUrls[index].startsWith(this.ipfsGateway)){
                    img.crossOrigin="anonymous"
                }
            });
            
        })
        return this.imageRasterElement
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
    async createDisplay(currentPage=this.currentPage, targetElement=this.displayElement, rowSize=this.rowSize, amountRows=this.amountRows, ids=this.ids, borderWidth=this.borderWidth, borderColor = this.borderColor,collectionInfo=this.collectionInfoFlag ) {
        //TODO apply divFunctions and get image urls in 1 go
        //this.setImageRasterOrientation()
        this.currentPage =  this.#getValidPage(currentPage,this.ids.length, rowSize,amountRows)

        if (collectionInfo) {
            const infoDiv =  this.#createInfoDiv(this.collectionAddress,this.nftMetaData, ids.length)
            targetElement.append(await infoDiv)

        } else {
            targetElement.append(document.createElement("div"))
        }
    

        if (ids.length>0) {
            //single id never needs page selector
            //TODO detect the amount of pages
            if(this.pageSelectorFlag) {
                this.pageSelectorElement = this.createPageSelector(this.currentPage, rowSize, amountRows, ids)
                //this.pageSelectorElement.id = `pageSelector-${currentPage}-${this.collectionAddress}`
                targetElement.append(this.pageSelectorElement)
            } else {
                targetElement.append(document.createElement("div"))
            }

            let imagesRasterDiv = await this.createImagesRaster(this.currentPage, rowSize, amountRows, ids, borderWidth, borderColor)
            imagesRasterDiv.id = `imagesRaster-${this.collectionAddress}`
            targetElement.append(imagesRasterDiv)


        } else {
            let noIdsMessage = document.createElement("div")
            noIdsMessage.innerText = "no nfts found :("
            targetElement.append( "no nfts found :(")
        }

    
        if(this.imgOnclickFunction) {
            this.#addOnclickFunctionToCurrentImages()
        }

        await this.#applyDivFuntionsOnCurrentIds()

    
    
    }

    clear(){
        const displayElement = this.displayElement
        if(displayElement && displayElement.innerHTML) {
            this.#removeAllDivImageFromRootElement()
            this.#cancelLoadingImages()
            this.displayElement.innerHTML = ""
        }

        displayElement.innerHTML = ""
    }

    #toggleSelect(id) {
        const idIndex = this.selection.indexOf(id)
        let selectionStatusDiv = document.getElementById(`selectedStatus-${id}-${this.collectionAddress}`)
        if (idIndex===-1) {
            this.selection.push(id)
            selectionStatusDiv.style.backgroundColor = "rgba(0, 0, 100, 0.82)"
            selectionStatusDiv.innerText = "selected"
        } else {
            selectionStatusDiv.innerText = "not selected"
            selectionStatusDiv.style.backgroundColor = "rgba(0, 0, 0, 0.82)"
            this.selection.splice(idIndex,1)
        }
        if(this.onSelect) {
            this.onSelect(id, this)
        }

    }

    #setSelectStatus(id,selectionStatusDiv) {
        const idIndex = this.selection.indexOf(id)
        if (idIndex===-1)  {
            selectionStatusDiv.innerText = "not selected"
            selectionStatusDiv.style.backgroundColor = "rgba(0, 0, 0, 0.82)"
        } else {
            selectionStatusDiv.style.backgroundColor = "rgba(0, 0, 100, 0.82)"
            selectionStatusDiv.innerText = "selected"
        }
        return selectionStatusDiv

    } 

    #selectedStatus(id) {
        let div = document.createElement("div")
        if (this.notSelectable.indexOf(id)===-1) { 
            div.innerText = "click to select"
            div.id = `selectedStatus-${id}-${this.collectionAddress}`
            div.className = "nftDisplaySelectionStatus"
            //div.style = "width: 100%; position: absolute; float: left; bottom: 0px; left: 0px; color: white; font-size:0.9rem; background-color:  rgba(0, 0, 0, 0.78)"
            this.#setSelectStatus(id, div)
            return div
        } else {
            return ""
        }
    }

    async #nftName(id) {
        let div = document.createElement("div")
        //TODO why not selectable?
        if (this.notSelectable.indexOf(id)===-1) { 
            div.innerText = await this.nftMetaData.getTokenName(id)
            div.id = `nftName-${id}-${this.collectionAddress}`
            div.className = "nftName"
            return div
        } else {
            return ""
        }
    }

    async #nftNameWithOpenSeaProRedirect(id) {
        const chain = "ethereum"
        const url = `https://pro.opensea.io/nft/${chain}/${this.collectionAddress}/${id}`
        const nameElement = await this.#nftName(id)
        nameElement.onclick = ()=>window.open(url)
        nameElement.style.cursor = "pointer"
        nameElement.title = "see on openSeaPro"

        return nameElement
    }

    displayNames({redirect}={redirect:false}) {
        if (redirect) {
            const nftNameWithOpenSeaProRedirect = async (id)=>this.#nftNameWithOpenSeaProRedirect(id)
            this.divFunctions.push(nftNameWithOpenSeaProRedirect)
        } else {
            const nftName = async (id)=>this.#nftName(id)
            this.divFunctions.push(nftName)
        }
    }

    #resizeImagesWidthNameHeight() {
        //TODO do this separate function
        //TODO doesnt re-size if spam clicking (nftNameElement will be undefined)

        const nftNameElement = [...this.imageRasterElement.querySelectorAll(".nftName")][0]
        if (nftNameElement) {
            const attributeElements = [...this.imageRasterElement.querySelectorAll(".attributesNftDisplayContent")]
            const imgElements = [...this.imageRasterElement.querySelectorAll(".nftDisplayImageElement")]

            const nftNameSize = getComputedStyle(nftNameElement).height 
            for (const img of imgElements) {
                img.style.height = `calc(100% - ${nftNameSize})`
            }
    
            if(attributeElements.length) {
                for (const attribute of attributeElements) {
                    attribute.style.marginTop = `calc(${nftNameSize}*1.1)`
                    attribute.style.marginBottom = `calc(${nftNameSize}*1.1)`
                }
            }

        } else {
            console.warn("couldn't resize img elements")
        }

    }

    

    /**
     * makes all selectable that arent in this.notSelectable TODO better name
     */
    makeAllSelectable() {
        const toggleSelect = (id) => this.#toggleSelect(id)
        this.setImgOnclickFunction(toggleSelect)

        const selectionStatus = (id)=>this.#selectedStatus(id)
        this.addImageDivsFunction(selectionStatus)

    }

    makeUnselectable(ids=[]){
        for (const id of ids) {
            let imageDiv = document.getElementById(`imageDiv-${id}-${this.collectionAddress}`)
            imageDiv.onclick = ""
            imageDiv.style.cursor = "auto"

            let selectedStatusDiv = document.getElementById(`selectedStatus-${id}-${this.collectionAddress}`)
            imageDiv.removeChild(selectedStatusDiv)
        }
        this.notSelectable = [...this.notSelectable, ...ids]
    }

    /**
     * makes speciefied ids selectable
     * TODO assumes this.onclickFunction is either undefined or set to this.#toggleSelect
     * @param {number[]} ids 
     */
    makeSelectable(ids=[]){
        if(!this.onclickFunction) {
            const toggleSelect = (e, id) => this.#toggleSelect(e, id)
            this.imgOnclickFunction = toggleSelect
        }

        this.notSelectable = this.notSelectable.filter((x)=>ids.indexOf(x)===-1)
        for (const id of ids) {
            let imageDiv = document.getElementById(`imageDiv-${id}-${this.collectionAddress}`)
            const toggleSelect = (e, id) => this.#toggleSelect(e, id)
            imageDiv.onclick = (e)=>{toggleSelect(e, id)} 

            let selectedStatusDiv = this.#selectedStatus(id)
            imageDiv.append(selectedStatusDiv)
        }
    }

    async selectAll() {
        this.selection = this.ids.filter((id)=>this.notSelectable.indexOf(id)===-1);
        this.#removeAllDivImageFromRootElement()
        await this.#applyDivFuntionsOnCurrentIds(this.divFunctions)
    }

    async clearSelection() {
        this.selection = []
        this.#removeAllDivImageFromRootElement()
        await this.#applyDivFuntionsOnCurrentIds(this.divFunctions)
    }

    refreshSelectableDisplay() {
        this.#removeAllDivImageFromRootElement()
        this.#applyDivFuntionsOnCurrentIds(this.divFunctions)
        this.#addOnclickFunctionToCurrentImages(this.imgOnclickFunction)
    }

    async refreshInfo() {
        let infoDiv = document.getElementById(`info-${this.collectionAddress}`)
        infoDiv.innerHTML =  (await this.#createInfoDiv(this.collectionAddress, this.nftMetaData, this.ids.length)).innerHTML 
    }

    async refreshImages(page=this.currentPage) {
        await this.selectPage(page, true)

    }

    async refreshPage(page=this.currentPage) {
        const maxPerPage = this.rowSize*this.amountRows
        const lastPage = Math.ceil(this.ids.length/maxPerPage)
        if (page>lastPage) {
            page = lastPage
        }
        if (page===0) {
            page=1
        }
        await this.refreshImages(page)
        await this.refreshInfo()
    }

    #getValidPage(page,idsLength, rowSize,amountRows) {
        const maxPerPage = rowSize*amountRows
        const lastPage = Math.ceil(idsLength/maxPerPage)

        if (page===0) {
            return 1
        } else if (page>lastPage) {
            return lastPage
        } else {
            return page
        }
    }

    async #showAttributesElement(id) {
        const rootElement = document.createElement("div")
        const contentElement = document.createElement("div")
        const attributes = (await this.nftMetaData.getTokenMetaData(id))["attributes"]
        for (const attribute of attributes) {
            //IDEA make clickable so it creates a filter with this attribute
            const attributeElement = document.createElement("div")

            const attributeType = document.createElement("span")
            attributeType.innerText = `${attribute.trait_type}: `
            attributeType.className = "attributeType"
            const attributeValue = document.createElement("span")
            attributeValue.innerText = attribute.value
            attributeValue.className = "attributeValue"
            //TODO list % of collection has this attribute by checking in nftMetadata idsPerAttribute

            // contentElement.append(attributeType, attributeValue)
            attributeElement.append(attributeType, attributeValue)
            
            attributeElement.className = "attributesNftDisplayItems"
            contentElement.append(attributeElement)
        }
        //TODO make toggle to always show
        rootElement.className = "attributesNftDisplayContainer"
        rootElement.id = `attributes-${id}-${this.collectionAddress}`
        rootElement.addEventListener("mouseover", (event) => {rootElement.style.opacity=1});
        rootElement.addEventListener("mouseout", (event) => {rootElement.style.opacity=0});
        contentElement.className = "attributesNftDisplayContent"
        rootElement.append(contentElement)

        return rootElement
    }

    async showAttributes() {
        const showAttributesFunc = (id)=>this.#showAttributesElement(id)
        await this.addImageDivsFunction(showAttributesFunc)
    }

}