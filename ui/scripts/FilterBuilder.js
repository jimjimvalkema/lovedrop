//TODO better naming
class FilterBuilder {
    filterTemplate = { "type": "OR", "inputs": { "idList": [], "conditions": [], "attributes": [] }, "NOT": { "idList": [], "conditions": [], "attributes": [] } }
    validTypes = ["AND","OR","RANGE"];
    allFilters = []
    uriHandler = undefined;
    currentFilterIndex = 0;
    constructor(uriHandler, filters = []) {
        this.uriHandler = uriHandler;
        this.allFilters = filters
        this.allAtribute
    }

    async displayFilter(filterIndex) {
        let html = this.getTypeUi(filterIndex)
        html += `${JSON.stringify(await this.allFilters[filterIndex])}`
        document.getElementById("FilterBuilder").innerHTML = html
        window.idsOnDisplay = [...(await this.uriHandler.processFilter(this.allFilters[filterIndex]))] //TODO check if filter is the same and cache its result in idList
        return html
    }

    prettyPrintFilterInfo(filter) {
        const listInputType =["idList","conditions","attributes"]
        let inputInfoString = ""
        if(filter.type === "RANGE") { //TODO matbe do switch
            if (!(filter.inputs.start || filter.inputs.stop)) {
                inputInfoString += "all, "
            } else if(filter.inputs.start) {
                inputInfoString += `from ${filter.inputs.start} - all, `
            } else if(filter.inputs.stop) {
                inputInfoString += `from 0 - ${filter.inputs.stop}, `
            } else {
                inputInfoString += `from ${filter.inputs.start} - ${filter.inputs.stop}, `
            }
        }
        console.log(filter)
        for(const inputType of listInputType) {
            if (filter.inputs[inputType] && Object.keys(filter.inputs[inputType]).length > 0) {
                inputInfoString += `${inputType}: ${filter.inputs[inputType].length+1} items, `
            }
        }
        if (filter["NOT"] && Object.keys(filter["NOT"]).length > 0) {
            inputInfoString += "NOT: "
            for(const inputType of listInputType) {
                if (filter.NOT[inputType] && Object.keys(filter.NOT[inputType]).length > 0) {
                    inputInfoString += `${inputType}: ${filter.NOT[inputType].length+1} items, `
                }
            }
        }


        inputInfoString = inputInfoString.slice(0, -2)
        const infoString = `${filter.type}: ${inputInfoString}`
        console.log(infoString)
        return infoString
    }

    filtersDropDown(filters = this.allFilters) {
        let selectFiltersButtons = ""
        console.log(filters)
        for(let i=0; i<filters.length; i++) {
            const info = this.prettyPrintFilterInfo(filters[i])
            selectFiltersButtons += `<button onclick="fBuilder.displayFilter(${i})" >edit</button>${info}</br>\n`
            console.log(selectFiltersButtons)
            console.log(filters[i])
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

    addAttribute(filterIndex, target="inputs", attribute) {
        this.allFilters[filterIndex][target].push(attribute) 
    }

    removeAttribute(filterIndex, target="inputs", attributeIndex) {
        this.allFilters[filterIndex][target].splice(attributeIndex, 1)
    }

    getAttributeUi(filterIndex = 0) {

        attributesTypes =
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