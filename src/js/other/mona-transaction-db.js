class MonaTransactionDb {
    constructor(address) {
        //this.create(address)
    }
    async create(address) { // address:自分のアドレス
        console.debug('MonaTransactionDb.create()')
        this.dexie = new Dexie(`${address}`); // 自分のアドレスひとつごとにDBを作成する。テーブル結合不要になる。
        /* dexieでバージョンをあげると面倒くさいことになる。下げることができない。ダウングレードできない。不整合でバグる。
        this.dexie.version(2).stores({
            last: `++id`,
            sendPartners: `address`,
            receivePartners: `address`,
            transactions:  `txid`,
        }).upgrade(async(tx)=>{
            const txs = await dbs.get(addr).dexie.transactions.toArray().catch(e=>console.error(e))
            console.debug(txs)
            for (const t of txs) {
                if (tx.hasOwnProperty('isPay')) {
                    await dbs.get(addr).dexie.transactions.put({
                        txid: t.txid,
                        isSend: t.isPay, // このプロパティ名を変更する
                        addresses: t.addresses,
                        value: t.value,
                        fee: t.fee,
                        confirmations: t.confirmations,
                        blockTime: t.blockTime,
                        blockHeight: t.blockHeight,
                    })
                }
            }
        })
        */
        this.dexie.version(1).stores({
            last: `++id`,
            sendPartners: `address`,
            receivePartners: `address`,
            transactions:  `txid`,
        })
        const txs = await this.dexie.transactions.toArray().catch(e=>console.error(e))
        console.debug(txs)
        for (const t of txs) {
            if (t.hasOwnProperty('isPay')) {
                await this.dexie.transactions.put({
                    txid: t.txid,
                    isSend: t.isPay, // このプロパティ名を変更する
                    addresses: t.addresses,
                    value: t.value,
                    fee: t.fee,
                    confirmations: t.confirmations,
                    blockTime: t.blockTime,
                    blockHeight: t.blockHeight,
                })
            }
        }
    }
    async addMyAddress(address) {
        this.dexie.addresses.put({address:address})
    }
}
