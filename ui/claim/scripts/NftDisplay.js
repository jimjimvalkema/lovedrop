import { ethers } from "ethers";
import {NftMetaDataCollector} from "../../scripts/NftMetaDataCollector.js";


export class NftDisplay {
    collectionAddress;
    nftMetaData;
    targetDivId;

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
        this.ids = await this.nftMetaData.getIdsOfowner(ownerAddress)
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
    #createBorderDiv(id, index,borderWidth, borderColor, collectionAddress=this.collectionAddress) {
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
     */
    async #createInfoDiv(collectionAddress=this.collectionAddress, nftMetaData=this.nftMetaData) {
        let infoDiv = document.createElement("div")
        infoDiv.id = `info-${collectionAddress}`
        infoDiv.innerHTML = `
            <a style="font-weight: bold;">${await nftMetaData.contractObj.name()}</a><br>
            <a style="font-size:0.8em">${collectionAddress}</a>
            `
    }


    /**
     * creates a display of nft images at the specified elementId
     * @param {string} targetElementId 
     * @param {number} rowSize 
     * @param {number} amountRows 
     * @param {number} currentPage 
     * @param {string} borderWidth 
     * @param {string} borderColor 
     */
    async createDisplay(targetElementId=this.targetDivId, rowSize=5, amountRows=2, currentPage=2, ids=this.ids, borderWidth="5px",borderColor = "black") {
        const maxPerPage = rowSize*amountRows
        const idsCurrentPage = ids.slice((currentPage-1)*maxPerPage, currentPage*maxPerPage)
        const imageWidth = Math.floor(100/(rowSize))
        let targetDiv = document.getElementById(targetElementId)
        
        let allImagesDiv = document.createElement("div")
        allImagesDiv.id = `images-${this.collectionAddress}`
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

            const imgBorderDiv = this.#createBorderDiv(id,index,borderWidth,borderColor,this.collectionAddress)
            
            imageDiv.append(img)
            imgBorderDiv.append(imageDiv)
            imgRootDiv.append(imgBorderDiv)
            allImagesDiv.append(imgRootDiv)
        }


        const infoDiv = await this.#createInfoDiv(this.collectionAddress,this.nftMetaData)

        targetDiv.append(infoDiv, allImagesDiv)
    }

}