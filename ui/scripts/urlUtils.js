export class urlUtils {


    static setAllNavUrls(distanceFromHome=0) {
        const homePath = urlUtils.removeEndsPathname((new URL(window.location.href)).pathname, distanceFromHome) 
        const dropPath = homePath + "/drop/"
        const claimPath = homePath + "/claim/"
        const createPath = homePath + "/create/"
        
        //TODO make function
        const dropUrlElements = document.querySelectorAll(".dropUrl")
        const dropUrl =  urlUtils.getUrlToPath(new URL(window.location.href), homePath) //TODO is set to homepath should make drop page list all
        dropUrlElements.forEach(element => {
            element.href = decodeURIComponent(dropUrl.toString())
        })

        const claimUrlElements = document.querySelectorAll(".claimUrl")
        const claimUrl =  urlUtils.getUrlToPath(new URL(window.location.href), homePath) //TODO is set to homepath should make claim page list all
        claimUrlElements.forEach(element => {
            element.href = decodeURIComponent(claimUrl.toString())
        })


        const createUrlElements = document.querySelectorAll(".createUrl")
        const createUrl =  urlUtils.getUrlToPath(new URL(window.location.href), createPath) //TODO is set to homepath should make claim page list all
        createUrlElements.forEach(element => {
            element.href = decodeURIComponent(createUrl.toString())
        })


        const homeUrlElements = document.querySelectorAll(".homeUrl")
        const chomeUrl =  urlUtils.getUrlToPath(new URL(window.location.href), homePath) //TODO is set to homepath should make claim page list all
        homeUrlElements.forEach(element => {
            element.href = decodeURIComponent(chomeUrl.toString())
        })





        //drops List
        const drops = {
            "0x809f95EaBa6Dcee639258aD49B079dc4F2ecbA5D":"Milady Cake Hat Token"
        }

        const dropsListElements = document.querySelectorAll(".dropsList")
        if(dropsListElements.length) {
            
            dropsListElements.forEach(dropListElement => {
    
                for (const address in drops) {
                    const currentDropPath = urlUtils.getUrlToPath(new URL(window.location.href), dropPath, { "lovedrop": address })
                    const aElement = document.createElement("a")
                    aElement.href = decodeURIComponent(currentDropPath.toString())
                    aElement.innerText = drops[address]
                    const liElement = document.createElement("li")
                    liElement.append(aElement)
                    dropListElement.append(liElement)
                
                }
            })

        }
    }

    static getUrlToPath(url, pathName, addParams = {}) {

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

    static removeParamsFromUrl(url, paramNames = []) {
        [...url.searchParams].forEach((param) => {
            if (paramNames.includes(param[0])) {
                url.searchParams.delete(param[0], param[1])
            }

        })
        return url
    }
    /**
     * 
     * @param {string} pathName 
     * @returns {string}
     */
    static removeEndsPathname(pathName,amount=1) {
        if (amount) {
            return pathName.split("/").filter((i)=>i!=="").slice(0,-1*amount).join("/")
        } else {
            return pathName.slice(1)
        }
        
    }
}
urlUtils.setAllNavUrls()

