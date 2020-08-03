module.exports = class Cache {
    constructor() {
        this.data = new Map();
    }
    set(key,value) {
        return this.data.set(key,{
            expires: Math.floor(Date.now() / 1000) + 60*60, 
            value: value
        });
    }
    get(key) {
        return this.data.has(key) ? this.data.get(key).value : null;
    }
    delete(key) {
        return this.data.delete(key);
    }
    every(c) {
        var a = this.data.entries()
        var b;
        while (b = a.next().value) {
            if (!c(b[1], b[0])) return false;
        }
        return true;
    }
    pruneExpired() {
        var time = Math.floor(Date.now() / 1000);
        var yeeted = 0;
        this.every((item,key)=>{
            if (time >= item.expires) {
                this.data.delete(key);
                yeeted++;
                return true;
            }
            return false;
        });
        return yeeted;
    }
}