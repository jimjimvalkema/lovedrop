import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { ethers } from "../ui/scripts/ethers-5.2.umd.min.js";
import * as CBOR from "borc";
import fs from "fs";



// (1)
const values = [
    ["0","1", "1000000000000000000"],
    ["0","2", "2000000000000000000"],
    ["0","3", "4000000000000000000"],
    ["1","3", "5000000000000000000"],
    ["1","4", "6000000000000000000"],
    ["0","12169697774812703230153278869778437256039855339638969837407632192044393630491", "1000000000000000000000000000"], //nftAddressIndex, idFromEns, 1billion tokens
    ["1","12169697774812703230153278869778437256039855339638969837407632192044393630491","10000000000000000000000000000000000000000000000000000000000000000000000000000"]

];

const dataTypes = ["uint256", "uint256", "uint256"]

const extraEntries = 2
let extraLargeValues = [...Array(extraEntries).keys()].map(i => ["4","69", ((
    ethers.BigNumber.from(i + 1).mul(ethers.BigNumber.from("1000000000000000000")).toString()
)).toString()])
// (2)
console.log("---building tree---")
console.log([...values, ...extraLargeValues])
const tree = StandardMerkleTree.of([...values, ...extraLargeValues], dataTypes);

// (3)

console.log('Merkle Root:', tree.root);

// (4)
const workingDir = import.meta.url.split("/").slice(null, -1).join("/").slice(7)
console.log(workingDir)

/*
entries = 200
49.6kb,53,6kb

extraEntries = 1000

*/
Bun.write(`${workingDir}/output/outputs-MerkleTreeTest/PlainMerkleTreeTest${extraEntries}.json`, JSON.stringify(tree, null, 2))
Bun.write(`${workingDir}/output/outputs-MerkleTreeTest/merkleTreeTest${extraEntries}.CBOR`, CBOR.encode(tree))
//Bun.write(`${workingDir}/output/outputs-MerkleTreeTest/merkleTreeTest${extraEntries}.json`,JSON.stringify(tree.dump(), null, 2))
fs.writeFileSync(`${workingDir}/output/outputs-MerkleTreeTest/merkleTreeTest${extraEntries}.json`, JSON.stringify(tree.dump()));

//TODO make it search nftIndex + id
function getTreeIndexesOfAdress(idsPerNftIndex, tree) {
    let indexes = []
    for (const nftIndex in idsPerNftIndex) {
        const ids = idsPerNftIndex[nftIndex]
        for (const id of ids) {
            for (const i in tree.values) {
                if (tree.values[i].value[0] === nftIndex && tree.values[i].value[1] === id) {
                    indexes.push(parseInt(i))
                }
            }
        }
    }
    return indexes
}

console.log("---testing multiproof---")
const treeIndexes = getTreeIndexesOfAdress({"0":["2","3"], "1":["3","4"]}, tree)
console.log(treeIndexes)
const { proof, proofFlags, leaves } = tree.getMultiProof(treeIndexes)
console.log("leaves:")
console.log(leaves)
console.log("proofFlags:")
console.log(proofFlags)
console.log("proof:")
console.log(proof)

const isValid = tree.verifyMultiProof({ "proof": proof, "proofFlags": proofFlags, "leaves": leaves });
console.log(`proof is valid: ${isValid}`)






console.log("---reading tree---")
//const tree2Json = await Bun.file(`${workingDir}/output/outputs-MerkleTreeTest/merkleTreeTest${extraEntries}.json`).json()
const tree2 = await StandardMerkleTree.load(await JSON.parse(await fs.readFileSync(`${workingDir}/output/outputs-MerkleTreeTest/merkleTreeTest${extraEntries}.json`, "utf8")));

//const tree2 = StandardMerkleTree.load(tree2Json)

function printMultiProof(ids) {
    const treeIndexes2 = getTreeIndexesOfAdress(ids, tree2)
    console.log(`tree indexes: ${treeIndexes2}`)
    const proof2Data = tree2.getMultiProof(treeIndexes2)
    const proof2 = proof2Data.proof
    const proofFlags2 = proof2Data.proofFlags
    const leaves2 = proof2Data.leaves

    console.log("---testing multiproof of tree read from disk---")
    //console.log(tree2.getMultiProof(treeIndexes2))
    //const { proof2, proofFlags2, leaves2 } = StandardMerkleTree.getMultiProof(tree2, treeIndexes2)
    console.log("test copypasta")
    console.log(
        `
        amounts = ${`[${leaves2.map((x) => x[2]).join(", ")}]`};
        ids = ${`[${leaves2.map((x) => x[1]).join(", ")}]`};
        nftIndexes = ${`[${leaves2.map((x) => x[0]).join(", ")}]`};
        proof = ${`[\n${proof2.map((x) => `\t\tbytes32(${x})`).join(", \n")}\n`}
        ];
        proofFlags = ${`[${proofFlags2.join(", ")}]`};
        `
    )

    const isValid2 = tree2.verifyMultiProof({ "proof": proof2, "proofFlags": proofFlags2, "leaves": leaves2 });
    //const isValid2 = StandardMerkleTree.verifyMultiProof({"root": , "leafEncoding":,"MultiProof": })
    console.log(`proof is valid: ${isValid2}`)
}
console.log(`----------multi proof 1----------`)
printMultiProof({"0":["2","3"], "1":["3","4"]})
console.log(`----------multi proof 2----------`)
printMultiProof({"0":["2"]})

console.log(`----------single proof 1----------`)
let leaf;
let proof3
for (const [i, v] of tree2.entries()) {
    if (v[0] === "0" && v[1] === '2') {
        // (3)
        proof3 = tree2.getProof(i);
        leaf =v;
        console.log("test copypasta")
        console.log(`
        amount = ${v[2]};
        id = ${v[1]};
        nftIndex = ${v[0]};

        proof = ${`[\n${proof3.map((x) => `\t\tbytes32(${x})`).join(", \n")}\n`}
        ];
        `)
    }
}

const isValid3 = tree2.verify(leaf,proof3)
console.log(`proof is valid: ${isValid3}`)

console.log(`----------multi proof 3----------`)
printMultiProof({
    "0":["1","2","12169697774812703230153278869778437256039855339638969837407632192044393630491"],
    "1":["12169697774812703230153278869778437256039855339638969837407632192044393630491"]
})
