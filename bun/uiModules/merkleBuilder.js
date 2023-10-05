import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { ethers } from "ethers"
import * as Papa from "papaparse"

export class merkleBuilder {
    balances = [];
    dataTypes = [];
    allProofs = {};
    allContractAddrs=new Set()
    merkleRoot = "";
    ipfsForExports = false;
    tree;
    provider;

    constructor(balances = [], provider, dataTypes = ["address", "uint256", "uint256"], ipfsForExports = false) {
        this.provider = provider
        this.ipfsForExports = ipfsForExports;
        this.dataTypes = dataTypes

        this.balances = balances
        this.allContractAddrs = new Set( [...this.balances.map((x)=>x[0])]);
        

        if (balances.length) {
            this.buildTree()
            this.merkleRoot = this.tree.root
        }

    }

    formatAddressInBalances(balances) {
        return balances.map((x) => [
            ethers.utils.getAddress(x[0]),
            x[1],
            x[2]
        ])
    }

    buildTree(balances = this.balances, dataTypes = this.dataTypes) {
        this.balances = this.formatAddressInBalances(balances)
        console.log("building Tree")
        this.tree = StandardMerkleTree.of(balances, dataTypes);
        console.log("done building Tree")
        return this.tree
    }

    getTreeIndex(nftAddress = "", id = "") {
        //console.log(`getting values: ${JSON.stringify(idsPerNftIndex)}`)
        return this.tree.values.findIndex((x) => x.value[0] === nftAddress && x.value[1] === id)
    }

    getTreeIndexes(idsPerNftAddr = {}) {
        //{"0x0":[1,2],"0x1":[3,4]} => [[ "0x0", 1 ], [ "0x0", 2 ], [ "0x1", 3 ], [ "0x1", 4 ]]
        const idsPerNftAddrAsArr = Object.keys(idsPerNftAddr).map((x) => idsPerNftAddr[x].map((y) => [x, y])).flat()
        let indexes = []
        for (const i in this.tree.values) {
            //const treeIndex = this.tree.values[i].treeIndex
            const value = this.tree.values[i].value;
            const vAddr = value[0];
            const vId = value[1];
            if (idsPerNftAddrAsArr.find((x) => x[0] === vAddr && x[1] === vId)) {
                indexes.push(parseInt(i))
            }
        }
        return indexes
    }

    getMultiProof(idsPerNftAddr) {
        return this.tree.getMultiProof(this.getTreeIndexes(idsPerNftAddr))
    }

    async getProof(nftAddr, id) {
        if (typeof (id) === "number") {
            throw Error("Id was set as a number. Javascript numbers are unsafe to be used for uint256 values")
        }
        const index = this.getTreeIndex(nftAddr, id);
        if (index !== -1) {
            return {
                ["nftAddress"]:nftAddr,
                ["id"]:id,
                ["amount"]:this.tree.values[index].value[2],
                ["treeIndex"]:this.tree.values[index].treeIndex,
                ["index"]:index,
                ["proof"]:this.tree.getProof(index)
            }
        } else {
            console.warn(`value not in merkle tree. Searched for nft address: ${nftAddr} and id ${id}`)
            return undefined
        }

    }

    async getAllProofs() {
        let proofs = {["nftAddresses"]:[...this.allContractAddrs], ["proofPerAddress"]:{}};
        const proofPromises =  this.balances.map((item)=> this.getProof(item[0], item[1]))
    

        for (const item of (await Promise.all(proofPromises))) {
            if (item.nftAddress in proofs["proofPerAddress"]) {
                proofs["proofPerAddress"][item.nftAddress]["ids"][item.id] = {["amount"]:item.amount, ["treeIndex"]:item.treeIndex, ["index"]:item.index, ["proof"]:item.proof}
                
            } else {
                proofs["proofPerAddress"][item.nftAddress] = {["ids"]:{}}
                proofs["proofPerAddress"][item.nftAddress]["ids"][item.id] = {["amount"]:item.amount, ["treeIndex"]:item.treeIndex, ["index"]:item.index, ["proof"]:item.proof}
            }
        }
        this.allProofs = await proofs
        return proofs
    }

    // getFileWithRelativePath(path, withProtocol)
    importBalancesCsv(csvString) {
        let csvArr = (Papa.parse(csvString)).data;
        this.balances = this.formatAddressInBalances(csvArr.map((line)=>line.slice(1,4)));
        this.allContractAddrs = new Set( [...this.balances.map((x)=>x[0])]);
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
        console.log(`imported ${this.balances.length} entries`)

    }

    async importBalancesCsvFromFile(url) {
        let file;
        let csvString;
        if (Bun) {
            url = `${import.meta.url}${url}`
            console.log(`reading file ${url} with Bun.file()`)
            file = Bun.file(new URL(url))
            csvString = await file.text()
        } else {
            console.warn("didnt import file todo implement")
        }

        //csv header:
        //nft name, nftAddr, id, amount
        this.importBalancesCsv(csvString)
    }

    exportMultiProofSolidity(filePath = "") {
    }

    exportSingleProofSolidity(filePath = "") {
    }


    async exportBalancesCsv(fileDest,prettyPrint=0) {
        const abi = [
            {
                "inputs": [],
                "name": "name",
                "outputs": [
                    {
                        "internalType": "string",
                        "name": "",
                        "type": "string"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ]
        let addrToNameMap = {}
        for (const addr of this.allContractAddrs) {
            console.log(addr)
            const constractObj =  new ethers.Contract(addr,abi,this.provider)
            addrToNameMap[addr] = await constractObj.name()
        }
        const balancesWithNftName = this.balances.map((x)=>[addrToNameMap[ethers.utils.getAddress(x[0])], ...x])
        this.exportObjAsFile(Papa.unparse(balancesWithNftName),fileDest,prettyPrint);
    }

    async exportTree(dest, prettyPrint=0) {
        await this.exportObjAsFile(this.tree.dump(),dest,prettyPrint)
    }

    async exportAllProofs(dest, prettyPrint=0) {
        if (!this.allProofs.length) {
            await this.getAllProofs()
        }
        await this.exportObjAsFile(this.allProofs, dest, prettyPrint)
    }

    async exportObjAsFile(obj, url, prettyPrint = 0) {
        if (typeof(obj) !== "string") {
            obj = JSON.stringify(obj,null,prettyPrint)
        }
        if (Bun) {
            url = `${import.meta.url}/../${url}`
            console.log(`writing file ${url} with Bun.write()`)
            Bun.write(new URL(url),obj)
        } else {
            console.warn("didnt export file todo implement")
        }
    }





}

async function  main() {
    let startTimeGlobal = Date.now();
    const rpcProviderUrl = Bun.argv[2]
    const outpurDir = Bun.argv[3]
    const csvInput = Bun.argv[4]
    const provider = await new ethers.providers.JsonRpcProvider(`${rpcProviderUrl}`);

    const balances = [
        ["0xF62849F9A0B5Bf2913b396098F7c7019b51A820a", "1", "1000000000000000000"],
        ["0xF62849F9A0B5Bf2913b396098F7c7019b51A820a", "2", "2000000000000000000"],
        ["0xF62849F9A0B5Bf2913b396098F7c7019b51A820a", "3", "4000000000000000000"],
        ["0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9", "3", "5000000000000000000"],
        ["0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9", "5", "6000000000000000000"],
        ["0xF62849F9A0B5Bf2913b396098F7c7019b51A820a", "12169697774812703230153278869778437256039855339638969837407632192044393630491", "1000000000000000000000000000"], //nftAddressIndex, idFromEns, 1billion tokens
        ["0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9", "12169697774812703230153278869778437256039855339638969837407632192044393630491", "10000000000000000000000000000000000000000000000000000000000000000000000000000"]

    ];
    let m = new merkleBuilder(balances,provider);
    [[ "0xF62849F9A0B5Bf2913b396098F7c7019b51A820a", "2" ], [ "0xF62849F9A0B5Bf2913b396098F7c7019b51A820a","3" ], [ "0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9", "3" ], [ "0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9","4" ]]
    const multiProof = m.getMultiProof({ "0xF62849F9A0B5Bf2913b396098F7c7019b51A820a": ["2", "3"], "0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9": ["3", "5"] })
    console.log(multiProof);
    const singleProof = m.getProof("0xF62849F9A0B5Bf2913b396098F7c7019b51A820a", "1")
    console.log("---single proof----")
    console.log(await singleProof)

    console.log("---all proof----")

    await m.getAllProofs()
    //console.log(JSON.stringify(m.allProofs ,null, 2))
    await m.exportAllProofs(`${outpurDir}/allProofs-test.json`,2)
    // //python
    // //text_file = open("Output.txt", "w")
    // //text_file.write(('\n'.join([",".join(["testNft1","0xF62849F9A0B5Bf2913b396098F7c7019b51A820a", str(i), str(i*2)+"0"*18]) for i in range(1,100000, 2)]) ))
    let m2 = new merkleBuilder([],provider);
    await m2.importBalancesCsvFromFile(csvInput)
    await m2.buildTree()
    console.log(m2.merkleRoot)

    let startTimeProofTime = Date.now();
    console.log("getting singleProof")
    console.log(await m2.getProof("0x3Fc3a022EB15352D3f5E4e6D6f02BBfC57D9C159", "3"))
    let timeTakenProof = Date.now() - startTimeProofTime;   
    console.log("getting 1 proof took: " + timeTakenProof + " milliseconds");

    await m2.exportTree(`${outpurDir}/tree-dump-big.json`,0)

    await m2.exportBalancesCsv(`${outpurDir}/balances-output-big.csv`)

    console.log("getting all proofs")
    await m2.exportAllProofs(`${outpurDir}/allProofs-test-big.json`,2)

    let timeTaken = Date.now() - startTimeGlobal;   
    console.log("script ran for: " + timeTaken + " milliseconds");
}

main();
