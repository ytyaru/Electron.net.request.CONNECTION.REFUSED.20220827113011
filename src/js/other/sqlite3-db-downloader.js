class Sqlite3DbDownloader {
    constructor(sqlFile, dbs, my) {
        this.SQL = null
        this.sqlFile = sqlFile
        this.dbs = dbs // dexies.js
        this.my = my // 対象アドレス
    }
    async download(ext='db') {
        Loading.show()
        this.zip = new JSZip()
        const content = await this.#makeDb()
        this.zip.file(`${this.my}.${ext}`, content)
        //this.#makeHtmlFiles(files)
        //await Promise.all([this.#makeHtmlFiles(), this.#makeJsFiles(), this.#makeImageFiles()])
        const file = await this.zip.generateAsync({type:'blob', platform:this.#getOs()})
        const url = (window.URL || window.webkitURL).createObjectURL(file);
        const download = document.createElement('a');
        download.href = url;
        download.download = `monacoin-transaction-db.zip`;
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
            //this.SQL = await initSqlJs({locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.7.0/${file}`})
            this.SQL = await initSqlJs({locateFile: file => `lib/sql.js/1.7.0/${file}`})
        }
        const db = new this.SQL.Database();
        db.exec(`BEGIN;`)
        await this.#makeTableLast(db)
        await this.#makeTableSendPartners(db)
        await this.#makeTableReceivePartners(db)
        await this.#makeTableTransactions(db)
        db.exec(`COMMIT;`)
        return db.export()
    }
    async #makeTableLast(db) {
        const last = await this.dbs.get(this.my).dexie.last.get(1)
        db.exec(this.#createSqlLast())
        const sql = `insert into last values (
1,
${last.count},
${last.lastBlockHeight},
'${last.lastTxId}',
${last.sendValue},
${last.receiveValue},
${last.balance},
${last.fee},
${last.unconfirmedBalance},
${last.unconfirmedTxs},
${last.sendCount},
${last.receiveCount},
${last.sendAddressCount},
${last.receiveAddressCount},
${last.bothAddressCount},
${last.firsted},
${last.lasted}
);`
        console.debug(sql)
        db.exec(sql)
    }
    async #makeTableSendPartners(db) {
        db.exec(this.#createSqlSendPartners())
        const partners = await this.dbs.get(this.my).dexie.sendPartners.toArray()
        const values = partners.map(p=>`('${p.address}', ${p.value}, ${p.count}, ${p.firsted}, ${p.lasted})`).join(',')
        //db.exec(`insert into send_partners values ${values};`)
        for (const p of partners) {
            db.exec(`insert into send_partners values ('${p.address}', ${p.value}, ${p.count}, ${p.firsted}, ${p.lasted});`)
        }
    }
    async #makeTableReceivePartners(db) {
        db.exec(this.#createSqlReceivePartners())
        const partners = await this.dbs.get(this.my).dexie.receivePartners.toArray()
        const values = partners.map(p=>`('${p.address}', ${p.value}, ${p.count}, ${p.firsted}, ${p.lasted})`).join(',')
        //db.exec(`insert into receive_partners values ${values};`)
        for (const p of partners) {
            db.exec(`insert into receive_partners values ('${p.address}', ${p.value}, ${p.count}, ${p.firsted}, ${p.lasted});`)
        }
    }
    async #makeTableTransactions(db) {
        db.exec(this.#createSqlTransactions())
        const txs = await this.dbs.get(this.my).dexie.transactions.toArray()
        for (const tx of txs) {
            db.exec(`insert into transactions values (
'${tx.txid}',
${tx.isSend},
'${tx.addresses}',
${tx.value},
${tx.fee},
${tx.confirmations},
${tx.blockTime},
${tx.blockHeight}
);`)
        }
    }
    #createSqlLast() { return `
create table if not exists last (
  id integer primary key not null,
  count integer,
  last_block_height integer,
  last_txid integer,
  send_value integer,
  receive_value integer,
  balance integer,
  fee integer,
  unconfirmed_balance integer,
  unconfirmed_txs integer,
  send_count integer,
  receive_count integer,
  send_address_count integer,
  receive_address_count integer,
  both_address_count integer,
  firsted integer,
  lasted integer
);`
    }
    #createSqlSendPartners() { return `
create table if not exists send_partners (
  address text primary key not null,
  value integer,
  count integer,
  firsted integer,
  lasted integer
) without rowid;`
    }
    #createSqlReceivePartners() { return `
create table if not exists receive_partners (
  address text primary key not null,
  value integer,
  count integer,
  firsted integer,
  lasted integer
) without rowid;`
    }
    #createSqlTransactions() { return `
create table if not exists transactions (
  txid text primary key not null,
  is_send integer,
  addresses text,
  value integer,
  fee integer,
  confirmations integer,
  block_time integer,
  block_height integer
) without rowid;`
    }
}
