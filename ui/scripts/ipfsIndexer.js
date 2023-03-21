class ipfsIndexer{
    indexedObj = null;
    dropsRootHash = null;

    constructor(url, auth=null) {
        this.auth = auth;
        this.ApiUrl = url;
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

        this.ipfsClient = IpfsHttpClient.create(options);
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
        this.indexedObj = result;
        return result
    };

    async addObjectsToIpfs(objects, jsonPrettyLevel=2) {

        let cids = []; //name:hash
        const keys = Object.keys(objects)
        for(let i=0; i<keys.length; i ++) {
            this.message(`adding objects to ipfs ${i}/${keys.length}`);
            let fileName = `${keys[i]}.json`
            cids[fileName] = await this.ipfsClient.add(
                JSON.stringify(objects[keys[i]], null, jsonPrettyLevel)
                , {"cidVersion":1})
        }
        this.message("");
        return cids
    }

    dagFromCids(cids) {
        let dag = {"Data": {"/":{"bytes": "CAE"}},"Links":[]}
        const keys = Object.keys(cids);
        for(let i=0; i<keys.length; i++) {
            let name = keys[i];
            let hash = cids[name]["path"];
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
            index.push({"start":startStop[0], "stop":startStop[1], "hash":cids[key]["path"]})
        } 
        return index;
    }

    async addObjectToDag(dag, obj, fileNameObj) {
        let r = await ipfsIndex.ipfsClient.add(JSON.stringify(obj, null, 2), {"cidVersion":1})
        let hash = r['path']
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

    makeDropsRootHash() {
        // TODO ipfs root hash that contains all files needed to claim (ui, balance tree, indexed claims)
        // build it
        this.dropsRootHash = null
        return this.dropsRootHash
    }

    async wrapInDirectory(hash, dirName) {
        let dirDag = {"Data": {"/":{"bytes": "CAE"}},"Links":[{"Hash":{"/":hash},"Name":dirName}]}
        return await this.putDag(dirDag)

    }

    async getJsonIpfs(hash) {
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

    async getIpfsFromPath(path) {
        let pathL = path.split("/");
        let hash = pathL[0];
        let currentDag = await this.getDag(hash);
        for (let i=1; i<pathL.length; i++) {
            for (let j=0; j<currentDag['Links'].length; j++) {
                if (currentDag['Links'][j]["Name"] == pathL[i]) {
                    if (i == pathL.length-1) {
                        return await this.getJsonIpfs(currentDag['Links'][j]["Hash"]["/"]);

                    } else {
                        currentDag = await this.getDag(currentDag['Links'][j]["Hash"]["/"]);
                        break;
                    };
                };
            };
        };
    }

    async getIndexJson(rootHash) {
        window.indexHash = await this.getDag(rootHash)
        return await this.getJsonIpfs(indexHash);
    }




}