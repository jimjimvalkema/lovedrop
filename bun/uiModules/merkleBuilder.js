import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { ethers } from "ethers"

export class merkleBuilder {
    balances = [];
    dataTypes = ["address", "uint256", "uint256"];
    tree;
    merkleRoot;
    allProofs;
    ipfsForExports;

    constructor(balances = [], dataTypes=this.dataTypes, ipfsForExports=false) {
        this.balances = balances.map((x) => [
            ethers.utils.getAddress(x[0]),
            x[1],
            x[2]
        ])
        this.dataTypes = dataTypes
        this.#buildTree()
        this.merkleRoot = this.tree.root
        this.ipfsForExports = ipfsForExports;
    }

    #buildTree(balances=this.balances, dataTypes=this.dataTypes) {
        console.log("building Tree")
        this.tree = StandardMerkleTree.of(balances, dataTypes);
        console.log("done building Tree")
        return this.tree
    }

    getTreeIndex(nftAddress="", id="") {
        //console.log(`getting values: ${JSON.stringify(idsPerNftIndex)}`)
        return this.tree.values.findIndex((x)=> x.value[0]===nftAddress && x.value[1]===id)
    }

    getTreeIndexes(idsPerNftAddr={}) {
        //{"0x0":[1,2],"0x1":[3,4]} => [[ "0x0", 1 ], [ "0x0", 2 ], [ "0x1", 3 ], [ "0x1", 4 ]]
        const idsPerNftAddrAsArr = Object.keys(idsPerNftAddr).map((x)=>idsPerNftAddr[x].map((y)=>[x,y])).flat()
        let indexes = []
        for (const i in this.tree.values) {
            //const treeIndex = this.tree.values[i].treeIndex
            const value = this.tree.values[i].value;
            const vAddr = value[0];
            const vId = value[1];
            if (idsPerNftAddrAsArr.find((x)=> x[0]===vAddr && x[1]===vId)) {
                indexes.push(parseInt(i))
            }
        }
        return indexes
    }

    getMultiProof(idsPerNftAddr) {
        return this.tree.getMultiProof(this.getTreeIndexes(idsPerNftAddr))
    }

    getProof(nftAddr, id) {
        if (typeof(id) === "number") {
            throw Error("Id was set as a number. Javascript numbers are unsafe to be used for uint256 values")
        }
        const index = this.getTreeIndex(nftAddr,id);
        if (index !== -1) {
            return this.tree.getProof(index)
        } else {
            console.warn(`value not in merkle tree. Searched for nft address: ${nftAddr} and id ${id}`)
            return []
        }
    
    }

    getAllProofs() {
        let proofs = {}; 
        for (const item of this.balances) {
            const nftAddr = item[0];
            const id = item[1];
            const amount = item[2]
            if (nftAddr in proofs) {
                proofs[nftAddr].push({"id":id, "amount":amount, "proof":this.getProof(nftAddr,id)})
            } else {
                proofs[nftAddr] = [{"id":id, "amount":amount, "proof":this.getProof(nftAddr,id)}]
            }
        }
        this.allProofs = proofs
        return proofs
    }

    importBalancesCsv(url) {

    }

    exportMultiProofSolidity(filePath="") {
    }

    exportSingleProofSolidity(filePath="") {
    }

    exportBalancesCsv(fileDest) {
    }

    exportTree(fileDest) {
    }

    exportAsFile(obj,fileDest, prettyPrint=0) {
        const stringyFied = JSON.stringify(obj)
        if (ipfsForExports) {
            //TODO return ipfsHash
        } else {
            return fileDest
        }
    }


    


}

function main() {
    const balances = [
        ["0xF62849F9A0B5Bf2913b396098F7c7019b51A820a", "1", "1000000000000000000"],
        ["0xF62849F9A0B5Bf2913b396098F7c7019b51A820a", "2", "2000000000000000000"],
        ["0xF62849F9A0B5Bf2913b396098F7c7019b51A820a", "3", "4000000000000000000"],
        ["0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9", "3", "5000000000000000000"],
        ["0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9", "4", "6000000000000000000"],
        ["0xF62849F9A0B5Bf2913b396098F7c7019b51A820a", "12169697774812703230153278869778437256039855339638969837407632192044393630491", "1000000000000000000000000000"], //nftAddressIndex, idFromEns, 1billion tokens
        ["0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9", "12169697774812703230153278869778437256039855339638969837407632192044393630491", "10000000000000000000000000000000000000000000000000000000000000000000000000000"]

    ];
    let m = new merkleBuilder(balances);
    //[[ "0xF62849F9A0B5Bf2913b396098F7c7019b51A820a", "2" ], [ "0xF62849F9A0B5Bf2913b396098F7c7019b51A820a","3" ], [ "0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9", "3" ], [ "0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9","4" ]]
    const multiProof = m.getMultiProof({"0xF62849F9A0B5Bf2913b396098F7c7019b51A820a":["2","3"], "0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9":["3","4"]})
    console.log(multiProof);
    const singleProof = m.getProof("0xF62849F9A0B5Bf2913b396098F7c7019b51A820a","1")
    console.log("---single proof----")
    console.log(singleProof)

    console.log("---all proof----")
    console.log(m.getAllProofs())
}

main();
