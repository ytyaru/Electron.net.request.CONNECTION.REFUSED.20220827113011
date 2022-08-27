class MyLogDownloader {
    constructor(db) {
        this.SQL = null
        this.db = db
        this.files = new Map()
    }
    async download() {
        await this.downloadHtml()
        //await Promise.all([this.downloadDb(), this.downloadHtml()])
        Toaster.toast(`ダウンロードしました！`)
    }
    async downloadHtml() { // zip版
        Loading.show()
        this.zip = new JSZip()
        //const content = await this.#makeDb()
        //this.zip.file(`mylog.${ext}`, content)
        //this.zip.file(`mylog/mylog.db`, await this.#makeDb())
        //this.zip.file(`mylog/index.html`, this.#getIndex())
        //this.zip.file(`mylog/server.sh`, await this.#getCode(`server.sh`))
        const files = await Promise.all([
            this.#getStyle(),
            this.#mpurseSendButtonCode(),
            this.#getCode(`lib/toastify/1.11.2/min.css`),
            this.#getCode(`lib/toastify/1.11.2/min.js`),
            this.#getCode(`server.sh`),
            this.#getCode(`run_server.py`),
            this.#getCode(`lib/party/party.min.js`),
            this.#getCode(`js/party-sparkle-image.js`),
            this.#getCode(`js/party-sparkle-hart.js`),
            this.#getIndex(),
            this.#makeDb(),
            this.#assetsMonacoin(),
        ])
        const style = files[0]
        const mpurseSendButton = files[1]
        const toastifyCss = files[2]
        const toastify = files[3]
        const serverSh = files[4]
        const serverPy = files[5]
        const party = files[6]
        const partySparkleImage = files[7]
        const partySparkleHart = files[8]
        const staticIndex = files[9]
        const sqlite3Db = files[10]

        /*
        const style = await this.#getStyle()
        const mpurseSendButton = await this.#mpurseSendButtonCode()
        const toastifyCss = await this.#getCode(`lib/toastify/1.11.2/min.css`)
        const toastify = await this.#getCode(`lib/toastify/1.11.2/min.js`)
        const serverSh = await this.#getCode(`server.sh`)
        const serverPy = await this.#getCode(`run_server.py`)
        const party = await this.#getCode(`lib/party/party.min.js`)
        const partySparkleImage = await this.#getCode(`js/party-sparkle-image.js`)
        const partySparkleHart = await this.#getCode(`js/party-sparkle-hart.js`)
        */
        //this.zip.file(`mylog/static/index.html`, new TextEncoder().encode(await this.#getIndex()))
        this.zip.file(`mylog/static/index.html`, new TextEncoder().encode(staticIndex))
        this.zip.file(`mylog/static/css/style.css`, style)
        this.zip.file(`mylog/static/js/main.js`, new TextEncoder().encode(this.#getMain()))
        if (window.mpurse) {
            this.zip.file(`mylog/static/server.sh`, serverSh , {unixPermissions: "755"})
            this.zip.file(`mylog/static/run_server.py`, serverPy)
            this.zip.file(`mylog/static/lib/toastify/1.11.2/min.js`, toastify)
            this.zip.file(`mylog/static/lib/toastify/1.11.2/min.css`, toastifyCss)
            this.zip.file(`mylog/static/lib/party/party.min.js`, party)
            this.zip.file(`mylog/static/js/monacoin/mpurse-send-button.js`, mpurseSendButton)
            this.zip.file(`mylog/static/js/monacoin/party-sparkle-image.js`, partySparkleImage)
            this.zip.file(`mylog/static/js/monacoin/party-sparkle-hart.js`, partySparkleHart)
        }
        //this.zip.file(`mylog/sqlite3/db/mylog.db`, await this.#makeDb())
        this.zip.file(`mylog/sqlite3/db/mylog.db`, sqlite3Db)
        this.zip.file(`mylog/sqlite3/index.html`, this.#getCode(`js/app/export/sqlite3/index.html`))
        this.zip.file(`mylog/sqlite3/css/style.css`, style)
        this.zip.file(`mylog/sqlite3/js/main.js`, this.#getCode(`js/app/export/sqlite3/main.js`))
        this.zip.file(`mylog/sqlite3/lib/mylog/sqlite-db-loader.js`, this.#getCode(`js/app/export/sqlite3/sqlite-db-loader.js`))
        this.zip.file(`mylog/sqlite3/lib/mylog/db-to-html.js`, this.#getCode(`js/app/export/sqlite3/db-to-html.js`))
        this.zip.file(`mylog/sqlite3/lib/sql.js/1.7.0/sql-wasm.min.js`, this.#getCode(`lib/sql.js/1.7.0/sql-wasm.min.js`))
        this.zip.file(`mylog/sqlite3/lib/sql.js/1.7.0/sql-wasm.wasm`, this.#getBinary(`lib/sql.js/1.7.0/sql-wasm.wasm`))
        this.zip.file(`mylog/sqlite3/server.sh`, serverSh , {unixPermissions: "755"})
        this.zip.file(`mylog/sqlite3/run_server.py`, serverPy)
        this.zip.file(`mylog/sqlite3/lib/toastify/1.11.2/min.js`, toastify)
        this.zip.file(`mylog/sqlite3/lib/toastify/1.11.2/min.css`, toastifyCss)
        this.zip.file(`mylog/sqlite3/lib/party/party.min.js`, party)
        this.zip.file(`mylog/sqlite3/lib/monacoin/mpurse-send-button.js`, mpurseSendButton)
        this.zip.file(`mylog/sqlite3/lib/monacoin/party-sparkle-image.js`, partySparkleImage)
        this.zip.file(`mylog/sqlite3/lib/monacoin/party-sparkle-hart.js`, partySparkleHart)
        //await this.#assetsMonacoin() 
        const file = await this.zip.generateAsync({type:'blob', platform:this.#getOs()})
        console.debug(file)
        const url = (window.URL || window.webkitURL).createObjectURL(file);
        const download = document.createElement('a');
        download.href = url;
        download.download = `mylog.zip`;
        download.click();
        (window.URL || window.webkitURL).revokeObjectURL(url);
        Loading.hide()
        //Toaster.toast(`ZIPファイルをダウンロードしました！`)
    }
    async #assetsMonacoin() {
        const ids = ['coin-mark-black', 'coin-mark', 'coin-mini-monar-mouth-red', 'coin-mini-monar', 'coin-monar-mouth-red', 'coin-monar', 'mark-outline', 'mark', 'monar-mark-white', 'monar-mark', 'monar-mouth-red', 'monar-no-face', 'monar-transparent', 'monar']
        const svgs = ids.map(id=>this.#getCode(`/asset/image/monacoin/svg/${id}.svg`))
        const png64s = ids.map(id=>this.#getBinary(`/asset/image/monacoin/png/64/${id}.png`))
        const png256s = ids.map(id=>this.#getBinary(`/asset/image/monacoin/png/256/${id}.png`))
        const files = await Promise.all([...svgs, ...png64s, ...png256s])
        for (let i=0; i<ids.length; i++) {
            this.zip.file(`mylog/sqlite3/asset/image/monacoin/svg/${ids[i]}.svg`, files[i+((i/3)*0)])
            this.zip.file(`mylog/sqlite3/asset/image/monacoin/png/64/${ids[i]}.png`, files[i+((i/3)*1)])
            this.zip.file(`mylog/sqlite3/asset/image/monacoin/png/256/${ids[i]}.png`, files[i+((i/3)*2)])
        }
    }
    async #mpurseSendButtonCode() {
        const code = await this.#getCode(`js/mpurse-send-button.js`, true)
        console.debug(code)
        const address = await window.mpurse.getAddress()
        return new TextEncoder().encode(code.replace(/MEHCqJbgiNERCH3bRAtNSSD9uxPViEX1nu/g, address))
        //return code.replace(/MEHCqJbgiNERCH3bRAtNSSD9uxPViEX1nu/g, address)
    }
    async #getIndex() {
        //return 'data:text/plain;charset=utf-8,' + encodeURI(
        const address = (window.mpurse) ? await window.mpurse.getAddress() : ''
        let content = await this.#getContent()
        if (window.mpurse) {content=content.replace(/ to="MEHCqJbgiNERCH3bRAtNSSD9uxPViEX1nu"/g, '')}
        const libs = (window.mpurse) ? `<link rel="stylesheet" href="lib/toastify/1.11.2/min.css">
<script src="lib/toastify/1.11.2/min.js"></script>
<script src="lib/party/party.min.js"></script>
<script src="js/monacoin/mpurse-send-button.js"></script>
<script src="js/monacoin/party-sparkle-image.js"></script>
<script src="js/monacoin/party-sparkle-hart.js"></script>
` : ''
        return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>つぶやき</title>
<link rel="stylesheet" href="css/style.css">
${libs}
<script src="js/main.js"></script>
</head>
<body>
${content}
</body>
</html>`
//<div id="post-list"></div>
//        + document.getElementById('post-list').innerHTML
    }
    async #getContent() {
        const cms = await this.db.dexie.comments.toArray()
        cms.sort((a,b)=>b.created - a.created)
        //return cms.map(c=>TextToHtml.toHtml(c.id, c.content, c.created, true)).join('')
        const address = (window.mpurse) ? await window.mpurse.getAddress() : null
        return cms.map(c=>TextToHtml.toHtml(c.id, c.content, c.created, address, true)).join('')
    }
    async #getStyle() { return this.#getCode(`./css/styles.css`) }
    async #getCode(path, isText=false) {
        const res = await fetch(path)
        const txt = await res.text()
        console.log(isText)
        return ((isText) ? txt : new TextEncoder().encode(txt))
        //return new TextEncoder().encode(txt)
        //return await res.text()
        //return 'data:text/plain;charset=utf-8,' + encodeURI(await res.text())
    }
    async #getBinary(path) {
        const res = await fetch(path)
        const buf = await res.arrayBuffer()
        return new Uint8Array(buf)
    }
    #getMain() { return `window.addEventListener('DOMContentLoaded', async(event) => {
    const db = new MyLogDb()
    const sqlFile = new Sqlite3DbFile()
    document.getElementById('post-list').innerHTML = await db.toHtml()
});`
    }
    /*
    async download(ext='db') { // zip版
        Loading.show()
        this.zip = new JSZip()
        const content = await this.#makeDb()
        this.zip.file(`mylog.${ext}`, content)
        //this.#makeHtmlFiles(files)
        //await Promise.all([this.#makeHtmlFiles(), this.#makeJsFiles(), this.#makeImageFiles()])
        const file = await this.zip.generateAsync({type:'blob', platform:this.#getOs()})
        const url = (window.URL || window.webkitURL).createObjectURL(file);
        const download = document.createElement('a');
        download.href = url;
        download.download = `mylog.zip`;
        download.click();
        (window.URL || window.webkitURL).revokeObjectURL(url);
        Loading.hide()
        Toaster.toast(`ZIPファイルをダウンロードしました！`)
    }
    */
    /*
    async download(ext='db') { // https://stackoverflow.com/questions/24966020/saving-uint8array-to-a-sqlite-file
        Loading.show()
        const content = await this.#makeDb()
        const url = (window.URL || window.webkitURL).createObjectURL(new Blob([content], {type: 'application/octet-stream'}));
        const download = document.createElement('a');
        download.href = url;
        download.download = `mylog.${ext}`;
        download.click();
        (window.URL || window.webkitURL).revokeObjectURL(url);
        Loading.hide()
        Toaster.toast(`DBファイルをダウンロードしました！`)
    }
    */
    async downloadDb(ext='db') { // https://stackoverflow.com/questions/24966020/saving-uint8array-to-a-sqlite-file
        Loading.show()
        const content = await this.#makeDb()
        const url = (window.URL || window.webkitURL).createObjectURL(new Blob([content], {type: 'application/octet-stream'}));
        const download = document.createElement('a');
        download.href = url;
        download.download = `mylog.${ext}`;
        download.click();
        (window.URL || window.webkitURL).revokeObjectURL(url);
        Loading.hide()
        //Toaster.toast(`DBファイルをダウンロードしました！`)
    }
    #getOs() {
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.indexOf("windows nt") !== -1) { return 'DOS' }
        return 'UNIX'
    }
    async #makeDb() { return await window.myApi.exportDb() }
    /*
    async #makeDb() {
        if (!this.SQL) { this.SQL = await initSqlJs({locateFile: file => `lib/sql.js/1.7.0/${file}`}) }
        const db = new this.SQL.Database();
        db.exec(`BEGIN;`)
        await this.#makeTableComments(db)
        db.exec(`COMMIT;`)
        return db.export()
    }
    */
    async #makeTableComments(db) {
        db.exec(this.#createSqlComments())
        const cms = await this.db.dexie.comments.toArray()
        for (const c of cms) {
            db.exec(`insert into comments (content, created) values ('${c.content}',${c.created});`)
        }
    }
    #createSqlComments() { return `
create table if not exists comments (
  id integer primary key not null,
  content text not null,
  created integer not null
);`
    }
}
