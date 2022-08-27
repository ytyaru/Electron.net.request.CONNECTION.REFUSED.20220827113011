class Sqlite3DbFile { // FileSystemAccess API は Chromeでしか使えない
    #dirHandle = null
    constructor() {
        //this.PATH_WASM = `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.7.0`
        this.PATH_WASM = `lib/sql.js/1.7.0`
    }
    async write(name) {
        const dirHandle = await this.#getDirectoryPicker()
        if (!dirHandle) return
        try {
            const fileHandle = await dirHandle.getFileHandle(name, {
                create: true,
            })
            const writable = await fileHandle.createWritable()
            await writable.write(this.db.export())
            await writable.close()
        } catch (e) {
            console.error(e)
        }
    }
    async read(name) {
        const dirHandle = await this.#getDirectoryPicker()
        if (!dirHandle) { return }
        console.debug(dirHandle)
        const fileHandle = await dirHandle.getFileHandle(name)
        const file = await fileHandle.getFile()
        const arrayBuffer = await file.arrayBuffer()
        const dbAsUint8Array = new Uint8Array(arrayBuffer)
        if (!this.SQL) {
            this.SQL = await initSqlJs({locateFile: file => `${this.PATH_WASM}/${file}`})
        }
        this.db = new this.SQL.Database(dbAsUint8Array)
        //document.getElementById(`update`).disabled = false
        return this.db
    }
    async load(dbAsUint8Array) {
        if (!this.SQL) {
            this.SQL = await initSqlJs({locateFile: file => `${this.PATH_WASM}/${file}`})
        }
        return new this.SQL.Database(dbAsUint8Array)
    }
    async #getDirectoryPicker() {
        if (this.#dirHandle) { return this.#dirHandle }
        try {
            this.#dirHandle = await window.showDirectoryPicker()
            return this.#dirHandle
        } catch (e) {
            console.error(e)
        }
    }
}
