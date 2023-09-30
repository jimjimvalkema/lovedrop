import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { ethers } from "../ui/scripts/ethers-5.2.umd.min.js";
import * as CBOR from "borc";
import fs from "fs";



// (1)
const values = [
  ["0x1111111111111111111111111111111111111111", "1000000000000000000"],
  ["0x3333333333333333333333333333333333333333", "2000000000000000000"],
  ["0x6666666666666666666666666666666666666666", "4000000000000000000"],
  ["0x6666666666666666666666666666666666666666", "5000000000000000000"],
  ["0x6666666666666666666666666666666666666666", "6000000000000000000"],
];
const extraEntries = 1
let extraLargeValues = [...Array(extraEntries).keys()].map(i => ["0x0000000000000000000000000000000000000000",((
    ethers.BigNumber.from(i+1).mul(ethers.BigNumber.from("1000000000000000000")).toString()
    )).toString()] )
// (2)
console.log("---building tree---")
const tree = StandardMerkleTree.of([...values, ...extraLargeValues], ["address", "uint256"]);

// (3)

console.log('Merkle Root:', tree.root);

// (4)
const workingDir = import.meta.url.split("/").slice(null,-1).join("/").slice(7)
console.log(workingDir)

/*
entries = 200
49.6kb,53,6kb

extraEntries = 1000

*/
Bun.write(`${workingDir}/output/outputs-MerkleTreeTest/PlainMerkleTreeTest${extraEntries}.json`,JSON.stringify(tree, null, 2))
Bun.write(`${workingDir}/output/outputs-MerkleTreeTest/merkleTreeTest${extraEntries}.CBOR`,CBOR.encode(tree))
//Bun.write(`${workingDir}/output/outputs-MerkleTreeTest/merkleTreeTest${extraEntries}.json`,JSON.stringify(tree.dump(), null, 2))
fs.writeFileSync(`${workingDir}/output/outputs-MerkleTreeTest/merkleTreeTest${extraEntries}.json`, JSON.stringify(tree.dump()));
function getTreeIndexesOfAdress(address, tree) {
    let indexes = []
    for (const i in tree.values) {
        if (tree.values[i].value[0] === address) {
            indexes.push(parseInt(i))

        }
    }
    return indexes
}

console.log("---testing multiproof---")
const treeIndexes = getTreeIndexesOfAdress("0x6666666666666666666666666666666666666666", tree)
console.log(treeIndexes)
const { proof, proofFlags, leaves } = tree.getMultiProof(treeIndexes)
console.log("leaves:")
console.log(leaves)
console.log("proofFlags:")
console.log(proofFlags)
console.log("proof:")
console.log(proof)

const isValid = tree.verifyMultiProof( { "proof":proof, "proofFlags":proofFlags, "leaves":leaves });
console.log(`proof is valid: ${isValid}`)






console.log("---reading tree---")
//const tree2Json = await Bun.file(`${workingDir}/output/outputs-MerkleTreeTest/merkleTreeTest${extraEntries}.json`).json()
const tree2 = await StandardMerkleTree.load(await JSON.parse(await fs.readFileSync(`${workingDir}/output/outputs-MerkleTreeTest/merkleTreeTest${extraEntries}.json`, "utf8")));

//const tree2 = StandardMerkleTree.load(tree2Json)


const treeIndexes2 = getTreeIndexesOfAdress("0x6666666666666666666666666666666666666666", tree2)
console.log(treeIndexes2)
const proof2Data = tree2.getMultiProof(treeIndexes2)
const proof2 = proof2Data.proof
const proofFlags2 = proof2Data.proofFlags
const leaves2 = proof2Data.leaves

console.log("---testing multiproof of tree read from disk---")
console.log(tree2.getMultiProof(treeIndexes2))
//const { proof2, proofFlags2, leaves2 } = StandardMerkleTree.getMultiProof(tree2, treeIndexes2)
console.log("leaves:")
console.log(leaves2)
console.log("proofFlags:")
console.log(proofFlags2)
console.log("proof:")
console.log(proof2)

const isValid2 = tree2.verifyMultiProof( { "proof":proof2, "proofFlags":proofFlags2, "leaves":leaves2 });
//const isValid2 = StandardMerkleTree.verifyMultiProof({"root": , "leafEncoding":,"MultiProof": })
console.log(`proof is valid: ${isValid2}`)

