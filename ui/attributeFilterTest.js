        filter =
        {
            "inputType": "AND",
            "returns": "idList",
            "inputs": [
                {
                    "inputType": "attribute",
                    "returns": "attribute",
                    "inputs": [{ "trait_type": "Background", "value": "bjork" }]
                },
                {
                    "inputType": "attribute",
                    "returns": "attribute",
                    "inputs": [{ "trait_type": "Race", "value": "pale" }]
                }
            ]
        }

        filter =
        {
            "inputType": "OR",
            "returns": "idList",
            "inputs": [
                {
                    "inputType": "attribute",
                    "returns": "attribute",
                    "inputs": [{ "trait_type": "Background", "value": "bjork" }]
                },
                {
                    "inputType": "attribute",
                    "returns": "attribute",
                    "inputs": [{ "trait_type": "Race", "value": "pale" }]
                }
            ]
        }

        filter =
        {
            "inputType": "NOT",// input 0 included 1 excluded 0, not 1
            "returns": "idList",
            "inputs": [
                {
                    "inputType": "attribute",
                    "returns": "attribute",
                    "inputs": [{ "trait_type": "Background", "value": "bjork" }]
                },
                {
                    "inputType": "attribute",
                    "returns": "attribute",
                    "inputs": [{ "trait_type": "Race", "value": "pale" }]
                }
            ]
        }


        filter =
        {
            "inputType": "OR", 
            "returns": "idList",
            "inputs": [
                {
                    "inputType": "attribute",
                    "returns": "attribute",
                    "inputs": [{ "trait_type": "Background", "value": "bjork" }]
                },
                {
                    "inputType": "idList",
                    "returns": "idList",
                    "inputs": [1, 2, 3, 4, 5]
                }
            ]
        }


        filter =
        {
            "inputType": "OR",
            "returns": "idList",
            "inputs": [
                {
                    "inputType": "attribute",
                    "returns": "attribute",
                    "inputs": [{ "trait_type": "Background", "value": "bjork" }]
                }, 
                {
                    "inputType": "AND",
                    "returns": "idList",
                    "inputs": [
                        {
                            "inputType": "attribute",
                            "returns": "attribute",
                            "inputs": [{ "trait_type": "Race", "value": "pale" }]
                        },
                        {
                            "inputType": "attribute",
                            "returns": "attribute",
                            "inputs": [{ "trait_type": "Hat", "value": "white cowboy hat" }]
                        },
                    ]
                }
            ]
        }


and= {"type":"AND", "input":{
    "idList":[1,2,3,4,6,7],
    "attributes":[{ "trait_type": "Hat", "value": "white cowboy hat" },{ "trait_type": "Race", "value": "pale" },{ "trait_type": "Background", "value": "bjork" }],
    "conditions":null
}}

or= {"type":"OR", "input":{
    "idList":[1,2,3,4,6,7],
    "attributes":[{ "trait_type": "Hat", "value": "white cowboy hat" },{ "trait_type": "Race", "value": "pale" },{ "trait_type": "Background", "value": "bjork" }],
    "conditions":[and,and2]
}}

not = {"type":"NOT", "input":{
    "idList":[1,2,3,4,6,7],
    "attributes":[{ "trait_type": "Hat", "value": "cake hat" },{ "trait_type": "Race", "value": "clay" }],
    "conditions":null
}}

const attr1 = {"trait_type":"Hat","value":"cake hat"}
const attr2 = {"trait_type":"Race","value":"black"}
const attr3 = {"trait_type":"Background","value":"bushland"}
const attr4 = {"trait_type":"Shirt","value":"maf creeper"}
//const attr5 = {"trait_type":"Hat","value":"cake hat"}
const attr6 = {"trait_type":"Hair","value":"tuft brown"}


//[9,8,7,6,5,6,7,8,9,10,11,12] that have [attr1] but exclude those that have attr2
let f1 ={"type":"AND", "input":{"idList":[9,8,7,6,5,6,7,8,9,10,11,12,6999,5825,9796,6143],"conditions":undefined, "attributes":[attr1]},"NOT":{"idList":undefined,"conditions":undefined,"attributes":[attr2]}}

//includes [90,80,70,60,50], [attr3,attr4] but not [1,2,3,4]
let f2 = {"type":"OR", "input":{"idList":[90,80,70,60,50],"conditions":undefined, "attributes":[attr3,attr4]},"NOT":{"idList":[2748,2986 ],"conditions":undefined,"attributes":undefined}}

//0 till 5000 except attr4
let f3 = {"type":"RANGE", "input":{"start":0,"stop":5000},"NOT":{"idList":undefined,"conditions":undefined,"attributes":[attr1]}}
// everything except f3
let f4 = {"type":"RANGE", "input":{"start":0,"stop":null},"NOT":{"idList":undefined,"conditions":[f3],"attributes":undefined}}

//includes results from [f1,f2] and those with [attr6] but excludes [f4]
//every att6(tuft brown), f1 (9-12,6999,5825,9796,6143 that has cake hat and isnt black), f2 90,80,70,60,50 = all bushland + all maf creeper but not 2748,2986
// but not f4 (5001-10000 but cakehat is allowed)

let f5 = {"type":"OR", "input":{"idList":undefined,"conditions":[f1,f2], "attributes":[attr6]}, "NOT":{"idList":undefined,"conditions":[f4],"attributes":undefined}}