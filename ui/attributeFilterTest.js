        filter =
        {
            "inputsType": "AND",
            "returns": "idList",
            "inputss": [
                {
                    "inputsType": "attribute",
                    "returns": "attribute",
                    "inputss": [{ "trait_type": "Background", "value": "bjork" }]
                },
                {
                    "inputsType": "attribute",
                    "returns": "attribute",
                    "inputss": [{ "trait_type": "Race", "value": "pale" }]
                }
            ]
        }

        filter =
        {
            "inputsType": "OR",
            "returns": "idList",
            "inputss": [
                {
                    "inputsType": "attribute",
                    "returns": "attribute",
                    "inputss": [{ "trait_type": "Background", "value": "bjork" }]
                },
                {
                    "inputsType": "attribute",
                    "returns": "attribute",
                    "inputss": [{ "trait_type": "Race", "value": "pale" }]
                }
            ]
        }

        filter =
        {
            "inputsType": "NOT",// inputs 0 included 1 excluded 0, not 1
            "returns": "idList",
            "inputss": [
                {
                    "inputsType": "attribute",
                    "returns": "attribute",
                    "inputss": [{ "trait_type": "Background", "value": "bjork" }]
                },
                {
                    "inputsType": "attribute",
                    "returns": "attribute",
                    "inputss": [{ "trait_type": "Race", "value": "pale" }]
                }
            ]
        }


        filter =
        {
            "inputsType": "OR", 
            "returns": "idList",
            "inputss": [
                {
                    "inputsType": "attribute",
                    "returns": "attribute",
                    "inputss": [{ "trait_type": "Background", "value": "bjork" }]
                },
                {
                    "inputsType": "idList",
                    "returns": "idList",
                    "inputss": [1, 2, 3, 4, 5]
                }
            ]
        }


        filter =
        {
            "inputsType": "OR",
            "returns": "idList",
            "inputss": [
                {
                    "inputsType": "attribute",
                    "returns": "attribute",
                    "inputss": [{ "trait_type": "Background", "value": "bjork" }]
                }, 
                {
                    "inputsType": "AND",
                    "returns": "idList",
                    "inputss": [
                        {
                            "inputsType": "attribute",
                            "returns": "attribute",
                            "inputss": [{ "trait_type": "Race", "value": "pale" }]
                        },
                        {
                            "inputsType": "attribute",
                            "returns": "attribute",
                            "inputss": [{ "trait_type": "Hat", "value": "white cowboy hat" }]
                        },
                    ]
                }
            ]
        }


and= {"type":"AND", "inputs":{
    "idList":[1,2,3,4,6,7],
    "attributes":[{ "trait_type": "Hat", "value": "white cowboy hat" },{ "trait_type": "Race", "value": "pale" },{ "trait_type": "Background", "value": "bjork" }],
    "conditions":null
}}

or= {"type":"OR", "inputs":{
    "idList":[1,2,3,4,6,7],
    "attributes":[{ "trait_type": "Hat", "value": "white cowboy hat" },{ "trait_type": "Race", "value": "pale" },{ "trait_type": "Background", "value": "bjork" }],
    "conditions":[and,and2]
}}

not = {"type":"NOT", "inputs":{
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
let f1 ={"type":"AND", "inputs":{"idList":[9,8,7,6,5,6,7,8,9,10,11,12,6999,5825,9796,6143],"conditions":undefined, "attributes":[attr1]},"NOT":{"idList":undefined,"conditions":undefined,"attributes":[attr2]}}

//includes [90,80,70,60,50], [attr3,attr4] but not [1,2,3,4]
let f2 = {"type":"OR", "inputs":{"idList":[90,80,70,60,50],"conditions":undefined, "attributes":[attr3,attr4]},"NOT":{"idList":[2748,2986 ],"conditions":undefined,"attributes":undefined}}

//0 till 5000 except attr4
let f3 = {"type":"RANGE", "inputs":{"start":0,"stop":5000},"NOT":{"idList":undefined,"conditions":undefined,"attributes":[attr4]}}
// everything except f3
let f4 = {"type":"RANGE", "inputs":{"start":0,"stop":null},"NOT":{"idList":undefined,"conditions":[f3],"attributes":undefined}}

//includes results from [f1,f2] and those with [attr6] but excludes [f4]
//every att6(tuft brown), f1 (9-12,6999,5825,9796,6143 that has cake hat and isnt black), f2 90,80,70,60,50 = all bushland + all maf creeper but not 2748,2986
// but not f4 (5001-10000 but cakehat is allowed)

let f5 = {"type":"OR", "inputs":{"idList":undefined,"conditions":[f1,f2], "attributes":[attr6]}, "NOT":{"idList":undefined,"conditions":[f4],"attributes":undefined}}

let f6 = {"type":"OR","inputs":{"idList":[],"conditions":[{"type":"AND","inputs":{"idList":[],"conditions":[],"attributes":[{"trait_type":"Hat","value":"alien hat"},{"trait_type":"Eyes","value":"teary"}]},"NOT":{"idList":[],"conditions":[],"attributes":[]}}],"attributes":[{"trait_type":"Hat","value":"cake hat"},{"trait_type":"Hat","value":"migoko hat"}]},"NOT":{"idList":[],"conditions":[],"attributes":[]}}

let f7 = {"type":"AND","inputs":{"conditions":[f1,f2,f3,f4,f5,f6]}}