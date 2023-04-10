class ipfsIndexer{
    dropsRootHash = null;
    index = null;
    isGateway = null;
    metaData = null;

    constructor(url, auth=null, isGateway=true) {
        this.auth = auth;
        this.ApiUrl = url;
        this.isGateway=isGateway
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
        document.getElementById("message").innerHTML = message;
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

    splitObject(obj, amountItems) {
        let result = [];
        let keys = Object.keys(obj);
        let start = 0;
        let stop = amountItems;
        let amountOfSplits = keys.length/amountItems;
        for (let i = 1; i < (amountOfSplits+2); i++) {
            this.message(`Splitting up claims ${i}/${amountOfSplits}`);
            let name = `${start+1}-${stop}`;
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
        for (let i=0; i<rjson.Links.length; i++) {
            if (rjson.Links[i].Tsize == null) {
                delete rjson.Links[i].Tsize
            }

        }
        return rjson
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

    async createIpfsIndex(balanceMapJson, splitSize=780, metaData=null) {
        // TODO make more generic and not assume it has ["claims"]
        // TODO ipfs root hash that contains all files needed to claim (ui, balance tree, contracts addres, chainid, etc)
        // build it

        //split object
        this.message(`splitting: ${balanceMapJson["claims"].length} proofs into chunks of size: ${splitSize}`);
        const split = this.splitObject(balanceMapJson["claims"], splitSize); //780);
        console.log("done")

        //add to ipfs
        const cids = await this.addObjectsToIpfs(split);
        let dag = this.dagFromCids(cids);
        let hash = await this.putDag(dag)
        hash = await this.wrapInDirectory(hash, "data");
        dag = await this.getDag(hash);

        //create index
        const index = this.indexFromCids(cids);
        this.index = index

        //add to ipfs
        dag = await this.addObjectToDag(dag, index, "index.json");
        dag = await this.addObjectToDag(dag, metaData, "metadata.json");
        const newHashWithIndex = await this.putDag(dag)

        this.dropsRootHash = newHashWithIndex;
        this.message(`claims index ipfs hash: ${newHashWithIndex}`)
        return this.dropsRootHash
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

    async getIdFromIndex(id) {
        console.log(`getting id: ${id}`)
        let obj = {};
        for (let i=0; i<this.index.length; i++) {
            if (parseInt(this.index[i].start) <= id &&  parseInt(this.index[i].stop) >= id ) {
                console.log(`fetching id: ${id} from index at ${this.index[i].hash}`)
                if (this.isGateway==true) {
                    obj = await this.getWithGateWayIpfs(this.index[i].hash);
                } else {
                    obj = await this.getWithCatIpfs(this.index[i].hash);
                } 
                return obj[id.toString()];
            }
        }
        //if nothing is found (TODO throw error instead and error handeling at isClaimed, claimAll etc)
        return null;
    }




}