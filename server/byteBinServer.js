const Express = require('express')
const Uuid = require("./uuid.js")
const Cache = require("./cache.js");

module.exports = class ByteBinServer {
    constructor() {
        this.app = Express();
        this.cache = new Cache();
        this.setupRouting();
    }

    setupRouting() {
        this.app.use(Express.raw());
        this.app.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            next();
        });

          
        this.app.post("/post", (req,res)=>{
            var body = req.body;

            if (body.length > 1e8) {
                res.status(413).json({"error": "Data cannot be over 100 MB"});
                return;
            }

            var contentType = req.get('Content-Type');

            var key = Uuid();
            this.cache.set(key,{
                contentType: contentType,
                data: body
            });

            res.status(200).json({"key": key});
        });

        this.app.get("/:key",(req,res)=>{
            if (!req.params.key) {
                res.status(400).json({"error": "Must specify key"});
                return;
            }
            var key = req.params.key;

            var data = this.cache.get(key);
            if (data == null) {
                res.status(404).json({"error": "Not found"});
                return;
            }

            if (data.contentType) {
                res.set("Content-Type",data.contentType);
            }

            res.status(200).send(data.data);
        });
    }

    start(port) {
        this.app.listen(port,()=>{
            console.log(`Listening on port ${port}`);
        });
        this.pruneInterval = setInterval(()=>{
            this.pruneCache();
        },5000)
    }

    close() {
        this.app.close();
        clearInterval(this.pruneInterval);
    }

    pruneCache() {
        this.cache.pruneExpired();
    }


}