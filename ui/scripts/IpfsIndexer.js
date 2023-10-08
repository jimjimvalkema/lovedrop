export class IpfsIndexer{
    dropsRootHash = null;
    index = null;
    isGateway = null;
    metaData = null;
    MiladyDropClaimDataHash;
    allProofsIndex;

    constructor(url, auth=null, isGateway=true) {
        this.auth = auth;
        this.ApiUrl = url;
        this.isGateway=isGateway;
        this.indexes=[];
        let urlobj = new URL(url);
        let options = {
            host: urlobj.hostname,
            port: urlobj.port,
            protocol: urlobj.protocol,
            headers: {
                authorization: auth,
            }
        }
        if (this.auth==null) {
            delete options.headers;
        }
        //this.ipfsClient = IpfsHttpClient.create(options);
    }

    getValues(obj, keys) {
        let result = {}
        for (let i = 0; i < keys.length; i++) {
            result[keys[i]] = obj[keys[i]]
        }
        return result
    };
    
    message(message) {
        console.log(message);
        document.getElementById("message2").innerHTML = message;
    }

    async addToIpfs(data, filename, pin=true, cidVersion=1) {
        const form = new FormData();
        form.append('file', new File([data], `/${filename}`));
        let reqObj = {
            method: 'POST',
            headers: {
                'Authorization': this.auth
            },
            body: form
        }
        if (this.auth==null) {
            delete reqObj.headers
        }
        let r = await fetch(`${this.ApiUrl}/api/v0/add?pin=${pin}&cid-version=${cidVersion}`, reqObj);
        return r.json();
    }

    splitObject(obj, amountItems=750) {
        let result = {};//TODO make start stop the last key not a int
        let keys = Object.keys(obj);
        let start = 0;
        let stop = amountItems;
        let amountOfSplits = Math.ceil(keys.length/amountItems);
        for (let i = 0; i < (amountOfSplits); i++) {
            if(!keys[start]){console.log("whoops"); continue}//
        
            this.message(`Splitting up claims ${i}/${amountOfSplits}`);
            let stopKey;
            if (keys[stop]) {
                stopKey = keys[stop]

            } else {
                stopKey = keys[keys.length-1]
            }
            let name = `${keys[start]}-${stopKey}`;
            result[name] = this.getValues(obj, keys.slice(start,stop));
            start=stop;
            stop+=amountItems 

        }
        this.message("");
        return result
    };

    async addObjectsToIpfs(objects, jsonPrettyLevel=2) {

        let cids = []; //name:hash
        const keys = Object.keys(objects)
        for(let i=0; i<keys.length; i ++) {
            this.message(`adding objects to ipfs ${i}/${keys.length}`);
            let filename = `${keys[i]}.json`
            // cids[filename] = await this.ipfsClient.add(
            //     JSON.stringify(objects[keys[i]], null, jsonPrettyLevel)
            //     , {"cidVersion":1})
            cids[filename] = await this.addToIpfs(
                JSON.stringify(objects[keys[i]], null, jsonPrettyLevel),
                filename,1
                )
        }
        this.message("");
        return cids
    }

    dagFromCids(cids) {
        // dag format tempelate
        let dag = {"Data": {"/":{"bytes": "CAE"}},"Links":[]}
        const keys = Object.keys(cids);
        for(let i=0; i<keys.length; i++) {
            let name = keys[i];
            let hash = cids[name]["Hash"];
            dag.Links.push(
                {
                    "Hash": {
                        "/": hash
                    },
                    "Name": name
                }
            )
        }
        return dag
    }

    async putDag(dag) {
        // its easier to do this with fetch because ipfshttpclient is broken on the dag-cbor codec or something
        const form = new FormData();
        form.append('content', JSON.stringify(dag));
        let reqObj = {
            method: 'POST',
            headers: {
                'Authorization': this.auth
            },
            body: form
        }
        if (this.auth==null) {
            delete reqObj.headers
        }

        //still returns a &cid-version=1 hash because kubo ipfs sucks
        let r = await fetch(`${this.ApiUrl}/api/v0/dag/put?store-codec=dag-pb&cid-version=1`, reqObj);
        let rjson = await r.json()
        return rjson['Cid']['/']
    }

    async getDag(hash) {
        let reqObj = {
            method: 'POST',
            headers: {
                'Authorization': this.auth
            }
        }
        if (this.auth==null) {
            delete reqObj.headers
        }

        //yes i have given up on ipfshttpclient at this point lmao
        let r = await fetch(`${this.ApiUrl}/api/v0/dag/get?arg=${hash}`, reqObj);
        let rjson = await r.json();
    
        //shit breaks when tsize=null :(
        if ("Links" in rjson) {
            for (let i=0; i<rjson.Links.length; i++) {
                if (rjson.Links[i].Tsize == null) {
                    delete rjson.Links[i].Tsize
                }

            }
            return rjson

        }
    }

    indexFromCids(cids) {
        let index = [];
        const keys = Object.keys(cids);
        for(let i=0; i<keys.length; i++) {
            let key = keys[i];
            let startStop = key.split(".")[0].split("-");
            index.push({"start":startStop[0], "stop":startStop[1], "hash":cids[key]["Hash"]})
        } 
        return index;
    }

    async addObjectToDag(dag, obj, fileNameObj) {
        //let r = await ipfsIndex.ipfsClient.add(JSON.stringify(obj, null, 2), {"cidVersion":1})
        let r = await this.addToIpfs(JSON.stringify(obj, null, 2), fileNameObj,1)
        let hash = r['Hash']
        dag.Links.push(
            {
                "Hash": {
                    "/": hash
                },
                "Name": fileNameObj
            }
        )
        return dag
    }

    async addHashToDag(hash,name,dag) {
        dag.Links.push({"Hash":{"/":hash},"Name":name})
        return dag

    }

    async wrapInDirectory(hash, dirName) {
        let dirDag = {"Data": {"/":{"bytes": "CAE"}},"Links":[{"Hash":{"/":hash},"Name":dirName}]}
        return await this.putDag(dirDag)

    }

    async getWithCatIpfs(hash) {
        let reqObj = {
            method: 'POST',
            headers: {
                'Authorization': this.auth
            }
        }
        if (this.auth==null) {
            delete reqObj.headers
        }
        let r = await fetch(`${this.ApiUrl}/api/v0/cat?arg=${hash}&archive=true`, reqObj);
        return r.json();
    }

    async getHashFromIpfsPath(path) {
        let pathL = path.split("/");
        let hash = pathL[0];
        if (pathL.length<2){return hash}
        let currentDag = await this.getDag(hash);
        for (let i=1; i<pathL.length; i++) {
            for (let j=0; j<currentDag['Links'].length; j++) {
                if (currentDag['Links'][j]["Name"] == pathL[i]) {
                    if (i == pathL.length-1) {
                        return await currentDag['Links'][j]["Hash"]["/"];

                    } else {
                        currentDag = await this.getDag(currentDag['Links'][j]["Hash"]["/"]);
                        break;
                    };
                };
            };
        };
    }

    async getWithGateWayIpfs(path) {
        console.log(`${this.ApiUrl}/ipfs/${path}`);
        let r = await fetch(`${this.ApiUrl}/ipfs/${path}`);
        return r.json()
    }

    async getIndexJson(rootHash) {
        indexHash = await this.getDag(rootHash)
        return await this.getWithCatIpfs(indexHash);
    }

    async loadIndex(dropsRootHash) {
        this.dropsRootHash = dropsRootHash;
        if (this.isGateway==true) {
            this.index = await this.getWithGateWayIpfs(dropsRootHash+"/index.json");
        } else {
            this.index = await this.getWithCatIpfs(await this.getHashFromIpfsPath(dropsRootHash+"/index.json"));
        }
    }

    async getIdFromIndex(id, index=this.index) {
        console.log(`getting id: ${id}`)
        let obj = {};
        for (let i=0; i<index.length; i++) {
            if (parseInt(index[i].start) <= id &&  parseInt(index[i].stop) >= id ) {
                console.log(`fetching id: ${id} from index at ${index[i].hash}`)
                obj = await this.getIpfs(index[i].hash)
                return obj[id.toString()];
            }
        }
        //if nothing is found (TODO throw error instead and error handeling at isClaimed, claimAll etc)
        return null;
    }

    async createMiladyDropClaimData(treeDump, allProofs,balancesAsCsv,splitSize=500, uiHash="Qmd9khr3UjLjvYNZoLZnd7W2yeDXDQhp1pdh5hb6KGrBro") {//uiHash:oct7
        const treeDumpHash = (await this.addToIpfs(JSON.stringify(treeDump), "treeDump.json"))["Hash"]
        const rootDirHash = await this.wrapInDirectory(treeDumpHash, "treeDump.json")
        let rootDirDag = await this.getDag(rootDirHash);
        rootDirDag = await this.addHashToDag(uiHash,"ui", rootDirDag)
        let allProofsDag = {"Data": {"/":{"bytes": "CAE"}},"Links":[]}
        //console.log(allProofs.proofPerAddress)
        let indexHasPerNftAddr = {}
        for (const nftAddr in allProofs.proofPerAddress) {
            const split = this.splitObject(allProofs.proofPerAddress[nftAddr].ids,splitSize)
            const cids = await this.addObjectsToIpfs(split);
            let dag = this.dagFromCids(cids);
            let hash = await this.putDag(dag)
            hash = await this.wrapInDirectory(hash, "data");
            dag = await this.getDag(hash);

            //create index
            const index = this.indexFromCids(cids);
            this.indexes.push(index)

            //add to ipfs
            dag = await this.addObjectToDag(dag, index, "index.json");
            const newHashWithIndex = await this.putDag(dag)
            indexHasPerNftAddr[nftAddr] = newHashWithIndex;
            this.addHashToDag(newHashWithIndex,`${nftAddr}`,allProofsDag)
        }
        
        allProofsDag = await this.addObjectToDag(allProofsDag,indexHasPerNftAddr,"index.json")
        
        rootDirDag = await this.addHashToDag(await this.putDag(allProofsDag),"allProofs", rootDirDag)
        rootDirDag = await this.addHashToDag((await this.addToIpfs(balancesAsCsv))["Hash"],"balances.csv", rootDirDag)
        this.MiladyDropClaimDataHash = await this.putDag(rootDirDag)
        return this.MiladyDropClaimDataHash

        //root
            //ui folder
                //ui shit
            
            //treedump.json                     <= {the entire tree}
            //balances.csv                      <= [[nftAddr,id,amout],etc] (as csv ofc)
            //metaData.json                     <= {nftAddrs:[], eligibleIds:{"0x1":[],"0x2":[]} }

            //allProofs
                //index.json           <= {"0x1":"HashOf-0x1-index.json"}
                //0x1
                    //index.json
                    //data
                        //0-100.json 
                        //100-200.json
                //0x2
                    //index.json            <= [{"start":0, "stop":100, "hash":"hashOf_0-100-0x2.json"}, etc]
                    //data
                        //0-100.json
                        //100-200.json      <= {"100":{"proof":["bytes32",etc]}, etc }


    }   

    async getIpfs(hashPath){
        let jsonObj
        if (this.isGateway==true) {
            jsonObj= await this.getWithGateWayIpfs(hashPath);
        } else {
            jsonObj = await this.getWithCatIpfs((await this.getHashFromIpfsPath(hashPath)));
        }
        return jsonObj
    }

    async loadIndexMiladyDropClaimData(dropsRootHash) {
        this.MiladyDropClaimDataHash = dropsRootHash;
        this.allProofsIndex = await this.getIpfs(dropsRootHash+"/allProofs/index.json");
    }

    getAllNftAddrs() {
        return Object.keys(this.allProofsIndex)
    }

    async getProof(nftAddr, id) {
        const proofsIndex = await this.getIpfs(this.allProofsIndex[nftAddr]+"/index.json")
        return await this.getIdFromIndex(id, proofsIndex)
    }
}