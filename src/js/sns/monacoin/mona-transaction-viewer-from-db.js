class MonaTransactionViewerFromDb {
    constructor(my, dbs) { // my: 自分のアドレス, dbs: Map<MonaTransactionDb>
        this.my = my
        this.dbs = dbs
        this.register = new ProfileRegister()
        this.gen = new ProfileGenerator()
    }
    async generate() {
        this.txs = await this.dbs.get(this.my).dexie.transactions.toArray()
        this.last = await this.dbs.get(this.my).dexie.last.get(1)
        console.debug(this.txs)
        console.debug(this.last)
        const pays = await this.makePayPeoples()
        const receives = await this.makeReceivedPeoples()
        console.debug(pays)
        console.debug(receives)
        this.profiles = await this.register.get()
        for (let i=0; i<this.profiles.length; i++) {
            this.profiles[i].profile = JSON.parse(this.profiles[i].profile)
        }
        console.debug(this.profiles)
        const svgGen = new CircleSvgGeneratorFromDb(this.my, this.profiles)
        return this.makeTerm()
             + '<br>'
             + this.makeBalancePeopleTable()
             + this.#makeCalcTable(pays, receives)
             + await this.#makeMpChainTable()
             + '<br>'
             + svgGen.generate(pays)
             + svgGen.generate(receives)
             + this.makePeoplesTable(pays, true)
             + '<br>'
             + this.makePeoplesTable(receives, false)
    }
    makeTerm() { // 日時（最後の取引〜最初の取引）
        const lasted = new Date(this.last.lasted * 1000);
        const firsted = new Date(this.last.firsted * 1000);
        const count = this.last.count
        const sendCnt = this.txs.filter(tx=>tx.isSend).length
        const receiveCnt = this.txs.filter(tx=>!tx.isSend).length
        return this.#makeTime(lasted) + '〜' + this.#makeTime(firsted)
                + `　<span><span id="transaction-count">${count}</span>回</span>`
                + `（<span><span id="pay-count">${sendCnt}</span>出</span>`
                + `　<span><span id="received-count">${receiveCnt}</span>入</span>）`
    }

    #makeTime(date) { // date型
        if (isNaN(date)) { return '' } // 未承認トランザクションはblockTimeなどが-1になる。new Date(-1*1000)はNaNになる。
        //console.debug(date)
        const iso = date.toISOString()
        const month = (date.getMonth()+1).toString().padStart(2, '0')
        const dates = date.getDate().toString().padStart(2, '0')
        //const hours = date.getHours().toString().padStart(2, '0')
        //const minutes = date.getMinutes().toString().padStart(2, '0')
        //const seconds = date.getSeconds().toString().padStart(2, '0')
        const format = `${date.getFullYear()}-${month}-${dates}`
        //const format = `${date.getFullYear()}-${month}-${date} ${hours}:${minutes}:${seconds}`
        return `<time datetime="${iso}" title="${iso}">${format}</time>`
    }
    makeBalancePeopleTable() { return `<table><caption><a href="https://github.com/trezor/blockbook/blob/master/docs/api.md#get-address">API</a>取得値</caption><tr><td>${this.makePayBalanceAmount()}</td><td>${this.makePeopleTotalTable()}</td></tr></table>` }
    makePayBalanceAmount() {
        const pay = this.#toMona(this.last.sendValue)
        const receive = this.#toMona(this.last.receiveValue)
        const balance = this.#toMona(this.last.balance)
        return `<table>
<tr><th>支払総額</th><td class="num"><span id="total-pay">${pay}</span> MONA</td></tr>
<tr><th>受取総額</th><td class="num"><span id="total-receive">${receive}</span> MONA</td></tr>
<tr><th>残高</th><td class="num"><span id="balance">${balance}</span> MONA</td></tr></table>`
    }
    // 整数値valueからMONA単位に変換する
    #toMona(value) { return (value * (0.1**8)).toFixed(8) }
    makePeopleTotalTable() { // 支払人数,受取人数
        return `<table>
<tr><th>支払人数</th><td class="num"><span id="total-pay-peoples">${this.last.sendAddressCount}</span>人</td></tr>
<tr><th>受取人数</th><td class="num"><span id="total-receive-peoples">${this.last.receiveAddressCount}</span>人</td></tr>
<tr><th>両思人数</th><td class="num"><span id="total-pay-receive-peoples">${this.last.bothAddressCount}</span>人</td></tr>
</table>`
    }
    makePeoplesTable(results, isSend) {
        console.debug(results)
        const trs = []
        for (const r of results) {
            const profile = this.getProfile(r.address)
            console.debug(profile)
            if (profile) {
                if (profile.hasOwnProperty('error')) { profile = null }
                else { profile.profile['address'] = profile.address }
            }
            const tdAddr = `<td class="user-total-pay-address">${(profile) ? this.gen.generate(profile.profile) : r.address}</td>`
            const tdValues = `<td><span class="user-total-pay-amount">${this.#toMona(r.value)}</span></td>`
            const tdHistory = `<td>${this.makePayWhenValueTable(r.address, isSend)}</td>`
            trs.push(`<tr>${tdAddr}${tdValues}${tdHistory}</tr>`)
        }
        return `<table><caption>${(isSend) ? '支払' : '受取'}</caption>` + trs.join('') + '</table>'
        //return `<table><caption>${caption}</caption>` + trs.join('') + '</table>'
    }
    makePayWhenValueTable(address, isSend) {
        const targets = this.txs.filter(tx=>tx.isSend===isSend && tx.addresses===address).sort((a,b)=>b.blockTime - a.blockTime)
        return '<table>' + targets.map(t=>`<tr><td class="num">${this.#toMona(t.value - ((isSend) ? t.fee : 0))} MONA</td><td>${this.#makeTime(new Date(t.blockTime * 1000))}</td></tr>`).join('') + '</table>'
    }
    async makePayPeoples() {
        const partners = await this.dbs.get(this.my).dexie.sendPartners.toArray()
        return partners.sort((a,b)=>b.value - a.value)
    }
    async makeReceivedPeoples() {
        const partners = await this.dbs.get(this.my).dexie.receivePartners.toArray()
        return partners.sort((a,b)=>b.value - a.value)
    }
    getProfile(address) {
        const i = this.profiles.findIndex(p=>p.address===address)
        if (-1 == i) { return null }
        console.debug(this.profiles[i])
        if(typeof this.profiles[i].profile === 'string' || this.profiles[i].profile instanceof String) {
            this.profiles[i].profile = JSON.parse(this.profiles[i].profile)
        }
        return this.profiles[i]
    }
    #makeCalcTable(pays, receives) {
        const _pay = (0===pays.length) ? 0 : pays.map(p=>p.value).reduce((sum,v)=>sum+v)
        const _fee = (0===pays.length) ? 0 : this.txs.filter(tx=>tx.isSend).map(tx=>tx.fee).reduce((sum,v)=>sum+v)
        const _rec = (0===receives.length) ? 0 : receives.map(r=>r.value).reduce((sum,v)=>sum+v)
        const pay = this.#toMona(_pay + _fee)     // 支払総額＋手数料
        const fee = this.#toMona(_fee)            // 手数料
        const receive = this.#toMona(_rec)        // 受取総額
        const balance = this.#toMona(_rec - _pay - _fee) // 残高
        return `<table><caption><a href="https://github.com/trezor/blockbook/blob/master/docs/api.md#get-transaction">tx</a>から自力計算した結果</caption>
<tr><th>支払総額</th><td class="num"><span id="total-pay">${pay}</span> MONA</td></tr><tr><th>内手数料</th><td class="num">${fee} MONA</td></tr>
<tr><th>手数料比</th><td class="num">${((_fee/_pay)*100).toFixed(2)}%</td></tr>
<tr><th>受取総額</th><td class="num"><span id="total-receive">${receive}</span> MONA</td></tr>
<tr><th>残高</th><td class="num"><span id="balance">${balance}</span> MONA</td></tr></table>`
    }
    async #makeMpChainTable() { // https://nemlog.nem.social/blog/56861
        const adrrs = await window.mpurse.mpchain('address', {address: this.my});
        const balances = await window.mpurse.mpchain('balances', {address: this.my});
        let tokenKind = 0
        let tokenCount = 0
        if (0 < balances.total) {
            tokenKind = balances.data.length
            tokenCount = balances.data.map(d=>Number(d.quantity)).reduce((sum,v)=>sum+v)
        }
        const summary = `<table><caption><a href="https://github.com/tadajam/mpurse#mpchain">mpurse</a>経由<a href=>mpchain</a>取得値</caption>
<tr><th>残高 MONA</th><td class="num"><span id="mpchain-balance-mona">${adrrs.mona_balance}</span> MONA</td></tr>
<tr><th>残高 XMP</th><td class="num"><span id="mpchain-balance-xmp">${adrrs.xmp_balance}</span> XMP</td></tr>
<tr><th>残高 トークン種</th><td class="num"><span id="mpchain-balance-nft">${tokenKind}</span> 種</td></tr>
<tr><th>残高 トークン枚</th><td class="num"><span id="mpchain-balance-nft">${tokenCount}</span> 枚</td></tr></table>`
        const trs = []
        trs.push(`<tr><th>名前</th><th>枚数</th><th>見積額(MONA)</th><th>説明</th></tr>`)
        for (const balance of balances.data) {
            trs.push(`<tr><td>${balance.asset}</td><td>${balance.quantity}</td><td>${balance.estimated_value.mona}</td><td>${balance.description}</td></tr>`)
        }
        const details = `<details><summary>独自トークン一覧</summary><table><caption>独自トークン</caption>${trs.join('')}</table></details>`
        return summary + details
    }
}
