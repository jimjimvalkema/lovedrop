import { NftMetaDataCollector } from "../../ui/scripts/NftMetaDataCollector"
import { IpfsIndexer } from "../../ui/scripts/IpfsIndexer"
import { allExtraMetaData } from "../../ui/scripts/extraMetaData"


/** 
* @typedef NamedHash
* @type {object}
* @property {string} name 
* @property {string} hash 
*
* @typedef ipfsHash
* @type {string}
*/

class MetaDataIndexer {
    ipfsApis = ["http://127.0.0.1:5001"]
    messageElementId = ""
    auth = null

    /**
     * 
     * @param {IpfsIndexer} ipfsIndex 
     */
    constructor (ipfsIndex) {
        if(ipfsIndex) {
            /**@type {IpfsIndexer} this.ipfsIndex */
            this.ipfsIndex = ipfsIndex

        } else {
            /**@type {IpfsIndexer} this.ipfsIndex */
            this.ipfsIndex =  new IpfsIndexer(["http://127.0.0.1:5001"],this.auth,false,this.messageElementId) 
        }
    }
    
    /**
     * 
     * @param {allExtraMetaData} allExtraMetaData 
     * @param {IpfsIndexer} ipfsIndex 
     * @returns 
     */
    async createPinAbleHash(allExtraMetaData=allExtraMetaData, ipfsIndex = this.ipfsIndex) {
        /**@type {NamedHash[]} namedHashes */
        const namedHashesAllCollections = []

        for (const address in allExtraMetaData) {
            /**@type {NamedHash[]} namedHashes */
            const namedHashes = []

            const collection = allExtraMetaData[address]
            for (const key in collection) {
                const value = collection[key]
                if (MetaDataIndexer.isIpfsHash(value)) {
                    namedHashes.push({
                        name:key,
                        hash:value.slice(7)
                    })
                }
            }

            const extraMetaDataFileName = `${collection.name}-fullExtraMetaDataObj.json`
            const extraMetaDataFileHash = (await ipfsIndex.addToIpfs(JSON.stringify(collection, null, 2),extraMetaDataFileName))["Hash"]
            namedHashes.push({
                name: extraMetaDataFileName,
                hash: extraMetaDataFileHash
            })

            namedHashesAllCollections.push({
                name:address,
                hash: await ipfsIndex.wrapMultipleInDirectory(namedHashes)
            })



        }
        return await ipfsIndex.wrapMultipleInDirectory(namedHashesAllCollections)
    }
    /**
     * 
     * @param {string} string 
     * @returns {boolean}
     */
    static isIpfsHash(string) {
        return (typeof(string) === "string") && string.startsWith("ipfs://")
    }
}
async function  main() {
    const firstArgument = Bun.argv[1]
    const workingDir = import.meta.url.split("/").slice(null,-1).join("/")
    const workinDirBunFile = structuredClone(workingDir).slice(7)

    
    const metaDataIndexer = new MetaDataIndexer()
    const hash = await metaDataIndexer.createPinAbleHash(allExtraMetaData)
    console.log("pinnable hash: ", hash)


}
main()
