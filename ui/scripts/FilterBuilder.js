


//TODO better naming
class FilterBuilder {
    filterTemplate = { "type": "OR", "inputs": { "idList": [], "conditions": [], "attributes": [] }, "NOT": { "idList": [], "conditions": [], "attributes": [] } }
    validTypes = ["AND", "OR", "RANGE"];
    allFilters = []
    uriHandler = undefined;
    currentFilterIndex = 0;
    constructor(uriHandler, filters = []) {
        this.uriHandler = uriHandler;
        //TODO needs deep copy?

        for (let i = 0; i < filters.length; i++) {
            this.allFilters.push(this.formatNewFilter(filters[i], i))
        }
        this.allAtribute
    }

    formatNewFilter(filter, index) {
        filter.filterIndex = index
        const keys = Object.keys(this.filterTemplate)
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            switch (key) {
                case "type":
                    continue
                case "inputs":
                    if (!("inputs" in filter)) {
                        filter["inputs"] = structuredClone(this.filterTemplate.inputs)
                    } else {
                        const inputs = Object.keys(this.filterTemplate["inputs"])
                        for (let i = 0; i < inputs.length; i++) {
                            const inputName = inputs[i]
                            if ((!(inputName in filter["inputs"])) || !(filter["inputs"][inputName])) {
                                filter["inputs"][inputName] = []
                            }
                        }
                    }
                    continue
                case "NOT":
                    if (!("NOT" in filter)) {
                        filter["NOT"] = structuredClone(this.filterTemplate.NOT)

                    } else {
                        const NOTInputs = Object.keys(this.filterTemplate["NOT"])
                        for (let i = 0; i < NOTInputs.length; i++) {
                            const inputName = NOTInputs[i]
                            if (!(inputName in filter["NOT"]) || !(filter["NOT"][inputName])) {
                                filter["NOT"][inputName] = []
                            }
                        }
                    }
                    continue

            }
        }



        return filter
    }

    getCurrentFilter() {
        return this.allFilters[this.currentFilterIndex]
    }

    async displayFilter(filterIndex) {
        let html = this.getTypeUi(filterIndex)
        //TODO remove debug \/
        html += `\n <div id="fullFilterJson"> ${JSON.stringify(await this.allFilters[filterIndex])} </div>`
        document.getElementById("FilterBuilder").innerHTML = html
        this.currentFilterIndex = filterIndex
        document.getElementById("editAttributes").innerHTML = this.getEditAttributesButton(filterIndex)
        //window.idsOnDisplay = [...(await this.uriHandler.processFilter(this.allFilters[filterIndex]))] //TODO check if filter is the same and cache its result in idList
        return html
    }

    prettyPrintFilterInfo(filter) {
        const attrValueKey = this.uriHandler.attributeFormat.valueKey
        const listInputType = ["idList", "conditions", "attributes"]
        var inputInfoString = "[";
        //.log(inputInfoString)
        if (filter.type === "RANGE") { //TODO matbe do switch
            if ((!filter.inputs.start) && (!filter.inputs.stop)) {
                inputInfoString += "all, "
            } else if (filter.inputs.start) {
                inputInfoString += `from ${filter.inputs.start} - all, `
            } else if (filter.inputs.stop) {
                inputInfoString += `from 0 - ${filter.inputs.stop}, `
            } else {
                inputInfoString += `from ${filter.inputs.start} - ${filter.inputs.stop}, `
            }
        }
        //.log(inputInfoString)
        for (const inputType of listInputType) {
            //.log(`${inputType}, ${inputInfoString}`)
            if (filter.inputs[inputType] && Object.keys(filter.inputs[inputType]).length > 0) {
                if (inputType === "attributes") {
                    //TODO do this in a function
                    //.log(inputInfoString)
                    if (filter.inputs[inputType].length < 2) {
                        const firstTwoItems = filter.inputs[inputType].map((x) => ` ${x[attrValueKey]}`);
                        inputInfoString += `${inputType}: ${firstTwoItems.toString()}, `

                    } else {
                        const firstTwoItems = filter.inputs[inputType].slice(0, 2).map((x) => ` ${x[attrValueKey]}`);
                        const firstTwoItemsString = firstTwoItems.toString()
                        inputInfoString += `${inputType}: ${firstTwoItemsString}.. (+${filter.inputs[inputType].length - 1}), `

                    }
                    //.log(inputInfoString)

                } else if (inputType === "conditions") {
                    if (filter.inputs[inputType].length < 2) {
                        const firstTwoItems = filter.inputs[inputType].map((x) => ` F${x.filterIndex + 1}:${x.type}`);
                        inputInfoString += `${inputType}: ${firstTwoItems.toString()}, `

                    } else {
                        const firstTwoItems = filter.inputs[inputType].slice(0, 2).map((x) => ` F${x.filterIndex + 1}:${x.type}`);
                        const firstTwoItemsString = firstTwoItems.toString()
                        inputInfoString += `${inputType}: ${firstTwoItemsString}.. (+${filter.inputs[inputType].length - 1}), `

                    }
                    //.log(`conditions result: ${inputInfoString}`)

                } else {
                    //.log(inputInfoString)
                    if (filter.inputs[inputType].length < 2) {
                        inputInfoString += `${inputType}: ${filter.inputs[inputType].toString()}, `

                    } else {
                        const firstTwoItems = filter.inputs[inputType].slice(0, 2).toString()
                        inputInfoString += `${inputType}: ${firstTwoItems}.. (+${filter.inputs[inputType].length - 1}), `

                    }
                    //.log(inputInfoString)

                }
            }

        }
        inputInfoString = inputInfoString.slice(0, -2)
        inputInfoString += "]"
        //.log(inputInfoString)
        if (filter["NOT"] && Object.keys(filter["NOT"]).length > 0) {
            inputInfoString += " NOT: ["
            for (const inputType of listInputType) {
                if (filter.NOT[inputType] && Object.keys(filter.NOT[inputType]).length > 0) {
                    if (inputType === "attributes") {
                        //TODO do this in a function
                        if (filter.NOT[inputType].length < 2) {
                            const firstTwoItems = filter.NOT[inputType].map((x) => ` ${x.value}`);
                            inputInfoString += `${inputType}: ${firstTwoItems.toString()}, `

                        } else {
                            const firstTwoItems = filter.NOT[inputType].slice(0, 2).map((x) => ` ${x.value}`);
                            const firstTwoItemsString = firstTwoItems.toString()
                            inputInfoString += `${inputType}: ${firstTwoItemsString}.. (+${filter.NOT[inputType].length - 1}), `

                        }
                        //.log(inputInfoString)

                    } else if (inputType === "conditions") {
                        if (filter.NOT[inputType].length < 2) {
                            const firstTwoItems = filter.NOT[inputType].map((x) => ` F${x.filterIndex + 1}:${x.type}`);
                            inputInfoString += `${inputType}: ${firstTwoItems.toString()}, `

                        } else {
                            const firstTwoItems = filter.NOT[inputType].slice(0, 2).map((x) => ` F${x.filterIndex + 1}:${x.filterIndex + 1}`);
                            const firstTwoItemsString = firstTwoItems.toString()
                            inputInfoString += `${inputType}: ${firstTwoItemsString}.. (+${filter.NOT[inputType].length - 1}), `

                        }
                        //.log(inputInfoString)

                    } else {
                        if (filter.NOT[inputType].length < 2) {
                            inputInfoString += `${inputType}: ${filter.NOT[inputType].toString()}, `

                        } else {
                            const firstTwoItems = filter.NOT[inputType].slice(0, 2).toString()
                            inputInfoString += `${inputType}: ${firstTwoItems}.. (+${filter.NOT[inputType].length - 1}), `

                        }
                        //.log(inputInfoString)

                    }
                }
            }
            //.log(inputInfoString)
            inputInfoString = inputInfoString.slice(0, -2)
            inputInfoString += "]"
            //.log(inputInfoString)
        }



        inputInfoString = `Filter${filter.filterIndex + 1} ${filter.type}: ${inputInfoString}`
        return inputInfoString
    }

    filtersDropDown(filters = this.allFilters) {
        let selectFiltersButtons = ""
        for (let i = 0; i < filters.length; i++) {
            const info = this.prettyPrintFilterInfo(filters[i])
            selectFiltersButtons += `<button onclick="fBuilder.displayFilter(${i})" >edit</button>${info}</br>\n`
        }

        const html = `<div class="dropdown">\n
            <button onclick="fBuilder.displayfilters()" class="dropbtn">showFilters</button>\n
            <div id="allFiltersDropdown" class="dropdown-content">\n
                ${selectFiltersButtons}
                </div>\n
        </div>\n`
        document.getElementById("filtersDropDown").innerHTML = html;
        return html

    }

    setType(filterIndex, type) {
        if (this.validTypes.indexOf(type) == -1) {
            throw new Error(`${type} is not a valid type. The valid types are: ${JSON.stringify(this.validTypes)}`)
        }
        if (filterIndex > this.allFilters[filterIndex]) {
            throw new Error(`filterIndex: ${filterIndex} doesn't exist or is u defined. allFiltes lenght = ${this.allFilters.length}`)
        }

        this.allFilters[filterIndex].type = type
        document.getElementById("FilterBuilder").innerHTML = this.displayFilter(filterIndex)
    }

    getTypeUi(filterIndex = 0) {
        //TODO find fix for doing fBuilder.setType
        const dropdown = `<div class="dropdown">\n
            <button onclick="fBuilder.displayTypes()" class="dropbtn">setType</button>\n
            <div id="filterTypeDropdown" class="dropdown-content">\n
                <button onclick="fBuilder.setType(${filterIndex}, \'AND\')">AND</button></br>\n
                <button onclick="fBuilder.setType(${filterIndex}, \'OR\')">OR</button></br>\n
                <button onclick="fBuilder.setType(${filterIndex}, \'RANGE\')">RANGE</button></br>\n
            </div>\n
        </div>\n`
        const html = `${JSON.stringify(this.allFilters[filterIndex].type)} ${dropdown}`
        return html
    }

    getTargettedArray(fullObject,target) {
        let targetedArray = fullObject
        for (let key of target) {
            targetedArray = targetedArray[key]
        }
        return targetedArray
    }

    addItem(filterIndex, item, target = ["inputs", "attributes"]) {
        // let l = this.allFilters[filterIndex]
        // for (let i of target) {
        //     l = l[i]

        // }

        let l = this.getTargettedArray(this.allFilters[filterIndex], target)
        const index = l.push(item) - 1
        return index
    }

    removeItem(filterIndex, itemIndex, target = ["inputs", "attributes"]) {
        // let l = this.allFilters[filterIndex]
        // for (let i of target) {
        //     l = l[i]

        // }
        let l = this.getTargettedArray(this.allFilters[filterIndex], target)
        l.splice(itemIndex, 1)
    }


    getItemIndex(filterIndex, item, target = ["inputs", "attributes"]) {
        let index = 0;
        // let l = this.allFilters[filterIndex]
        // for (let i of target) {
        //     l = l[i]
        // }

        let l = this.getTargettedArray(this.allFilters[filterIndex], target)
        switch(target[target.length-1]) {
            case "attributes":
                index = l.map(x => JSON.stringify(x)).indexOf(JSON.stringify(item)) //TODO!!! assumes values are uniqe
                break
            
            case "conditions":
                index = l.map(x => x.filterIndex).indexOf(item.filterIndex)
                break
            default:
                index = l.indexOf(item)
                break
        }
    
        return index
    }

    addItemInUi(filterIndex, item,buttonId, target = ["inputs", "attributes"]) {
        const traitTypeKey = this.uriHandler.attributeFormat.traitTypeKey
        const valueKey = this.uriHandler.attributeFormat.valueKey

        const itemIndex = this.addItem(filterIndex, item, target)
        document.getElementById(buttonId).innerHTML = this.getButtonHtml({
            btnType:"remove",
            buttonId:buttonId,
            item:JSON.stringify(item),
            itemName:item[valueKey],
            target:["inputs", "attributes"],
            itemIndex
        });

        //This is debug
        document.getElementById("fullFilterJson").innerHTML = JSON.stringify(this.getCurrentFilter())
        console.log(`changing: ${buttonId}`)
    }


    removeItemInUi(filterIndex, item, itemIndex,buttonId, target = ["inputs", "attributes"]) {
        const traitTypeKey = this.uriHandler.attributeFormat.traitTypeKey
        const valueKey = this.uriHandler.attributeFormat.valueKey
        this.removeItem(filterIndex, itemIndex, target)
        document.getElementById(buttonId).innerHTML = this.getButtonHtml({
            btnType:"add",
            buttonId:buttonId,
            item:JSON.stringify(item),
            itemName:item[valueKey],
            target:["inputs", "attributes"]
        });
        
        //This is debug
        document.getElementById("fullFilterJson").innerHTML = JSON.stringify(this.getCurrentFilter())
        console.log(`changing: ${buttonId}`)
    }


    //TODO better name
    getButtonHtml({btnType, buttonId, item, itemName, target = ["inputs", "attributes"], itemIndex=0, style = "width:60px;"}={}) {
        let html = ""

        switch (btnType) {
            case "add":
                html = `
                <div id='${buttonId}'>
                    <button 
                        style="${style}" 
                        onclick='
                            fBuilder.addItemInUi(
                                ${this.currentFilterIndex},
                                ${item}, 
                                "${buttonId}",
                                ${JSON.stringify(target)},
                            )'>add
                    </button>
                    <a>${itemName}</a>
                </div>\n`
                break

                case "remove":
                    html = `
                    <div id='${buttonId}'>
                        <button 
                            style="${style}" 
                            onclick='
                                fBuilder.removeItemInUi(
                                    ${this.currentFilterIndex},
                                    ${item}, 
                                    ${itemIndex},
                                    "${buttonId}",
                                    ${JSON.stringify(target)},
                                )'>remove
                        </button>
                        <a>${itemName}</a>
                    </div>\n`
                    break
        }

        return html

    }


    getAllTraitsMenu(traitType, target = ["inputs", "attributes"], everyAttribute = this.uriHandler.everyAttribute) {
        const traitTypeKey = this.uriHandler.attributeFormat.traitTypeKey
        const valueKey = this.uriHandler.attributeFormat.valueKey

        let html = ""
        switch (everyAttribute[traitType].attribute) {
            case "string":
                break
            case "number":
                break
        }
        
        for (let attribute of Object.keys(everyAttribute[traitType].attributes)) {
            
            //specific to attr
            let fullAttrObj = {}
            fullAttrObj[traitTypeKey] = traitType
            fullAttrObj[valueKey] = attribute
            const item = fullAttrObj
            const buttonId = `${fullAttrObj[traitTypeKey]}-${fullAttrObj[valueKey]}-${target.toString()}-button`.replaceAll(",",":").replaceAll(" ", "");

            let itemIndex = this.getItemIndex(this.currentFilterIndex, item, target)


            if (itemIndex === -1) { //if attribute not in current filter
                html += this.getButtonHtml({
                    btnType : "add",
                    buttonId : buttonId,
                    item : JSON.stringify(item),
                    itemName : attribute,
                    target:["inputs", "attributes"]})
            } else {
                html += this.getButtonHtml({
                    btnType : "remove",
                    buttonId : buttonId,
                    item : JSON.stringify(item),
                    itemName : attribute,
                    target : ["inputs", "attributes"],
                    itemIndex : itemIndex})
            }   

        }
        return html

    }

    getTraitTypeMenu(everyAttribute = this.uriHandler.everyAttribute) {

        let html = ""
        for (let traitType of Object.keys(everyAttribute)) {
            html += `<div class="dropdown" style="height: 300px;">\n
                <button onclick="fBuilder.displayAllAttributes(\'${traitType}\')" class="dropbtn">${traitType}</button></br>\n
                <div id="${traitType}AttributesDropDown" class="dropdown-content" >\n
                    ${this.getAllTraitsMenu(traitType)}
                </div>\n
            </div>\n`
        }
        return html
    }

    getEditAttributesButton(currentFilter = this.getCurrentFilter(), dorpdown = false) {
        //TODO find fix for doing fBuilder.setType
        let html
        if (dorpdown) {
            html = `<div class="dropdown">\n
            <button onclick="fBuilder.displayAllTraitTypes()" class="dropbtn">setType</button>\n
            <div id="allTraitTypesDropDown" class="dropdown-content">\n
                ${this.getTraitTypeMenu()}
            </div>\n
        </div>\n`
        } else {
            html = this.getTraitTypeMenu()
        }
        return html

    }


    displayAllAttributes(trait_type) {
        document.getElementById(`${trait_type}AttributesDropDown`).classList.toggle("show");
    }

    displayAllTraitTypes() {
        document.getElementById("allTraitTypesDropDown").classList.toggle("show");
    }


    getAttributeUi(filterIndex = 0) {
        let html = this.displayAllTraitTypes()
        return html
    }

    /* When the user clicks on the button, 
    toggle between hiding and showing the dropdown content */
    displayTypes() {
        document.getElementById("filterTypeDropdown").classList.toggle("show");
    }

    /* When the user clicks on the button, 
    toggle between hiding and showing the dropdown content */
    displayfilters() {
        this.filtersDropDown()
        document.getElementById("allFiltersDropdown").classList.toggle("show");
    }



}

// Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}