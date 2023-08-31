//TODO better naming
class FilterBuilder {
    filterTemplate = { "type": "OR", "inputs": { "idList": [], "conditions": [], "attributes": [] }, "NOT": { "idList": [], "conditions": [], "attributes": [] } }
    validTypes = ["AND", "OR", "RANGE"];
    allFilters = []
    uriHandler = undefined;
    currentFilterIndex = 0;
    constructor(uriHandler, filters = []) {
        console.log(filters)
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
            console.log(key)
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
                                console.log(filter["inputs"][inputName])
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
        html += `${JSON.stringify(await this.allFilters[filterIndex])}`
        document.getElementById("FilterBuilder").innerHTML = html
        this.currentFilterIndex = filterIndex
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

    addItem(filterIndex, target = ["inputs", "attributes"], item) {
        let l = this.allFilters[filterIndex]
        for (let i of target) {
            l = l[i]

        }
        l.push(item)
    }

    removeItem(filterIndex, target = ["inputs", "attributes"], itemIndex) {
        let l = this.allFilters[filterIndex]
        for (let i of target) {
            l = l[i]

        }
        l.splice(itemIndex, 1)
    }


    getAttributeUi(filterIndex = 0) {

        attributesTypes = this.uriHandler.allAtribute
        //TODO find fix for doing fBuilder.setType
        const dropdown = `<div class="dropdown">\n
            <button onclick="fBuilder.displayTypes()" class="dropbtn">addAttribute</button>\n
            <div id="filterTypeDropdown" class="dropdown-content">\n
                ${attributes}
            </div>\n
        </div>\n`
        const html = `${JSON.stringify(this.allFilters[filterIndex].type)} ${dropdown}`
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