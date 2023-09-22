

<<<<<<< HEAD
const delay = ms => new Promise(res => setTimeout(res, ms));
=======
>>>>>>> 0bc37d9fa994a5eb6a5d61f27eaa985d86314249

//TODO better naming
class FilterBuilder {
    filterTemplate = { "type": "OR", "inputs": { "idList": [], "conditions": [], "attributes": [] }, "NOT": { "idList": [], "conditions": [], "attributes": [] } }
    validTypes = ["AND", "OR", "RANGE"];
    allFilters = []
    uriHandler = undefined;
    currentFilterIndex = 0;
<<<<<<< HEAD
    rawListingsOpenSea = []
    formattedListings = []
    constructor(uriHandler, filters = []) {
        this.uriHandler = uriHandler;
        this.nftAddr = this.uriHandler.contractObj.address
=======
    constructor(uriHandler, filters = []) {
        this.uriHandler = uriHandler;
>>>>>>> 0bc37d9fa994a5eb6a5d61f27eaa985d86314249
        //TODO needs deep copy?

        for (let i = 0; i < filters.length; i++) {
            this.allFilters.push(this.formatNewFilter(filters[i], i))
        }
        this.allAtribute
    }

    formatNewFilter(filter, index) {
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
                        if (filter["type"]==="RANGE") {
                            if (!"start" in filter.inputs) {
                                filter.inputs["start"] = this.uriHandler.idStartsAt
                            }
                        }
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

        filter.filterIndex = index
        if (!("filterName" in filter)) {
            filter.filterName = `${filter.type}FILTER${filter.filterIndex}`
        }


        return filter
    }

    getCurrentFilter() {
        return this.allFilters[this.currentFilterIndex]
    }

    async displayFilter(filterIndex=this.currentFilterIndex) {
        let html = ""
        //TODO remove debug \/
        //html += `\n <div id="fullFilterJson"> ${JSON.stringify(await this.allFilters[filterIndex])} </div>`
        //document.getElementById("FilterBuilder").innerHTML = html
        this.currentFilterIndex = filterIndex
        document.getElementById("editFilter").innerHTML = this.getEditFilterUi(filterIndex)
        //document.getElementById("editAttributes").innerHTML =    this.getEditAttributesButton() 
        //document.getElementById("test").innerHTML = this.getEditItemsDropDown(this.getCurrentFilter(),["inputs","attributes"]) //TODO do this everytime item gets added
        //document.getElementById("inputSelector").innerHTML = this.getInputSelectorUi()
        //window.idsOnDisplay = [...(await this.uriHandler.processFilter(this.allFilters[filterIndex]))] //TODO check if filter is the same and cache its result in idList
        return html
    }

    //breaks on array buffers
    removeEmptyKeys(object) {
        //fix for
        const keys = Object.keys(object)
        for(const key of keys) {
            if (typeof(object[key]) ==="object") {
                if (!Array.isArray(object[key])) {
                    if (Object.keys(object[key]).length) {
                        this.removeEmptyKeys(object[key])
                        if (!Object.keys(object[key]).length) {
                            delete object[key]
                        }
                    } else {
                        delete object[key]
                    }
                } else if(object[key].length) {
                    this.removeEmptyKeys(object[key])
                    if(!object[key].length) { 
                        delete object[key]
                    }

                } else {
                    delete object[key]
                }
            } else {
                if (!object[key]) {
                    delete object[key]
                }
            }
        }
        return object
    }

    getUi() {
        document.getElementById("inputSelector").innerHTML = this.getInputSelectorUi()
        document.getElementById("editFilter").innerHTML = this.getEditFilterUi(this.currentFilterIndex)
    }

    switchFilter(filterIndex) {
        this.currentFilterIndex = filterIndex
        document.getElementById("editFilter").innerHTML = this.getEditFilterUi(filterIndex)
        this.setInputSelectorField(window.currentTarget)

    }
    displayDropDown(id) {
        document.getElementById(id).classList.toggle("show");
    }

    currentInputTypeUi() {
        switch (window.currentTarget[1]) {
            case "idList":
                return "id"
            case "conditions":
                return "filter"
            case "attributes":
                return "attribute"
        }
    }

    setInputTypeUi(type) {
        window.currentTarget[1] = type
        this.setInputSelectorField(window.currentTarget)
        document.getElementById("displayDropDownbtn").innerHTML = this.currentInputTypeUi()
    }

    inputTypeDropDown() {
        //TODO find fix for doing fBuilder.setType
        const dropdown = `<div class="dropdown">\n
            <button onclick="fBuilder.displayDropDown(\'inputTypeDropDown\')" class="dropbtn" id="displayDropDownbtn" >${this.currentInputTypeUi()}</button>\n
            <div id="inputTypeDropDown" class="dropdown-content">\n
                <button onclick="fBuilder.setInputTypeUi( \'attributes\')">attribute</button></br>\n
                <button onclick="fBuilder.setInputTypeUi( \'idList\')">id</button></br>\n
                <button onclick="fBuilder.setInputTypeUi( \'conditions\')">filter</button></br>\n
            </div>\n
        </div>\n`
        const html = `${dropdown}`
        return html
    }

    getInputSelectorUi() {
        if (!window.currentTarget) {
            window.currentTarget = ["inputs", "attributes"]
        }
        this.setInputSelectorField(window.currentTarget)
        window.currentTarget[0] = "inputs"
        let html =`
        Add: ${this.inputTypeDropDown()} </br>
        to: <a id='AddExclBtn'><button onclick='fBuilder.switchAddExclButton()'>include list</button></a>
        `
        return html
    }

    switchAddExclButton() {
        let html = ""
        if (window.currentTarget[0] === "NOT"){
            window.currentTarget[0] = "inputs"
            html = "<button onclick='fBuilder.switchAddExclButton()'>include list</button>" 
        } else {
            window.currentTarget[0] = "NOT"
            html = "<button onclick='fBuilder.switchAddExclButton()'>exclude list</button>"
        }
        document.getElementById("AddExclBtn").innerHTML = html
        document.getElementById("editFilter").innerHTML = this.getEditFilterUi(this.currentFilterIndex)
        this.setInputSelectorField(window.currentTarget)
        return html
    }

    setInputSelectorField(target) {
        switch (target[target.length-1]) {
            case "attributes":
                document.getElementById("inputSelectorField").innerHTML = this.getTraitTypeMenu(this.uriHandler.everyAttribute,"max-height: 30vh;margin-left:10ch;",window.currentTarget)
                break
            case "idList":
                document.getElementById("inputSelectorField").innerHTML = `add nft id:<input onchange='fBuilder.addIdUi(${this.currentFilterIndex},this.value, ${JSON.stringify(window.currentTarget)})' type="number" id="idInput" name="id" min="${this.uriHandler.idStartsAt}" max="${this.uriHandler.getTotalSupply()}"/></br>TODO make comma+space separated input` //min="10" max="100" />`
                break
            case "conditions":
                document.getElementById("inputSelectorField").innerHTML = `${this.filterSelecterUi(this.allFilters, "removeFilterUi", "add")}`
                //document.getElementById("inputSelectorField").style = 'overflow-y: scroll; height:10vh;'
                break
        }
        
    }

    async addIdUi(filterIndex, id, target) {
        if (id <= (await this.uriHandler.getTotalSupply()) && id >= this.uriHandler.idStartsAt) {
            this.addItem(filterIndex,id,target)
            document.getElementById("editFilter").innerHTML = this.getEditFilterUi(this.currentFilterIndex)

        } else {
            console.log("TODO handle user error, id outside total supply or below lowesr id")
        }
    }

    addFilterUi(filterIndex, target=window.currentTarget) {
        const addFilter = this.allFilters[filterIndex]
        this.addItem(this.currentFilterIndex, addFilter, target)
        document.getElementById(`filter${filterIndex}`).innerHTML = `remove`
        document.getElementById(`filter${filterIndex}`).onclick = function() {fBuilder.removeFilterUi(filterIndex)}
        document.getElementById("editFilter").innerHTML = this.getEditFilterUi(this.currentFilterIndex)

        //This is debug
        //document.getElementById("fullFilterJson").innerHTML = JSON.stringify(this.getCurrentFilter())

    }

    removeFilterUi(filterIndex, target=window.currentTarget) {
        const removeFilter = this.allFilters[filterIndex]

        this.removeItem(this.currentFilterIndex, removeFilter, target)
        document.getElementById(`filter${filterIndex}`).innerHTML = `add`
        document.getElementById(`filter${filterIndex}`).onclick = function() {fBuilder.addFilterUi(filterIndex)}
        document.getElementById("editFilter").innerHTML = this.getEditFilterUi(this.currentFilterIndex)

        //This is debug
        //document.getElementById("fullFilterJson").innerHTML = JSON.stringify(this.getCurrentFilter())
    }

<<<<<<< HEAD
    sortIdsByPrice(a, b){
        if (a in this.formattedListings) {
            a = this.formattedListings[a][0].value
        } else {
            a = Infinity
        }
        if (b in this.formattedListings) {
            b = this.formattedListings[b][0].value
        } else {
            b=Infinity
        }
        return a-b
    }


    async runFilter(sortOrder,filter=this.getCurrentFilter()) {
        //this.displayFilter()
        document.getElementById("editFilter").innerHTML = this.getEditFilterUi(this.currentFilterIndex)
        let ids= [...(await this.uriHandler.processFilter(filter))]
        ids.sort((a,b)=>a-b)
        switch (sortOrder) {
            case "asc":
                ids.sort((a,b)=>this.sortIdsByPrice(a,b))
                break;
        
            default:
                break;
        }
        return ids
=======
    async runFilter(filter=this.getCurrentFilter()) {
        //this.displayFilter()
        document.getElementById("editFilter").innerHTML = this.getEditFilterUi(this.currentFilterIndex)
        return await this.uriHandler.processFilter(filter)
>>>>>>> 0bc37d9fa994a5eb6a5d61f27eaa985d86314249
        
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
                        const firstTwoItems = filter.inputs[inputType].map((x) => ` F:${x.filterName}`);
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
            inputInfoString += "</br> NOT: ["
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
                            const firstTwoItems = filter.NOT[inputType].map((x) => ` F:${x.filterName}`);
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



        inputInfoString = `<div class="tooltip"> \n 
            ${filter.filterName}
            <span class="tooltiptext">type: ${filter.type} </br> inputs: ${inputInfoString}</span>
        </div>`
        return inputInfoString
    }

    filterSelecterUi(filters, buttonType="edit") {
        let selectFiltersButtons = ""
        for (let i = 0; i < filters.length; i++) {
            if (filters[i]) {
                const info = this.prettyPrintFilterInfo(filters[i])
                if (buttonType==="edit") {
                    selectFiltersButtons += `<button id='editFilter${i}' onclick="fBuilder.switchFilter(${i})" >edit</button>${info}</br>\n`
                } else {
                    //buttonType=add/remove
                    if (!(this.currentFilterIndex === i)) {
                        if (this.getItemIndex(this.currentFilterIndex ,this.allFilters[i], window.currentTarget ) === -1) {
                            selectFiltersButtons += `<button id='filter${i}' onclick="fBuilder.addFilterUi(${i})" >add</button>${info}</br>\n`

                        } else {
                            selectFiltersButtons += `<button id='filter${i}' onclick="fBuilder.removeFilterUi(${i})" >remove</button>${info}</br>\n`
                        }
                    }

                }
            }

        }
        return selectFiltersButtons
    } 
    
    createNewFilterUi(filterTemplate) {
        let newFilter = structuredClone(this.filterTemplate)
        newFilter.filterName = `newFilter${this.allFilters.length+1}`
        newFilter.filterIndex = this.allFilters.length
        this.currentFilterIndex = this.allFilters.length
        this.allFilters.push(this.formatNewFilter(newFilter, this.allFilters.length))

        document.getElementById("editFilter").innerHTML = this.getEditFilterUi(this.currentFilterIndex )
        this.setInputSelectorField(window.currentTarget)

    }

    

    filtersDropDown(filters = this.allFilters) {
        let selectFiltersButtons = ""
        for (let i = 0; i < filters.length; i++) {
            if (filters[i]) {
                const info = this.prettyPrintFilterInfo(filters[i])
                selectFiltersButtons += `<button onclick="fBuilder.displayFilter(${i})" >edit</button>${info}</br>\n`
            }
        }

        const html = `<div class="dropdown">\n
            <button onclick="fBuilder.displayfilters()" class="dropbtn">select filter</button>\n
            <div id="allFiltersDropdown" class="dropdown-content" style='overflow:visible; z-index:100; max-height:fit-content;'>\n
                ${this.filterSelecterUi(filters)}
                <button class="dropbtn" onclick='fBuilder.createNewFilterUi()'>create new filter</button>
                </div>\n
        </div>\n`
        //document.getElementById("filtersDropDown").innerHTML = html;
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
        document.getElementById("editFilter").innerHTML = this.getEditFilterUi(filterIndex)
    }

    getNonEmptyInputTypes(filter=this.getCurrentFilter(), target="inputs") {
        let inputTypes = {};
        for (const inputType of Object.keys(filter[target])) {
            if (filter[target][inputType]) {
                if (typeof(filter[target][inputType]) === "object") {
                    if (filter[target][inputType].length) {
                        inputTypes[inputType] = filter[target][inputType].length
                    }
                } else {
                    inputTypes[inputType] = filter[target][inputType]
                }
            }
        }
        return inputTypes
    }

    getUiFromInputTypes(inputTypes, inputField="inputs") {
        let html = ""
        const keys = Object.keys(inputTypes)
        for (const key of keys) {
            const target = [inputField, key]
            const btnId  = `allInputTypesDropdown${JSON.stringify(target).replaceAll("\"", "")}`
            const countId = `count:${JSON.stringify(target).replaceAll("\"", "")}`
            html += `${key}:<a id=${countId}>${inputTypes[key]}</a> items 
            <div class="dropdown">
                <button onclick=\"fBuilder.displayEditItemsDropDown(\'${btnId}\')\" class="dropbtn">edit</button>
                <div id='${btnId}' class="dropdown-content">${this.getEditItemsDropDown(fBuilder.getCurrentFilter(),target)}</div></br>
            </div>\n, `
        }
        html = html.slice(0,-2)
        return html 
    }

        /* When the user clicks on the button, 
    toggle between hiding and showing the dropdown content */
    displayEditItemsDropDown(btnId) {
        document.getElementById(btnId).classList.toggle("show");
    }

    // showEditItemsDropDown(target, currentFilter=this.getCurrentFilter()) {
    //     document.getElementById("test").innerHTML = this.getEditItemsDropDown(fBuilder.getCurrentFilter(),target)
    // }



    getInputsUi(filter=this.getCurrentFilter()) {
        let html = ""
        const inputTypes = this.getNonEmptyInputTypes(filter, "inputs")
        const inputTypesNOT = this.getNonEmptyInputTypes(filter, "NOT")
        if (Boolean(Object.keys(inputTypes).length)) {
            html+=`
            inputs:[ ${this.getUiFromInputTypes(inputTypes, "inputs")}]
            `
        }

        if (Boolean(Object.keys(inputTypesNOT).length)) {
            html+=`
            NOT inputs:[ ${this.getUiFromInputTypes(inputTypesNOT, "NOT")}]
            `
        }

        return html
    }

    setFilterName(filterName,filterIndex) {
        this.allFilters[filterIndex].filterName = filterName;
        document.getElementById("filterName").onclick = `\'fBuilder.editFilterName()\'`
        this.displayFilter()
    }

    editFilterName(filterIndex=this.currentFilterIndex) {
        if (document.getElementById("filterName").innerHTML.startsWith("<div")) {
            document.getElementById("filterName").innerHTML = `Name: ${this.allFilters[filterIndex].filterName}`
        } else {
            document.getElementById("filterName").onclick = ''
            document.getElementById("filterName").innerHTML = `Name: 
            <input 
                type="text" 
                name="txt" 
                value="${this.allFilters[filterIndex].filterName}"
                onchange="fBuilder.setFilterName(this.value, ${filterIndex})"
                style="width:11ch"
            >`
        }
    }

    getEditFilterUi(filterIndex=this.currentFilterIndex) {
        const currenFilterName = this.allFilters[filterIndex].filterName
        const html = `
        <div>
            ${this.filtersDropDown()}
            <a id="filterName" onclick='fBuilder.editFilterName()' class='clickable'>Name: ${currenFilterName}</a>
            <button onclick="runFilter()">go</button></br>
        
            Type: ${this.getCurrentFilter().type}${this.getTypeUi(filterIndex)},  
            ${this.getInputsUi(this.allFilters[filterIndex])}

        </div>
        `

        return html
    }


    getTypeUi(filterIndex = 0) {
        //TODO find fix for doing fBuilder.setType
        const dropdown = `<div class="dropdown">\n
            <button onclick="fBuilder.displayTypes()" class="dropbtn" >edit</button>\n
            <div id="filterTypeDropdown" class="dropdown-content">\n
                <button onclick="fBuilder.setType(${filterIndex}, \'AND\')">AND</button></br>\n
                <button onclick="fBuilder.setType(${filterIndex}, \'OR\')">OR</button></br>\n
                <button onclick="fBuilder.setType(${filterIndex}, \'RANGE\')">RANGE</button></br>\n
            </div>\n
        </div>\n`
        const html = `${dropdown}`
        return html
    }

    getTargettedObject(fullObject,target) {
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
        let l = this.getTargettedObject(this.allFilters[filterIndex], target)
        if (typeof(item) !== 'object') {
            if (l.indexOf(item) !== -1 ) {
                console.log("item already in list")
                return -1
            }
        }
        const index = l.push(item) - 1
        return index
    }

    removeItem(filterIndex, item, target = ["inputs", "attributes"]) {
        let l = this.getTargettedObject(this.allFilters[filterIndex], target)
        const itemIndex = this.getItemIndex(filterIndex,item,target)//l.map(x => JSON.stringify(x)).indexOf(JSON.stringify(item))
        l.splice(itemIndex, 1)
    }


    getItemIndex(filterIndex, item, target = ["inputs", "attributes"]) {
        let index = 0;
        // let l = this.allFilters[filterIndex]
        // for (let i of target) {
        //     l = l[i]
        // }

        let l = this.getTargettedObject(this.allFilters[filterIndex], target)
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
        const valueKey = this.uriHandler.attributeFormat.valueKey
        let itemName;
        if (target[target.length-1] === "attributes" ) {
            itemName = item[valueKey]
        } else {
            itemName = item
        }

        const traitTypeKey = this.uriHandler.attributeFormat.traitTypeKey
        console.log(`adding ${JSON.stringify(item)} to filterindex:${filterIndex} to target: ${target}`)
        const itemIndex = this.addItem(filterIndex, item, target)
        if (buttonId !== "") {
            document.getElementById(buttonId).innerHTML = this.getButtonHtml({
                btnType:'remove',
                buttonId:buttonId,
                item:item,
                itemName:itemName,
                target:target,
                itemIndex
            });

        }

        //This is debug
        //document.getElementById("fullFilterJson").innerHTML = JSON.stringify(this.getCurrentFilter())

        //this.setInputSelectorField(window.currentTarget)
        document.getElementById("editFilter").innerHTML = this.getEditFilterUi(filterIndex)
        console.log(`pressed: ${buttonId}`)
        
    }


    removeItemInUi(filterIndex, item,buttonId, target = ["inputs", "attributes"], isSwitch=true) {
        const valueKey = this.uriHandler.attributeFormat.valueKey
        let itemName;
        if (target[target.length-1] === "attributes" ) {
            itemName = item[valueKey]
        } else {
            itemName = item
        }
        const traitTypeKey = this.uriHandler.attributeFormat.traitTypeKey
        this.removeItem(filterIndex, item, target)
        if (isSwitch) {
            document.getElementById(buttonId).innerHTML = this.getButtonHtml({
                btnType:'add',
                buttonId:buttonId,
                item:item,
                itemName:itemName,
                target:target
            });
        } else {
            document.getElementById(buttonId).innerHTML = ''
        }
        
        //This is debug
        //document.getElementById("fullFilterJson").innerHTML = JSON.stringify(this.getCurrentFilter())

        //this.setInputSelectorField(window.currentTarget)
        //document.getElementById("editFilter").innerHTML = this.getEditFilterUi(filterIndex)
        if (buttonId.startsWith("remove")) {
            document.getElementById(`count:${buttonId.split("-")[1]}`).innerHTML -= 1
        }
        console.log(`changing: ${buttonId}`)
        document.getElementById("editFilter").innerHTML = this.getEditFilterUi(filterIndex)
    }


    //TODO better name
    getButtonHtml({btnType, buttonId, item, itemName, target = ["inputs", "attributes"], isSwitch=true, style = "width:8ch;"}={}) {
        // if("filterIndex" in item) {
        //     item = {"filterIndex":item.filterIndex}
        // }

        let html = ""

        switch (btnType) {
            case "add":
                html = `
                <div id=${buttonId}>
                    <button 
                        class='dropbtn'
                        style="${style}" 
                        onclick='
                            fBuilder.addItemInUi(
                                ${this.currentFilterIndex},
                                ${JSON.stringify(item).replaceAll("\'","")}, 
                                "${buttonId}",
                                ${JSON.stringify(target).replaceAll("\'", "\"")},
                            )'>add
                    </button>
                    <a>${itemName}</a></div>\n`
                break

                case "remove":
                    html = `
                    <div id=${buttonId}>
                        <button 
                            class='dropbtn'
                            style="${style}" 
                            onclick='
                                fBuilder.removeItemInUi(
                                    ${this.currentFilterIndex},
                                    ${JSON.stringify(item).replaceAll("\'","")}, 
                                    "${buttonId}",
                                    ${JSON.stringify(target).replaceAll("\'", "\"")},
                                    ${isSwitch}
                                )'>remove
                        </button>
                        <a>${itemName}</a></div>\n`
                    break
        }

        return html

    }

    getStringButtons(everyAttribute, traitType, traitTypeKey, valueKey, target) {
        let html = ''
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
                    item : item,
                    itemName : attribute,
                    target: target})
            } else {
                html += this.getButtonHtml({
                    btnType : "remove",
                    buttonId : buttonId,
                    item : item,
                    itemName : attribute,
                    target : target})
            }   

        }
        return html

    }


    getAllTraitsMenu(traitType, target = ["inputs", "attributes"], everyAttribute = this.uriHandler.everyAttribute) {
        const traitTypeKey = this.uriHandler.attributeFormat.traitTypeKey
        const valueKey = this.uriHandler.attributeFormat.valueKey

        let html = ""

        switch (everyAttribute[traitType].dataType) {
            case "string":
                html += this.getStringButtons(everyAttribute, traitType,traitTypeKey, valueKey, target)
                break
            case "number": //addItemInUi(filterIndex, item,buttonId, target = ["inputs", "attributes"])
                //TODO!! prevent adding duplicates and dont use onchange
                html += `<input 
                style='width:15ch'
                class='dropbtn' 
                onkeydown='fBuilder.addNumerAttributeUi(event,${this.currentFilterIndex},"${traitType}", this.value,"", ${JSON.stringify(target)})' 
                type="number" id="${traitType}Input" 
                name="${traitType}" 
                min="${everyAttribute[traitType].min}"
                max="${everyAttribute[traitType].max}"
                placeholder='min:${parseInt(everyAttribute[traitType].min)} - max:${parseInt(everyAttribute[traitType].max)}'
                />Press enter to add
                `
                
                break
        }
        

        return html

    }

    addNumerAttributeUi(event, filterIndex, traitType,value,buttonId, target = ["inputs", "attributes"]) {
        if(event.key === 'Enter') {
            const traitTypeKey = this.uriHandler.attributeFormat.traitTypeKey
            const valueKey = this.uriHandler.attributeFormat.valueKey
            let attr = {}
            attr[traitTypeKey]= traitType
            attr[valueKey] = value
            if(this.getItemIndex(filterIndex, attr, target) === -1) {
                this.addItemInUi(filterIndex, attr,buttonId, target)  

            } else {
                console.log(`item: ${JSON.stringify(attr)}, already added to filterindex: ${filterIndex}, at target: ${JSON.stringify(target)}`)
            }
        }
    }

    getTraitTypeMenu(everyAttribute = this.uriHandler.everyAttribute, style="", target=["inputs","attributes"]) {

        let html = ""
        const keys = Object.keys(everyAttribute)
        for (let i=0; i<keys.length;i++) {
            const traitType = keys[i]
            html += `<div class="dropdown">\n
                <button onclick="fBuilder.displayAllAttributes(\'${traitType}\')" class="dropbtn">${traitType}</button>\n
                <div id="${traitType}AttributesDropDown" class="dropdown-content" style="${style};z-index:${i+2}">\n
                    ${this.getAllTraitsMenu(traitType, target)}
                </div>\n
            </div></br>\n
            `
        }
        return html
    }

    getEditAttributesButton(currentFilter = this.getCurrentFilter(), dropdown = true ) {
        //TODO find fix for doing fBuilder.setType
        let html
        if (dropdown) {
            html = `<div class="dropdown">\n
            <button onclick="fBuilder.displayAllTraitTypes()" class="dropbtn">set attribute</button>\n
            <div id="allTraitTypesDropDown" class="dropdown-content">\n
                ${this.getTraitTypeMenu()}
            </div>\n
        </div>\n`
        } else {
            html = this.getTraitTypeMenu()
        }
        return html

    }

    getEditItemsDropDown(filter, target=["inputs", "attributes"]) {
        const btnId = `editItemsDropDown${JSON.stringify(target).replaceAll("\"","")}`
        const traitTypeKey = this.uriHandler.attributeFormat.traitTypeKey
        const attrValueKey =  this.uriHandler.attributeFormat.valueKey
        const items = this.getTargettedObject(filter, target);
        let itemsNames = items
        let itemType = "id"
        switch (target[target.length-1]) {
            case "attributes":
                itemsNames = itemsNames.map((x) => `${x[attrValueKey]}`)
                itemType = "attribute"
                break
            case "conditions":
                itemsNames = itemsNames.map((x) => `${x.filterIndex+1}:${x.filterName}`)
                itemType = "condition"
                break
            case "idList":
                itemType = "ids"
                break
        }

        let html = ""
        for (let i=0; i<items.length; i++) {
            const itemIndex = this.getItemIndex(this.currentFilterIndex, items[i], target);
            let buttonId;
            let stringFiedItem;
            if (target[1]==="conditions") {
                buttonId = `remove-${JSON.stringify(target)}-Filter${items[i].filterIndex}`
                buttonId = buttonId.replaceAll("\"","").replaceAll(" ","") //it's ugly but works
                stringFiedItem = `filter:${JSON.stringify(items[i].filterIndex)}`

            } else {
                buttonId = `remove-${JSON.stringify(target)}-${JSON.stringify(items[i]).slice(1,-1)}` //it's ugly but works
                buttonId = buttonId.replaceAll("\"","").replaceAll(" ","")
                stringFiedItem = JSON.stringify(items[i])

            }
        


            html += this.getButtonHtml({
                btnType : 'remove',
                buttonId : buttonId,
                item : items[i],
                itemName : itemsNames[i],
                target : target,
                itemIndex : itemIndex,
                isSwitch : false})
        }

        html += `<button onclick='window.currentTarget=${JSON.stringify(target)}'>TODO add ${itemType}</button>`
        //document.getElementById("allTraitTypesDropDown").innerHTML = this.getTraitTypeMenu()
        return html
    }


    displayAllAttributes(trait_type) {
        document.getElementById(`${trait_type}AttributesDropDown`).classList.toggle("show");
    }

    displayAllTraitTypes(btnId) {
        document.getElementById(btnId).classList.toggle("show");
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

    encodeObjectToBase58CBOR(object) {
        return ethers.utils.base58.encode(new Uint8Array(CBOR.encode(object)))
    }

    decodeBase58CBOR(base58CBOR) {
        return CBOR.decode(ethers.utils.base58.decode(base58CBOR).buffer)
    }

    exportFilterAsBase58CBOR(filter=this.getCurrentFilter()) {
        filter = this.removeEmptyKeys(structuredClone(filter))
        return this.encodeObjectToBase58CBOR(filter)
    }

    importFilterBase58CBOR(base58CBOR) {
        const filterObj = this.decodeBase58CBOR(base58CBOR)
        this.importFilterObject(filterObj)
    }

    importFilterObject(filterObj) {
        this.currentFilterIndex = filterObj.filterIndex
        this.allFilters = []
        this.addFilter(filterObj)
        this.getUi()
    }

    addFilter(filter) {
        if ("inputs" in filter && "conditions" in filter.inputs && filter.inputs.conditions.length) {
            for(let key in filter.inputs.conditions) {
                this.addFilter(filter.inputs.conditions[key])
            }
        }
        if ("NOT" in filter && "conditions" in filter.NOT && filter.NOT.conditions.length) {
            for(let key in filter.NOT.conditions) {
                this.addFilter(filter.NOT.conditions[key])
            }
        }
        this.allFilters[filter.filterIndex] = (this.formatNewFilter(filter, filter.filterIndex))
    }

<<<<<<< HEAD
    async retrieveListingsOpensea({ids=[],order="asc",apiKey=window.urlVars["OpenSeaKey"],contractAddr=this.nftAddr}={}) {
        const idsString = ids.join("&token_ids=")
        const options = {
            method: 'GET',
            headers: {accept: 'application/json', 'X-API-KEY': apiKey}
          };
        let tries = 0;
        let r={}
        while (tries<10) {
            try {
                r = await fetch(`https://api.opensea.io/v2/orders/ethereum/seaport/listings?asset_contract_address=${contractAddr}&limit=${ids.length}&token_ids=${idsString}&order_by=eth_price&order_direction=${order}`, options)   
                if ("status" in r && r.status === 429) {
                    console.log(`getting rate limited tried ${tries+1} times :(`)
                    await delay(2000)
                    tries += 1
                    continue
                } else {
                    return r.json()
                }
            
            } catch (error) {
                tries += 3
                await delay(2000)
            }
        } 

        return 0

    }

    async getPriceOpenSea(id=1,order="asc",apiKey=window.urlVars["OpenSeaKey"],contractAddr=this.nftAddr) {
        const r= (await this.retrieveListingsOpensea({ids:[id],order:order,apiKey:apiKey,contractAddr:contractAddr}))
        if ( r!==0 && "orders" in r && r.orders.length) {
            return {"id":id,"price":{[r.orders[0].current_price]:r.orders[0].taker_asset_bundle.assets[0].asset_contract.name}}
        } else {
            return {"id":id,[-1]:"NotListed"}
        }
    }

    async getPricesOpenSea(ids,order="asc",apiKey=window.urlVars["OpenSeaKey"]) {
        let l = []
        for (const id of ids) {
            l.push(this.getPriceOpenSea(id,order,apiKey))
            await delay(100)
            //await delay(1000)
            //await delay(1)
        }

        return Promise.all(l)

    }

    async getPricesOpenSeaInBatches(ids,batchSize=4,order="asc",apiKey=window.urlVars["OpenSeaKey"]) {
        let l=[]
        for (let i = 0; i < ids.length; i += batchSize) {
            const idBatch = ids.slice(i, i + batchSize);
            l.push(await this.getPricesOpenSea(idBatch,order="asc",apiKey=window.urlVars["OpenSeaKey"]))
            await delay(1000)
        }
        return l
    }

    async getSlugStringOpenSea(contractAddr) {
        const options = {
            method: 'GET',
            headers: {accept: 'application/json', 'X-API-KEY': '509e9dd467ef484abab2c5f90fa53d9a'}
          };

        let tries = 0;
        let r={}
        while (tries<10) {
            try {
                const r = await fetch(`https://api.opensea.io/v2/chain/ethereum/contract/${contractAddr}/nfts?limit=1`, options)
                if ("status" in r && r.status === 429) {
                    console.log(`getting rate limited tried ${tries+1} times :(`)
                    await delay(200)
                    tries += 1
                    continue
                } else {
                    return  (await r.json()).nfts[0].collection
                }
            } catch (error) {
                console.log(error)

            }
        }
          
    
    }

    async getAllListingsOpenSea(page="", slugString, listings=[]) {
        const options = {
            method: 'GET',
            headers: {accept: 'application/json', 'X-API-KEY': window.urlVars["OpenSeaKey"]}
          };
        let next=""
        if(page) {
            next = `?next=${page}`  
        }

        let r;
        let tries = 0
        while (tries<5) {
            try {
                r = (await fetch(`https://api.opensea.io/v2/listings/collection/${slugString}/all${next}`, options))  
                if ("status" in r && r.status === 429) {
                    console.log(`getting rate limited tried ${tries+1} times :(`)
                    await delay(200)
                    tries += 1
                    continue
                } else {
                    break
                }
            
            } catch (error) {
                console.log(error)
                tries += 3
                await delay(200)
            }
        } 
        r = await r.json()

    
        listings = [...listings, ...Object.values(r.listings)]
        
        if ("next" in r && r.next) {
            //await delay(1)
            listings = await this.getAllListingsOpenSea(r.next, slugString,listings) 
        }  
        return listings
    }

    async getAllListingsOpenSeaByContract(contractAddr=this.nftAddr) {
        const slugString = await this.getSlugStringOpenSea(contractAddr)
        console.log(slugString)
        //await delay(5)
        return this.getAllListingsOpenSea("",slugString)

    }

    //TODO breaks if currency is different
    sortFormattedLisings(formattedListings) {
        for (const id in formattedListings) {
            formattedListings[id].sort((a, b) => a.value - b.value)
        }
        return formattedListings
    }
    

    formatListingsFromOpenSea(listings=this.rawListingsOpenSea) {
        let formattedListings = {}
        for (const i in listings) {
            const listing = listings[i]
            const id = listing.protocol_data.parameters.offer[0].identifierOrCriteria
            if (!(id in formattedListings)) {
                formattedListings[id] =[{["value"]:listing.price.current.value,["currency"]:listing.price.current.currency,["source"]:"OpenSea", ["rawListingsIndexOpenSea"]:i}]
            } else {
                formattedListings[id].push({["value"]:listing.price.current.value,["currency"]:listing.price.current.currency, ["source"]:"OpenSea",["rawListingsIndexOpenSea"]:i})
            }
        }
        return this.sortFormattedLisings(formattedListings)
    }

    async syncListings(contractAddr=this.nftAddr) {
        this.rawListingsOpenSea = await this.getAllListingsOpenSeaByContract(contractAddr)
        this.formattedListings = await this.formatListingsFromOpenSea(this.rawListingsOpenSea)
        console.log(this.formattedListings)
        return this.formattedListings
    }



}
=======

}

>>>>>>> 0bc37d9fa994a5eb6a5d61f27eaa985d86314249
// Close the dropdown if the user clicks outside of it
window.onclick = function (event) { //TODO  dropbtn class unique for each dropdown to make sure other dropdowns close when new one apears
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