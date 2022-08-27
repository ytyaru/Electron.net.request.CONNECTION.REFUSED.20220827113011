class MyLogUploader {
    constructor(db, sqlFile) {
        this.db = db
        this.SQL = null
        this.sqlFile = sqlFile
        //this.file = null
    }
    async setup() {
        const self = this
        //const dropZone = document.getElementById('drop-zone');
        const dropZone = document.getElementById('content');
        const fileInput = document.getElementById('file-input');
        const preview = document.getElementById('preview');
        dropZone.addEventListener('dragover', (e)=>{
            console.debug('dragover')
            e.stopPropagation();
            e.preventDefault();
            e.target.style.background = '#e1e7f0';
        }, false);
        dropZone.addEventListener('dragleave', (e)=>{
            console.debug('dragleave')
            e.stopPropagation();
            e.preventDefault();
            e.target.style.background = '#ffffff';
        }, false);
        fileInput.addEventListener('change', async(e)=>{
            if (0 === e.target.files.length) { return }
            Loading.show()
            console.debug(e.target)
            console.debug(e.target.files)
            await this.#setupFileReader(e.target.files[0], dropZone)
            /*
            const fr = new FileReader();
            console.debug(e)
            console.debug(e.target.files)
            fr.readAsArrayBuffer(e.target.files[0])
            fr.addEventListener('load', async(event) => {
                console.debug(event)
                await this.#load(e.target.files[0].name, new Uint8Array(fr.result)) 
                dropZone.focus()
            })
            */
        });
        dropZone.addEventListener('drop', async(e)=>{
            Loading.show()
            console.debug('drop')
            e.stopPropagation();
            e.preventDefault();
            e.target.style.background = '#ffffff'; //背景色を白に戻す
            var files = e.dataTransfer.files; //ドロップしたファイルを取得
            if (files.length > 1) { return Toaster.toast('アップロードできるファイルは1つだけです。', true); }
            fileInput.files = files; //inputのvalueをドラッグしたファイルに置き換える。
            await this.#setupFileReader(files[0], dropZone)
            /*
            const fr = new FileReader();
            fr.readAsArrayBuffer(files[0])
            fr.addEventListener('load', async(event) => {
                console.debug(event)
                await this.#load(files[0].name, new Uint8Array(fr.result)) 
                dropZone.focus()
            })
            */
        }, false);
    }
    async #setupFileReader(file, dropZone) {
        //console.debug(file)
        const fr = new FileReader();
        fr.readAsArrayBuffer(file)
        fr.addEventListener('load', async(event) => {
            //console.debug(event)
            await this.#load(file.name, new Uint8Array(fr.result)) 
            dropZone.focus()
        })
    }
    async #load(name, content) { // ローカルのsqlite3ファイルからIndexedDBへマージする
        console.debug(this.sqlFile)
        //const db = await this.sqlFile.load(content)
        const db = await this.sqlFile.read(name)
        console.debug(db)
        if (!db) { Loading.hide(); return; }
        let res = await this.#valid(db)
        if (!res) { Loading.hide(); return; }
        // SQLite3DBレコードをIndexedDBに挿入する
        this.db.dexie.comments.clear()
        res = db.exec(`select * from comments;`)
        console.debug(res)
        for (const row of res[0].values) {
            console.debug(row)
            console.debug(row)
            await this.db.dexie.comments.put({
                id: row[0],
                content: row[1],
                created: row[2],
            })
        }
        Loading.hide()
        Toaster.toast('SQLite3ファイルをIndexedDBに取り込みました。')
        //document.getElementById('is-over-write').disabled = false
        document.getElementById('post-list').innerHTML = await this.db.toHtml()
    }
    async #valid(db) {
        let res = db.exec(`select name from sqlite_master;`)
        console.debug(res)
        const tableNames = res[0].values.map(v=>v[0])
        console.debug(tableNames)
        const validTableNames = ['comments']
        if (!tableNames.every(name=>validTableNames.includes(name))) { return this.#validError(`必要なテーブルが存在しません。次の名前のテーブルを用意してください。: ${validTableNames.join(', ')}`) }
        for (const name of tableNames) {
            res = await this.#validRow(db, name)
            if (!res) { return false }
        }
        if (!this.#validFields(db)) { return false }
        return true
    }
    #validFields(db) {
        if (!this.#validField(db, 'comments', ['id', 'content', 'created'])) { return false }
        return true
    }
    #validField(db, tableName, valids) {
        let res = db.exec(`PRAGMA table_info('${tableName}');`)
        console.debug(res)
        const fields = res[0].values.map(v=>v[1])
        console.debug(fields)
        console.debug(valids)
        if (!fields.every(n=>valids.includes(n))) { return this.#validError(`必要な列名が存在しません。次の名前のテーブルに次の列名を用意してください。${tableName}: ${valids.join(',')}`) }
        return true
    }
    async #validRow(db, name) {
        console.debug(db, name)
        let res = db.exec(`select count(*) from ${name};`)
        console.debug(res)
        const lCnt = res[0].values[0][0]
        console.debug(lCnt)
        if (0 == lCnt) { return this.#validError(`${name}テーブルのレコード数が0件です。1件以上あるときのみ取込できます。`) }
        /*
        res = await this.dbs.get(this.my).dexie.table(Caser.snakeToCamel(name)).count()
        console.debug(res)
        const bCnt = res
        console.debug(lCnt, bCnt)
        if (lCnt < bCnt) { return this.#validError(`${name}テーブルのレコード数がIndexedDBのそれより少ないです。古いDBとみなし取込を中止します。`) }
        */
        return true
    }
    #validError(msg) {
        console.error(msg)
        alert(msg)
        return false
    }
    ToSqlite(db) {
        
        console.debug(db.exec(`select * from comments;`))
    }
    /*
    async #preview(content) {
        const db = await this.sqlFile.read('users.db')
        let res = JSON.stringify(db.exec(`SELECT sqlite_version();`));
        console.debug(res)
        const tableNames = db.exec(`select name from sqlite_master;`).map(t=>t.values[0]);
        console.debug(tableNames)
        res = db.exec(`select * from users;`);
        console.debug(res)
        const tables = new Map()
        const preview = document.getElementById(`preview`)
        const html = []
        for (const name of tableNames) {
            console.debug(name)
            const sql = db.exec(`select sql from sqlite_master where type='table' and name='${name}';`)
            console.debug(sql)
            const columns = db.exec(`PRAGMA table_info(${name})`)
            console.debug(columns)
            const records = db.exec(`select * from ${name};`)
            console.debug(records)
            const data = { name:name, sql:sql[0], columns:columns[0], rows:records[0] }
            tables.set(name, data)
            html.push(this.#makeTable(data))
        }
        console.debug(html.join(''))
        preview.innerHTML = html.join('')
        console.debug(tables)
        Loading.hide()
    }
    */
    /*
    async #preview(content) {
        if (!this.SQL) {
            this.SQL = await initSqlJs({locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`})
        }
        console.debug(content)
        const db = new this.SQL.Database(content);
        let res = JSON.stringify(db.exec(`SELECT sqlite_version();`));
        console.debug(res)
        const t = db.exec(`select name from sqlite_master;`);
        console.debug(t)
        const tableNames = db.exec(`select name from sqlite_master;`).map(t=>t.values[0]);
        console.debug(tableNames)
        res = db.exec(`select * from users;`);
        console.debug(res)
        const tables = new Map()
        const preview = document.getElementById(`preview`)
        const html = []
        for (const name of tableNames) {
            console.debug(name)
            const sql = db.exec(`select sql from sqlite_master where type='table' and name='${name}';`)
            console.debug(sql)
            const columns = db.exec(`PRAGMA table_info(${name})`)
            console.debug(columns)
            const records = db.exec(`select * from ${name};`)
            console.debug(records)
            const data = { name:name, sql:sql[0], columns:columns[0], rows:records[0] }
            tables.set(name, data)
            html.push(this.#makeTable(data))
        }
        console.debug(html.join(''))
        preview.innerHTML = html.join('')
        console.debug(tables)
        Loading.hide()
    }
    */
    /*
    #makeTable(data) {
        const th = data.columns.values.map(v=>`<th>${v[1]}</th>`).join('')
        const td = []
        for (const row of data.rows.values) {
            td.push('<tr>' + row.map(d=>`<td>${d}</td>`).join('') + '</tr>')
        }
        return `<table><caption>${data.name}</caption>
<tr>${th}</tr>
${td.join('')}
</table>`
    }
    async download(name='users', ext='db') {
        Loading.show()
        this.zip = new JSZip()
        const content = await this.#makeDb()
        this.zip.file(`${name}.${ext}`, content)
        //this.#makeHtmlFiles(files)
        //await Promise.all([this.#makeHtmlFiles(), this.#makeJsFiles(), this.#makeImageFiles()])
        const file = await this.zip.generateAsync({type:'blob', platform:this.#getOs()})
        const url = (window.URL || window.webkitURL).createObjectURL(file);
        const download = document.createElement('a');
        download.href = url;
        download.download = `${name}.zip`;
        download.click();
        (window.URL || window.webkitURL).revokeObjectURL(url);
        Loading.hide()
        Toaster.toast(`ZIPファイルをダウンロードしました！`)
    }
    #getOs() {
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.indexOf("windows nt") !== -1) { return 'DOS' }
        return 'UNIX'
    }
    async #makeDb() {
        if (!this.SQL) {
            //this.SQL = await initSqlJs({locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`})
            this.SQL = await initSqlJs({locateFile: file => `lib/sql.js/1.7.0/${file}`})
        }
        //const SQL = await initSqlJs({locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.7.0/${file}`})
        const db = new this.SQL.Database();
        let res = JSON.stringify(db.exec("SELECT sqlite_version();"));
        console.debug(res)
        res = JSON.stringify(db.exec(`CREATE TABLE users(id INTEGER PRIMARY KEY, name TEXT);`));
        console.debug(res)
        //res = JSON.stringify(db.exec(`.tables`)); // .コマンドは使えなかった
        //console.debug(res)
        const values = document.getElementById('usernames').value.split('\n').filter(v=>v).map(n=>`('${n}')`).join(',')
        res = JSON.stringify(db.exec(`INSERT INTO users(name) VALUES ${values || "('ytyaru')"};`));
        //res = JSON.stringify(db.exec(`INSERT INTO users(name) VALUES ('ytyaru');`));
        console.debug(res)
        res = JSON.stringify(db.exec(`SELECT * FROM users;`));
        console.debug(res)
        return db.export()
    }
    */
    /*
    #makeHtmlFiles(files) {
        //for (const name of files.map(f=>file.url.split('/').slice(-1)[0])) {
        //    this.zip.file(name, file.content)
        //}
        for (const file of files) {
            //const paths = file.url.split('/')
            //const name = paths[paths.length-1]
            //const name = file.url.split('/').slice(-1)[0]
            //this.zip.file(name, file.content)
            //this.zip.file(file.url.split('/').slice(-1)[0], file.content)
            console.debug(file)
            //const ext = file.url.split('.').slice(-1)[0]
            const name = `${file.domain}.${file.ext}`
            this.zip.file(name, file.content)
            console.debug(name)
        }
    }
    */
    /*
    async #makeHtmlFiles() {
        const head = `<head><meta charset="UTF-8"><title>投げモナボタン</title>${this.#makeLoad()}</head>`
        const docs = await this.#makeNote()
        const body = `<body>
${docs}
</body>`
        const html = `<!DOCTYPE html>
${head}
${body}`
        this.zip.file('index.html', html)
        this.zip.file('article-1.html', html)
    }
    async #makeJsFiles() {
        for (const file of this.dependents) {
            this.zip.file(file, await this.#getData(file))
        }
        this.zip.file('js/mpurse-send-button.js', await new MpurseSendButtonGenerator().getScript())
        //this.zip.file('server.sh', await this.#getData('server.sh'), {unixPermissions: "755"})
        this.zip.file('server.sh', await this.#getData('server.sh'), {unixPermissions: "0100755"})
        this.zip.file('run_server.py', await this.#getData('run_server.py'))
    }
    async #makeImageFiles() {
        const base = document.getElementById(`base-url`).value.split('/').filter(v=>v).filter(v=>'.'!==v && '..'!==v).join('/')
        //if (!base.endsWith('/')) { base += '/' }
        const files = Array.prototype.slice.call(document.querySelectorAll(`input[type=checkbox][name=img-files]`)).filter(e=>e.checked).map(e=>e.value)
        console.debug(files)
        const formats = Array.prototype.slice.call(document.querySelectorAll(`input[type=radio][name=img-format]`)).filter(e=>e.checked)[0].value.split(',')
        const sizes = document.querySelector(`#img-file-sizes`).value.split(',')
        const promises = []
        for (const file of files) {
            for (const format of formats) {
                const [createPaths, sourcePaths] = this.#getImgPaths(base, file, format, sizes)
                console.debug(createPaths, sourcePaths)
                for (let i=0; i<createPaths.length; i++) {
                    //this.zip.file(createPaths[i], await this.#getData(sourcePaths[i], ('svg'!==format)))
                    promises.push(this.#getDataWithPath(sourcePaths[i], ('svg'!==format), createPaths[i]))
                }
            }
        }
        const contents = await Promise.all(promises)
        for (const content of contents) {
            this.zip.file(content.path, content.content)
        }
    }
    #getImgPaths(base, file, format, sizes) {
        const hasSizeDir = ('svg'===format) ? false : true
        const createFilePaths = sizes.map(size=>`${base}/${format}/${(hasSizeDir) ? size+"/" : ''}${file}.${format}`)
        const sourceFilePaths = sizes.map(size=>`./asset/image/monacoin/${format}/${(hasSizeDir) ? size+"/" : ''}${file}.${format}`)
        return [createFilePaths, sourceFilePaths]
    }
    async #getData(url, isBin=false) {
        const res = await fetch(url)
        return await res[(isBin) ? 'blob' : 'text']()
        //return (isBin) ? await res.blob() : await res.text()
    }
    async #getDataWithPath(url, isBin, path) {
        const res = await fetch(url)
        const obj = {}
        obj.path = path
        obj.content = await res[(isBin) ? 'blob' : 'text']()
        return obj
    }
    #toast(message) {
        if (Toastify) { Toastify({text: message, position:'center'}).showToast(); }
        else { alert(message) }
    }
    #makeLoad() {
        const depends = this.dependents.map(f=>(f.endsWith('css')) ? this.#makeLinkCss(f) : this.#makeScript(f))
        depends.push(this.#makeScript(`js/mpurse-send-button.js`)) 
        return depends.join('\n')
    }
    #makeScript(path) { return `<script src="${path}"></script>` }
    #makeLinkCss(path) { return `<link rel="stylesheet" type="text/css" href="${path}">` }
    #makeMpurseSendButtons() {
        const simple = `<mpurse-send-button></mpurse-send-button>`
        const fullAttrs = new MpurseSendButtonGenerator().makeMpurseSendButton()
        return `${simple}${fullAttrs}`
    }
    async #makeNote() {
        const res = await fetch(`/asset/content/document.md`)
        console.debug(res)
        let md = await res.text()
        const table = this.#makeInnerImageTable()
        console.debug(table)
        md = md.replace('//-----inner-img-table-----//', table)
        md = md.replace('//-----mpurse-send-button-----//', this.#makeMpurseSendButtons())
        console.debug(md)
        await markdown.ready;
        return markdown.parse(md);
    }
    #makeInnerImageTable() {
        const base = document.getElementById(`base-url`).value.split('/').filter(v=>v).filter(v=>'.'!==v && '..'!==v).join('/')
        const files = Array.prototype.slice.call(document.querySelectorAll(`input[type=checkbox][name=img-files]`)).filter(e=>e.checked).map(e=>e.value)
        const formats = Array.prototype.slice.call(document.querySelectorAll(`input[type=radio][name=img-format]`)).filter(e=>e.checked)[0].value.split(',')
        const sizes = document.querySelector(`#img-file-sizes`).value.split(',')

        const ths = [`<th><code>src-id</code></th>`]
        for (const format of formats) {
            if ('svg'===format) { ths.push(`<th>${format}</th>`) }
            else {
                for (const size of sizes) {
                    ths.push(`<th>${format} ${size}</th>`) 
                }
            }
        }
        const trs = []
        for (const file of files) {
            const tds = [`<th>${file}</th>`]
            for (const format of formats) {
                const hasSizeDir = ('svg'===format) ? false : true
                if (hasSizeDir) {
                    for (const size of sizes) {
                        const path = `${base}/${format}/${size}/${file}.${format}`
                        //tds.push(`<td><img src="${path}" width="64" height="64"></td>`)
                        tds.push(`<td><mpurse-send-button format="${format}" src-id="${file}" size="64"></mpurse-send-button></td>`)
                    }
                } else {
                    const path = `${base}/${format}/${file}.${format}`
                    //tds.push(`<td><object type="image/svg+xml" data="${path}" width="64" height="64"></object></td>`)
                    tds.push(`<td><mpurse-send-button format="${format}" src-id="${file}" size="64"></mpurse-send-button></td>`)
                }
            }
            trs.push(`<tr>${tds.join('')}</tr>`)
        }
        return `<table><tr>${ths.join('')}</tr>${trs.join('')}<table>`
    }
    */
}
